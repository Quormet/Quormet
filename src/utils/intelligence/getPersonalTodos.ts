import { db } from '@/db'
import { polls, votes, events, rsvps, payments, communities } from '@/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { format } from 'date-fns'

export type Todo = {
    id: string
    type: 'unvoted_poll' | 'unrsvpd_event' | 'unpaid_dues'
    title: string
    description: string
    href: string
    urgency: 'high' | 'medium' | 'low'
}

export async function getPersonalTodos(userId: number, communityId: number): Promise<Todo[]> {
    const todos: Todo[] = []
    const now = new Date()

    const [activePolls, userVotes, upcomingEvents, userRsvps, userPayment] = await Promise.all([
        // All active polls in this community
        db.select().from(polls).where(
            and(eq(polls.communityId, communityId), gt(polls.endsAt, now))
        ),

        // Polls this user has voted on
        db.select().from(votes).where(eq(votes.userId, userId)),

        // Upcoming events
        db.select().from(events).where(
            and(eq(events.communityId, communityId), gt(events.startsAt, now))
        ),

        // User's RSVPs
        db.select().from(rsvps).where(eq(rsvps.userId, userId)),

        // User's current dues payment
        db.select().from(payments).where(
            and(eq(payments.userId, userId), eq(payments.communityId, communityId))
        ),
    ])

    // Unvoted polls
    const votedPollIds = new Set(userVotes.map(v => v.pollId))
    const unvotedPolls = activePolls.filter(p => !votedPollIds.has(p.id))

    for (const poll of unvotedPolls) {
        const daysLeft = Math.ceil((new Date(poll.endsAt!).getTime() - now.getTime()) / 86400000)
        todos.push({
            id: `poll-${poll.id}`,
            type: 'unvoted_poll',
            title: `Vote on: "${poll.question}"`,
            description: `Closes in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
            href: `/polls`,
            urgency: daysLeft <= 1 ? 'high' : daysLeft <= 3 ? 'medium' : 'low',
        })
    }

    // Unrsvpd events
    const rsvpdEventIds = new Set(userRsvps.map(r => r.eventId))
    const unrsvpdEvents = upcomingEvents.filter(e => !rsvpdEventIds.has(e.id))

    for (const event of unrsvpdEvents) {
        todos.push({
            id: `event-${event.id}`,
            type: 'unrsvpd_event',
            title: `RSVP: ${event.name}`,
            description: `${format(new Date(event.startsAt), 'MMM d · h:mm a')}`,
            href: `/events`,
            urgency: 'low',
        })
    }

    // Unpaid dues
    const [community] = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1)
    if (userPayment.length === 0 && community && community.duesAmount > 0) {
        todos.push({
            id: 'dues',
            type: 'unpaid_dues',
            title: 'Annual dues unpaid',
            description: 'Pay before the deadline to avoid late fees',
            href: '/payments',
            urgency: 'high',
        })
    }

    // Sort: high → medium → low
    const urgencyOrder = { high: 0, medium: 1, low: 2 }
    return todos.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
}
