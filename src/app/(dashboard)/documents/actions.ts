"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, documents, communityMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getPlanAccess } from "@/utils/planAccess";
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
    const activeCookieVal = cookieStore.get("quormet_active_community")?.value;
    const communityId = activeCookieVal ? parseInt(activeCookieVal) : dbUser.communityId;
    if (!communityId) throw new Error("No community found");

    const [membership] = await db.select().from(communityMembers)
        .where(and(eq(communityMembers.userId, dbUser.id), eq(communityMembers.communityId, communityId)))
        .limit(1);

    return { ...dbUser, communityId, role: membership?.role ?? dbUser.role };
}

export async function addDocument(formData: FormData) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can upload documents");

    const planAccess = await getPlanAccess();
    if (!planAccess?.canManageDocuments) throw new Error("Your plan does not support adding documents");

    const name = formData.get("name") as string;
    const category = formData.get("category") as string || "general";
    const fileUrl = formData.get("fileUrl") as string;

    if (!name || !fileUrl) throw new Error("Name and file URL are required");

    await db.insert(documents).values({
        communityId: user.communityId!,
        uploadedBy: user.id,
        name,
        category,
        fileUrl,
    });

    revalidatePath("/documents");
}

export async function deleteDocument(id: number) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can delete documents");

    const planAccess = await getPlanAccess();
    if (!planAccess?.canManageDocuments) throw new Error("Your plan does not support deleting documents");

    await db.delete(documents).where(and(
        eq(documents.id, id),
        eq(documents.communityId, user.communityId!)
    ));

    revalidatePath("/documents");
}
