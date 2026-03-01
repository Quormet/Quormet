'use server'
import { db } from '@/db'
import { issues, issueUpdates, vendorRatings, vendors, users } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { revalidatePath } from 'next/cache'

// Submit a new issue (any member)
export async function submitIssue(formData: FormData) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const [created] = await db.insert(issues).values({
        communityId: user.communityId!,
        reportedBy: user.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        location: formData.get('location') as string,
        photoUrl: formData.get('photoUrl') as string | null,
        status: 'submitted',
    }).returning()

    // Log the initial status
    await db.insert(issueUpdates).values({
        issueId: created.id,
        updatedBy: user.id,
        previousStatus: null,
        newStatus: 'submitted',
        note: 'Issue received.',
    })

    revalidatePath('/issues')
    return created
}

// Update issue status (admin only)
export async function updateIssueStatus(
    issueId: string,
    newStatus: string,
    note?: string,
    vendorId?: string
) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') throw new Error('Forbidden')

    const [current] = await db.select().from(issues).where(eq(issues.id, issueId))
    if (!current) throw new Error('Issue not found')

    await db.update(issues)
        .set({
            status: newStatus,
            assignedVendorId: vendorId ?? current.assignedVendorId,
            updatedAt: new Date(),
        })
        .where(eq(issues.id, issueId))

    await db.insert(issueUpdates).values({
        issueId,
        updatedBy: user.id,
        previousStatus: current.status,
        newStatus,
        note: note ?? null,
    })

    revalidatePath(`/issues/${issueId}`)
    revalidatePath('/issues')
}

// Get all issues (admin) or own issues (member)
export async function getIssues() {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    if (user.role === 'admin') {
        return db.select({
            issue: issues,
            reporterName: users.name,
            vendorName: vendors.name,
        }).from(issues)
            .leftJoin(users, eq(issues.reportedBy, users.id))
            .leftJoin(vendors, eq(issues.assignedVendorId, vendors.id))
            .where(eq(issues.communityId, user.communityId!))
            .orderBy(desc(issues.createdAt))
    }

    return db.select({
        issue: issues,
        reporterName: users.name,
        vendorName: vendors.name,
    }).from(issues)
        .leftJoin(users, eq(issues.reportedBy, users.id))
        .leftJoin(vendors, eq(issues.assignedVendorId, vendors.id))
        .where(and(
            eq(issues.communityId, user.communityId!),
            eq(issues.reportedBy, user.id)
        ))
        .orderBy(desc(issues.createdAt))
}

// Get single issue with updates
export async function getIssue(id: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const [issueData] = await db.select({
        issue: issues,
        reporterName: users.name,
        vendorName: vendors.name,
    }).from(issues)
        .leftJoin(users, eq(issues.reportedBy, users.id))
        .leftJoin(vendors, eq(issues.assignedVendorId, vendors.id))
        .where(eq(issues.id, id))

    if (!issueData) throw new Error('Issue not found')

    const updates = await db.select().from(issueUpdates)
        .where(eq(issueUpdates.issueId, id))
        .orderBy(issueUpdates.createdAt)

    return { issue: issueData.issue, reporterName: issueData.reporterName, vendorName: issueData.vendorName, updates }
}

// Submit vendor rating (member, resolved issues only)
export async function submitVendorRating(
    issueId: string,
    vendorId: string,
    rating: number,
    comment?: string
) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    await db.insert(vendorRatings).values({
        vendorId,
        issueId,
        ratedBy: user.id,
        rating,
        comment: comment ?? null,
    })

    revalidatePath(`/issues/${issueId}`)
}

export async function getVendors() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') throw new Error('Forbidden')

    return db.select().from(vendors)
        .where(eq(vendors.communityId, user.communityId!))
        .orderBy(vendors.name)
}
