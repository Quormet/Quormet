"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId || dbUser.role !== "admin") throw new Error("Unauthorized");

    return dbUser;
}

export async function updateCommunitySettings(formData: FormData) {
    const user = await getAuthUser();
    const name = formData.get("name") as string;

    if (!name || name.trim().length < 2) {
        throw new Error("Community name is too short");
    }

    await db.update(communities)
        .set({ name })
        .where(eq(communities.id, user.communityId!));

    revalidatePath("/settings");
    revalidatePath("/dashboard");
}
