/**
 * Provides server actions for the onboarding flow, allowing users to create new 
 * communities as admins, join existing ones via codes or search, and manage 
 * their initial profile setup.
 */
"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { communities, users, communityMembers, notifications } from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { redirect } from "next/navigation";

function generateJoinCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createCommunity(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const communityType = (formData.get("communityType") as string) || "default";
    if (!name || name.length < 3 || name.length > 50) throw new Error("Community name must be between 3 and 50 characters");

    const joinCode = generateJoinCode();
    const [newCommunity] = await db.insert(communities).values({
        name,
        joinCode,
        communityType,
    }).returning();

    const primaryEmail = user.email || "no-email@example.com";
    const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || "Community Member") as string;

    // Upsert the user record
    const [dbUser] = await db.insert(users).values({
        supabaseId: user.id,
        name: fullName,
        email: primaryEmail,
        role: "admin",
        communityId: newCommunity.id,
        address: address,
    }).onConflictDoUpdate({
        target: users.supabaseId,
        set: {
            communityId: newCommunity.id,
            role: "admin",
            name: fullName,
            email: primaryEmail,
            address: address,
        }
    }).returning();

    // Add to community_members junction table as admin
    await db.insert(communityMembers).values({
        userId: dbUser.id,
        communityId: newCommunity.id,
        role: "admin",
    }).onConflictDoNothing();

    return { joinCode };
}

export async function joinCommunity(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const code = formData.get("code") as string;
    if (!code) throw new Error("Join code is required");

    const [community] = await db.select().from(communities).where(eq(communities.joinCode, code.toUpperCase())).limit(1);
    if (!community) throw new Error("Invalid join code");

    const primaryEmail = user.email || "no-email@example.com";
    const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || "Community Member") as string;

    // Upsert the user (without overwriting communityId if they're already in communities)
    const [dbUser] = await db.insert(users).values({
        supabaseId: user.id,
        name: fullName,
        email: primaryEmail,
        role: "member",
        communityId: community.id,
    }).onConflictDoUpdate({
        target: users.supabaseId,
        set: {
            name: fullName,
            email: primaryEmail,
            // Update communityId to the joined community so legacy fallback works
            communityId: community.id,
        }
    }).returning();

    // Add to community_members — if already a member, do nothing (don't downgrade role)
    const [member] = await db.insert(communityMembers).values({
        userId: dbUser.id,
        communityId: community.id,
        role: "member",
    }).onConflictDoNothing().returning();

    if (member) {
        await db.insert(notifications).values({
            userId: dbUser.id,
            type: 'welcome',
            title: `Welcome to ${community.name}!`,
            body: `You're now a member. Check out the community rules in the Document Vault, vote on any open polls, and introduce yourself in the directory.`,
            href: '/home',
        });
    }

    redirect("/home");
}

export async function searchCommunities(query: string) {
    if (!query || query.length < 2) return [];

    const results = await db.select({
        id: communities.id,
        name: communities.name,
    })
        .from(communities)
        .where(ilike(communities.name, `%${query}%`))
        .limit(5);

    return results;
}

export async function joinCommunityById(communityId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const [community] = await db.select().from(communities).where(eq(communities.id, communityId)).limit(1);
    if (!community) throw new Error("Community not found");

    const primaryEmail = user.email || "no-email@example.com";
    const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || "Community Member") as string;

    const [dbUser] = await db.insert(users).values({
        supabaseId: user.id,
        name: fullName,
        email: primaryEmail,
        role: "member",
        communityId: community.id,
    }).onConflictDoUpdate({
        target: users.supabaseId,
        set: {
            name: fullName,
            email: primaryEmail,
            communityId: community.id,
        }
    }).returning();

    // Add to community_members if not already a member
    const [member] = await db.insert(communityMembers).values({
        userId: dbUser.id,
        communityId: community.id,
        role: "member",
    }).onConflictDoNothing().returning();

    if (member) {
        await db.insert(notifications).values({
            userId: dbUser.id,
            type: 'welcome',
            title: `Welcome to ${community.name}!`,
            body: `You're now a member. Check out the community rules in the Document Vault, vote on any open polls, and introduce yourself in the directory.`,
            href: '/home',
        });
    }

    redirect("/home");
}
