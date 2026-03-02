"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { communityMembers, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { createClient } from "@/utils/supabase/server";

/**
 * Sets the active community for the current session.
 * Verifies the user is actually a member of the requested community.
 */
export async function setActiveCommunity(communityId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser) throw new Error("User not found");

    // Verify the user is actually a member of this community
    const [membership] = await db
        .select()
        .from(communityMembers)
        .where(and(
            eq(communityMembers.userId, dbUser.id),
            eq(communityMembers.communityId, communityId)
        ))
        .limit(1);

    if (!membership) throw new Error("You are not a member of this community");

    const cookieStore = await cookies();
    cookieStore.set("quorify_active_community", String(communityId), {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidatePath("/", "layout");
}
