import { db } from '@/db'
import { announcements, polls, events, users, payments, documents } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function executeTool(
    toolName: string,
    input: Record<string, any>,
    user: any
): Promise<{ success: boolean; data: any; type: string }> {
    try {
        switch (toolName) {
            case 'search_documents': {
                const docs = await db.select().from(documents).where(eq(documents.communityId, user.communityId));
                const q = (input.query || '').toLowerCase();
                const relevant = docs.filter((d: any) =>
                    d.name.toLowerCase().includes(q) ||
                    d.category?.toLowerCase().includes(q)
                );
                return { success: true, type: 'documents', data: relevant };
            }

            case 'create_announcement': {
                const [created] = await db.insert(announcements).values({
                    communityId: user.communityId,
                    authorId: user.id,
                    title: input.title,
                    body: input.body,
                }).returning();
                return { success: true, type: 'announcement', data: created };
            }

            case 'create_poll': {
                const [created] = await db.insert(polls).values({
                    communityId: user.communityId,
                    authorId: user.id,
                    question: input.question,
                    options: input.options,
                    endsAt: input.endsAt ? new Date(input.endsAt) : null,
                }).returning();
                return { success: true, type: 'poll', data: created };
            }

            case 'create_event': {
                const [created] = await db.insert(events).values({
                    communityId: user.communityId,
                    name: input.name,
                    description: input.description ?? '',
                    location: input.location ?? '',
                    startsAt: new Date(input.startsAt),
                }).returning();
                return { success: true, type: 'event', data: created };
            }

            case 'get_unpaid_members': {
                const allMembers = await db.select().from(users).where(eq(users.communityId, user.communityId));
                const paidPayments = await db.select().from(payments).where(eq(payments.communityId, user.communityId));
                const paidIds = new Set(paidPayments.map(p => p.userId));
                const unpaid = allMembers.filter(m => !paidIds.has(m.id));
                return { success: true, type: 'member_list', data: unpaid };
            }

            case 'get_my_dues_status': {
                const payment = await db.select().from(payments)
                    .where(and(
                        eq(payments.userId, user.id),
                        eq(payments.communityId, user.communityId)
                    ));
                return { success: true, type: 'dues_status', data: { paid: payment.length > 0, payments: payment } };
            }

            case 'get_events': {
                const upcoming = await db.select().from(events).where(eq(events.communityId, user.communityId));
                return { success: true, type: 'event_list', data: upcoming };
            }

            case 'get_polls': {
                const active = await db.select().from(polls).where(eq(polls.communityId, user.communityId));
                return { success: true, type: 'poll_list', data: active };
            }

            case 'get_non_voters': {
                return { success: true, type: 'member_list', data: [] }; // Implementation placeholder
            }

            case 'summarize_meeting_notes': {
                return { success: true, type: 'summary', data: { summary: "Meeting summarized based on provided notes." } }; // Implementation placeholder
            }

            default:
                return { success: false, type: 'error', data: { message: `Unknown tool: ${toolName}` } };
        }
    } catch (error: any) {
        return { success: false, type: 'error', data: { message: error.message } };
    }
}
