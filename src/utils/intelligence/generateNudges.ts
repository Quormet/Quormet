import { db } from '@/db'
import { polls, issues, events, users, payments } from '@/db/schema'
import { eq, and, lt, gt, isNull, count } from 'drizzle-orm'
import { subDays, addDays } from 'date-fns'

export type Nudge = {
    id: string
    type: 'poll_closing' | 'dues_overdue' | 'stale_issue' | 'poll_passed' | 'no_events' | 'new_member'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    actions: { label: string; href?: string; action?: string }[]
    data: Record<string, any>
}

export async function generateNudges(communityId: number): Promise<Nudge[]> {
    const nudges: Nudge[] = []
    const now = new Date()

    const [
        closingPolls,
        overdueIssues,
        passedPolls,
        upcomingEvents,
        memberCount,
        paidCount,
    ] = await Promise.all([
        // Polls closing in the next 48 hours
        db.select().from(polls).where(
            and(
                eq(polls.communityId, communityId),
                lt(polls.endsAt, addDays(now, 2)),
                gt(polls.endsAt, now)  // not yet closed
            )
        ),

        // Issues stuck in same status for 14+ days
        db.select().from(issues).where(
            and(
                eq(issues.communityId, communityId),
                lt(issues.updatedAt, subDays(now, 14)),
                // not resolved handled below
            )
        ),

        // Closed polls with no announcement posted
        db.select().from(polls).where(
            and(
                eq(polls.communityId, communityId),
                lt(polls.endsAt, now),
                eq(polls.announcementPosted, false)
            )
        ),

        // Events in next 30 days
        db.select().from(events).where(
            and(
                eq(events.communityId, communityId),
                gt(events.startsAt, now),
                lt(events.startsAt, addDays(now, 30))
            )
        ),

        // Total members
        db.select({ count: count() }).from(users)
            .where(eq(users.communityId, communityId)),

        // Paid members
        db.select({ count: count() }).from(payments)
            .where(eq(payments.communityId, communityId)),
    ])

    // Poll closing nudge
    for (const poll of closingPolls) {
        nudges.push({
            id: `poll-closing-${poll.id}`,
            type: 'poll_closing',
            priority: 'high',
            title: 'Poll closing soon',
            description: `"${poll.question}" closes in less than 2 days.`,
            actions: [
                { label: 'View Poll', href: `/polls` },
            ],
            data: { pollId: poll.id, question: poll.question },
        })
    }

    // Stale issue nudge
    for (const issue of overdueIssues) {
        if (issue.status === 'resolved') continue
        nudges.push({
            id: `stale-issue-${issue.id}`,
            type: 'stale_issue',
            priority: 'medium',
            title: 'Issue needs attention',
            description: `"${issue.title}" has been in ${issue.status.replace('_', ' ')} for over 2 weeks.`,
            actions: [
                { label: 'View Issue', href: `/issues/${issue.id}` },
                { label: 'Update Status', href: `/issues/${issue.id}` },
            ],
            data: { issueId: issue.id, status: issue.status },
        })
    }

    // Poll passed nudge
    for (const poll of passedPolls) {
        nudges.push({
            id: `poll-passed-${poll.id}`,
            type: 'poll_passed',
            priority: 'medium',
            title: 'Poll result ready to announce',
            description: `"${poll.question}" has closed. Post the results to the community.`,
            actions: [
                { label: 'View Results', href: `/polls` },
            ],
            data: { pollId: poll.id, question: poll.question },
        })
    }

    // Dues nudge
    const total = Number(memberCount[0]?.count ?? 0)
    const paid = Number(paidCount[0]?.count ?? 0)
    const unpaid = total - paid
    if (unpaid > 0) {
        nudges.push({
            id: 'dues-unpaid',
            type: 'dues_overdue',
            priority: unpaid > total / 2 ? 'high' : 'medium',
            title: 'Dues collection incomplete',
            description: unpaid === 1
                ? `1 member hasn't paid dues yet.`
                : `${unpaid} of ${total} members haven't paid dues yet.`,
            actions: [
                { label: 'View Unpaid', href: '/dues' },
            ],
            data: { unpaid, total },
        })
    }

    // No upcoming events nudge
    if (upcomingEvents.length === 0) {
        nudges.push({
            id: 'no-events',
            type: 'no_events',
            priority: 'low',
            title: 'No events scheduled',
            description: 'No events in the next 30 days. Regular events increase member engagement.',
            actions: [
                { label: 'Create an Event', href: '/events' },
            ],
            data: {},
        })
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return nudges.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}
