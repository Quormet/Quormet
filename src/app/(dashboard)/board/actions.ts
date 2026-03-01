'use server'

import { db } from '@/db'
import { helpRequests, helpOffers, users } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { revalidatePath } from 'next/cache'

export async function getHelpRequests() {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    return db.select().from(helpRequests)
        .where(and(
            eq(helpRequests.communityId, user.communityId!),
        ))
        .orderBy(desc(helpRequests.createdAt))
}

export async function submitHelpRequest(
    title: string,
    description: string,
    tags: string[],
    neededBy?: Date
) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    await db.insert(helpRequests).values({
        communityId: user.communityId!,
        requestedBy: user.id,
        title,
        description,
        tags,
        neededBy: neededBy ?? null,
    })

    revalidatePath('/help')
}

export async function offerHelp(requestId: string, message?: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    await db.insert(helpOffers).values({
        requestId,
        offeredBy: user.id,
        message: message ?? null,
    })

    revalidatePath('/help')
}

export async function resolveRequest(requestId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    await db.update(helpRequests)
        .set({ isResolved: true })
        .where(and(
            eq(helpRequests.id, requestId),
            eq(helpRequests.requestedBy, user.id)
        ))

    revalidatePath('/help')
}

export async function getMatchingNeighbors(tags: string[]) {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const members = await db.select().from(users)
        .where(eq(users.communityId, user.communityId!))

    // Filter members whose tags overlap with the request tags
    return members.filter(m =>
        m.skills?.some((skill: string) =>
            tags.some(tag =>
                skill.toLowerCase().includes(tag.toLowerCase())
            )
        )
    )
}
