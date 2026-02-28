"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { communities, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

function generateJoinCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createCommunity(formData: FormData) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    if (!name) throw new Error("Community name is required");

    // Create community
    const joinCode = generateJoinCode();
    const [newCommunity] = await db.insert(communities).values({
        name,
        joinCode,
    }).returning();

    // Upsert user as admin
    const primaryEmail = user.emailAddresses[0]?.emailAddress || "no-email@example.com";
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || primaryEmail;

    await db.insert(users).values({
        clerkId: userId,
        communityId: newCommunity.id,
        role: "admin",
        name: fullName,
        email: primaryEmail,
    }).onConflictDoUpdate({
        target: users.clerkId,
        set: {
            communityId: newCommunity.id,
            role: "admin",
            name: fullName,
            email: primaryEmail,
        }
    });

    redirect("/dashboard");
}

export async function joinCommunity(formData: FormData) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const code = formData.get("code") as string;
    if (!code) throw new Error("Join code is required");

    // Find community by code
    const [community] = await db.select().from(communities).where(eq(communities.joinCode, code.toUpperCase())).limit(1);
    if (!community) throw new Error("Invalid join code");

    // Upsert user as member
    const primaryEmail = user.emailAddresses[0]?.emailAddress || "no-email@example.com";
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || primaryEmail;

    await db.insert(users).values({
        clerkId: userId,
        communityId: community.id,
        role: "member",
        name: fullName,
        email: primaryEmail,
    }).onConflictDoUpdate({
        target: users.clerkId,
        set: {
            communityId: community.id,
            role: "member",
            name: fullName,
            email: primaryEmail,
        }
    });

    redirect("/dashboard");
}
