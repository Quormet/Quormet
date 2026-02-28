"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, documents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getAuthUser() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!dbUser || !dbUser.communityId) throw new Error("No community found");

    return dbUser;
}

export async function addDocument(formData: FormData) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can upload documents");

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

    await db.delete(documents).where(and(
        eq(documents.id, id),
        eq(documents.communityId, user.communityId!)
    ));

    revalidatePath("/documents");
}
