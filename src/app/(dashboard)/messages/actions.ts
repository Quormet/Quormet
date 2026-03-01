"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communityMembers, messages } from "@/db/schema";
import { eq, and, or, sql, lt } from "drizzle-orm";
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
    const activeCookieVal = cookieStore.get("quormet_active_community")?.value;
    const communityId = activeCookieVal ? parseInt(activeCookieVal) : dbUser.communityId;
    if (!communityId) throw new Error("No community found");

    const [membership] = await db.select().from(communityMembers)
        .where(and(eq(communityMembers.userId, dbUser.id), eq(communityMembers.communityId, communityId)))
        .limit(1);

    return { ...dbUser, communityId, role: membership?.role ?? dbUser.role };
}

/**
 * send a message addressed to one member of the community
 */
export async function sendMessage(formData: FormData) {
    const user = await getAuthUser();

    const recipientId = parseInt(formData.get("recipientId") as string);
    const body = formData.get("body") as string;
    if (!recipientId || !body) throw new Error("Recipient and message body required");

    // verify recipient is same community
    const [recipientMember] = await db.select()
        .from(communityMembers)
        .where(and(
            eq(communityMembers.userId, recipientId),
            eq(communityMembers.communityId, user.communityId!)
        ))
        .limit(1);

    if (!recipientMember) {
        throw new Error("Recipient not part of your community");
    }

    await db.insert(messages).values({
        communityId: user.communityId!,
        senderId: user.id,
        recipientId,
        body,
    });

    revalidatePath("/messages");
    redirect("/messages");
}

/**
 * delete a specific message (sender or recipient may delete)
 */
export async function deleteMessage(id: number) {
    const user = await getAuthUser();
    await db.delete(messages)
        .where(and(
            eq(messages.id, id),
            or(eq(messages.senderId, user.id), eq(messages.recipientId, user.id))
        ));
    revalidatePath("/messages");
    redirect("/messages");
}

/**
 * cleanup old messages older than retention window; called during listing
 */
export async function purgeOldMessages() {
    // compute threshold date in JavaScript to avoid raw SQL
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MESSAGE_RETENTION_DAYS);
    await db.delete(messages).where(lt(messages.createdAt, cutoff));
}
