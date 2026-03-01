'use server'

import { getCurrentUser } from '@/utils/getCurrentUser'
import { db } from '@/db'
import { users, announcements, polls, events, votes, rsvps, communities } from '@/db/schema'
import { eq, desc, count, and, gte, isNull } from 'drizzle-orm'

export async function getDashboardData() {
    const user = await getCurrentUser()
    if (!user || !user.communityId) {
        throw new Error('Unauthorized or no community')
    }
    const communityId = user.communityId

    // Fetch Community object for the name
    const [community] = await db.select().from(communities).where(eq(communities.id, communityId))

    const now = new Date()

    const [
        announcementsData,
        pollsData,
        eventsData,
        memberCountData,
        paymentStatsData,
        userVotesData,
        userRsvpsData
    ] = await Promise.all([
        db.select().from(announcements)
            .where(eq(announcements.communityId, communityId))
            .orderBy(desc(announcements.createdAt))
            .limit(3),

        db.select().from(polls)
            .where(and(
                eq(polls.communityId, communityId),
                // Active polls: endsAt is null OR endsAt > now
                // Drizzle doesn't have a simple OR for this without sql``, so we'll fetch all and filter in JS for now since limit is small,
                // Wait, active polls = endsAt > now OR endsAt is null
            ))
            .orderBy(desc(polls.createdAt)),

        db.select().from(events)
            .where(and(
                eq(events.communityId, communityId),
                gte(events.startsAt, now)
            ))
            .orderBy(desc(events.startsAt))
            .limit(3),

        db.select({ count: count() }).from(users)
            .where(eq(users.communityId, communityId)),

        db.select({ count: count(), paid: users.duesPaid }).from(users)
            .where(eq(users.communityId, communityId))
            .groupBy(users.duesPaid),

        db.select().from(votes).where(eq(votes.userId, user.id)),
        db.select().from(rsvps).where(eq(rsvps.userId, user.id))
    ])

    // Filter active polls
    const activePolls = pollsData.filter(p => !p.endsAt || new Date(p.endsAt) > now).slice(0, 3)

    const memberCount = memberCountData[0]?.count || 0
    const paidCount = paymentStatsData.find(p => p.paid)?.count || 0
    const unpaidCount = paymentStatsData.find(p => !p.paid)?.count || 0

    return {
        user,
        communityName: community?.name || 'Your Community',
        announcements: announcementsData,
        polls: activePolls,
        events: eventsData,
        stats: {
            memberCount,
            eventCount: eventsData.length,
            activePollsCount: activePolls.length,
            paidCount,
            totalCount: memberCount
        },
        userVotes: userVotesData.map(v => v.pollId),
        userRsvps: userRsvpsData
    }
}
