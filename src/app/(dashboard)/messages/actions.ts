"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communityMembers, messages } from "@/db/schema";
import { eq, and, or, sql, lt, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const MESSAGE_RETENTION_DAYS = 30;

async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser) throw new Error("No user found");

    const cookieStore = await cookies();
    const activeCookieVal = cookieStore.get("quorify_active_community")?.value;
    const communityId = activeCookieVal ? parseInt(activeCookieVal) : dbUser.communityId;
    if (!communityId) throw new Error("No community found");

    const [membership] = await db.select().from(communityMembers)
        .where(and(eq(communityMembers.userId, dbUser.id), eq(communityMembers.communityId, communityId)))
        .limit(1);

    return { ...dbUser, communityId, role: membership?.role ?? dbUser.role };
}

/**
 * Send a message to a community member. Redirects to the thread on success.
 */
export async function sendMessage(formData: FormData) {
    const user = await getAuthUser();

    const recipientId = parseInt(formData.get("recipientId") as string);
    const body = (formData.get("body") as string)?.trim();
    if (!recipientId || !body) throw new Error("Recipient and message body required");

    // Verify recipient is in the same community
    const [recipientMember] = await db.select()
        .from(communityMembers)
        .where(and(
            eq(communityMembers.userId, recipientId),
            eq(communityMembers.communityId, user.communityId!)
        ))
        .limit(1);

    if (!recipientMember) throw new Error("Recipient not part of your community");

    await db.insert(messages).values({
        communityId: user.communityId!,
        senderId: user.id,
        recipientId,
        body,
    });

    revalidatePath(`/messages/${recipientId}`);
    redirect(`/messages/${recipientId}`);
}

/**
 * Delete a specific message. Only sender or recipient may delete.
 * Redirects back to the thread after deletion.
 */
export async function deleteMessage(id: number, partnerId: number) {
    const user = await getAuthUser();
    await db.delete(messages)
        .where(and(
            eq(messages.id, id),
            or(eq(messages.senderId, user.id), eq(messages.recipientId, user.id))
        ));
    revalidatePath(`/messages/${partnerId}`);
    redirect(`/messages/${partnerId}`);
}

/**
 * Returns a list of distinct conversation partners for the current user,
 * with the most recent message and timestamp for preview.
 */
export async function getConversations() {
    const user = await getAuthUser();

    // Get all messages involving the current user, ordered by most recent
    const allMessages = await db.select({
        id: messages.id,
        senderId: messages.senderId,
        recipientId: messages.recipientId,
        body: messages.body,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
    })
        .from(messages)
        .where(and(
            eq(messages.communityId, user.communityId!),
            or(eq(messages.senderId, user.id), eq(messages.recipientId, user.id))
        ))
        .orderBy(desc(messages.createdAt));

    // Build maps: partnerId → { lastMessage, lastAt } and unread count
    const convMap = new Map<number, { lastBody: string; lastAt: Date }>();
    const unreadMap = new Map<number, number>();
    for (const m of allMessages) {
        const partnerId = m.senderId === user.id ? m.recipientId : m.senderId;
        if (!convMap.has(partnerId)) {
            convMap.set(partnerId, { lastBody: m.body, lastAt: new Date(m.createdAt) });
        }
        // count unread messages where the current user is the recipient
        if (m.recipientId === user.id && !m.isRead) {
            const prev = unreadMap.get(m.senderId) || 0;
            unreadMap.set(m.senderId, prev + 1);
        }
    }

    if (convMap.size === 0) return { conversations: [], currentUserId: user.id };

    // Fetch partner user details
    const partnerIds = Array.from(convMap.keys());
    const partners = await db.select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(sql`${users.id} = ANY(ARRAY[${sql.join(partnerIds.map(id => sql`${id}`), sql`, `)}]::int[])`);

    const conversations = partners.map(p => ({
        ...p,
        lastBody: convMap.get(p.id)!.lastBody,
        lastAt: convMap.get(p.id)!.lastAt,
        unreadCount: unreadMap.get(p.id) || 0,
    })).sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());

    return { conversations, currentUserId: user.id };
}

/**
 * Returns all messages in the thread between the current user and a partner.
 */
export async function getThread(partnerId: number) {
    const user = await getAuthUser();

    // mark any unread messages from partner as read
    await db.update(messages)
        .set({ isRead: true })
        .where(and(
            eq(messages.communityId, user.communityId!),
            eq(messages.recipientId, user.id),
            eq(messages.senderId, partnerId),
            eq(messages.isRead, false)
        ));

    const thread = await db.select({
        id: messages.id,
        senderId: messages.senderId,
        body: messages.body,
        createdAt: messages.createdAt,
    })
        .from(messages)
        .where(and(
            eq(messages.communityId, user.communityId!),
            or(
                and(eq(messages.senderId, user.id), eq(messages.recipientId, partnerId)),
                and(eq(messages.senderId, partnerId), eq(messages.recipientId, user.id))
            )
        ))
        .orderBy(messages.createdAt);

    const [partner] = await db.select({ id: users.id, name: users.name, email: users.email })
        .from(users).where(eq(users.id, partnerId));

    return { thread, currentUserId: user.id, partner };
}

/**
 * Returns all community members except the current user, for starting a new chat.
 */
export async function getCommunityMembers() {
    const user = await getAuthUser();

    const members = await db.select({ id: users.id, name: users.name, email: users.email })
        .from(communityMembers)
        .innerJoin(users, eq(users.id, communityMembers.userId))
        .where(and(
            eq(communityMembers.communityId, user.communityId!),
            sql`${users.id} != ${user.id}`
        ));

    return members;
}

/**
 * Cleanup old messages older than 30 days.
 */
export async function purgeOldMessages() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MESSAGE_RETENTION_DAYS);
    await db.delete(messages).where(lt(messages.createdAt, cutoff));
}
