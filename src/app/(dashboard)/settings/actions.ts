"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communities, communityMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getAdminUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser) throw new Error("Unauthorized");

    // Determine active community from cookie
    const cookieStore = await cookies();
    const activeCookieVal = cookieStore.get("quormet_active_community")?.value;
    const communityId = activeCookieVal ? parseInt(activeCookieVal) : dbUser.communityId;
    if (!communityId) throw new Error("No community found");

    // Check admin role via community_members
    const [membership] = await db
        .select()
        .from(communityMembers)
        .where(and(
            eq(communityMembers.userId, dbUser.id),
            eq(communityMembers.communityId, communityId)
        ))
        .limit(1);

    if (!membership || membership.role !== "admin") throw new Error("Unauthorized");

    return { ...dbUser, communityId, role: membership.role };
}

export async function updateCommunitySettings(formData: FormData) {
    const user = await getAdminUser();
    const name = formData.get("name") as string;

    if (!name || name.trim().length < 2) {
        throw new Error("Community name is too short");
    }

    await db.update(communities)
        .set({ name })
        .where(eq(communities.id, user.communityId!));

    revalidatePath("/settings");
    revalidatePath("/home");
}
