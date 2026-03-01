/**
 * Provides server actions for the onboarding flow, allowing users to create new 
 * communities as admins, join existing ones via codes or search, and manage 
 * their initial profile setup.
 */
"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { communities, users } from "@/db/schema";
import { eq, ilike, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

function generateJoinCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createCommunity(formData: FormData) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (!user) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const address = formData.get("address") as string; 
    if (!name || name.length < 3 || name.length > 50) throw new Error("Community name must be between 3 and 50 characters");

    const joinCode = generateJoinCode();
    const [newCommunity] = await db.insert(communities).values({
        name,
        joinCode,
    }).returning();

    const primaryEmail = user.email || "no-email@example.com";
    const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || "Community Member") as string;

    await db.insert(users).values({
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
    });

    return { joinCode };
}

export async function joinCommunity(formData: FormData) {
    const cookieStore = await cookies();
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const code = formData.get("code") as string;
    if (!code) throw new Error("Join code is required");

    const [community] = await db.select().from(communities).where(eq(communities.joinCode, code.toUpperCase())).limit(1);
    if (!community) throw new Error("Invalid join code");

    const primaryEmail = user.email || "no-email@example.com";
    const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || "Community Member") as string;

    await db.insert(users).values({
        supabaseId: user.id,
        name: fullName,
        email: primaryEmail,
        role: "member",
        communityId: community.id,
    }).onConflictDoUpdate({
        target: users.supabaseId,
        set: {
            communityId: community.id,
            role: "member",
            name: fullName,
            email: primaryEmail,
        }
    });

    redirect("/dashboard");
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

    await db.insert(users).values({
        supabaseId: user.id,
        name: fullName,
        email: primaryEmail,
        role: "member",
        communityId: community.id,
    }).onConflictDoUpdate({
        target: users.supabaseId,
        set: {
            communityId: community.id,
            role: "member",
            name: fullName,
            email: primaryEmail,
        }
    });

    redirect("/dashboard");
}
