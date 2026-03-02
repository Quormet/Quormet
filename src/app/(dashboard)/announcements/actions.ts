/**
 * Provides server actions for community announcements, allowing administrators 
 * to create and delete posts while ensuring community-level access control.
 */
"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, announcements, communityMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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

export async function createAnnouncement(formData: FormData) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can post announcements");

    const title = formData.get("title") as string;
    const body = formData.get("body") as string;

    // Fallback to active community cookie if needed
    const cookieStore = await cookies();
    const activeCookieVal = cookieStore.get("quorify_active_community")?.value;
    const communityId = activeCookieVal ? parseInt(activeCookieVal) : user.communityId;

    if (!communityId) throw new Error("Community context is required");
    if (!title || !body) throw new Error("Title and body are required");

    await db.insert(announcements).values({
        communityId: communityId,
        authorId: user.id,
        title,
        body,
    });

    revalidatePath("/announcements");
    return { success: true };
}

export async function deleteAnnouncement(id: number) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can delete announcements");

    await db.delete(announcements).where(and(
        eq(announcements.id, id),
        eq(announcements.communityId, user.communityId!)
    ));

    revalidatePath("/announcements");
}

export async function approveAnnouncement(id: number) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can approve announcements");

    await db.update(announcements).set({ isDraft: false }).where(and(
        eq(announcements.id, id),
        eq(announcements.communityId, user.communityId!)
    ));

    revalidatePath("/announcements");
}
