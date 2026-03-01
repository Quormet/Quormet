"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communities, payments, communityMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getPlanAccess } from "@/utils/planAccess";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import Stripe from "stripe";
async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser) throw new Error("No user found");

    // Determine active community from cookie
    const cookieStore = await cookies();
    const activeCookieVal = cookieStore.get("quormet_active_community")?.value;
    const communityId = activeCookieVal ? parseInt(activeCookieVal) : dbUser.communityId;
    if (!communityId) throw new Error("No community found");

    // Resolve role from community_members
    const [membership] = await db
        .select()
        .from(communityMembers)
        .where(and(
            eq(communityMembers.userId, dbUser.id),
            eq(communityMembers.communityId, communityId)
        ))
        .limit(1);

    return { ...dbUser, communityId, role: membership?.role ?? dbUser.role };
}

export async function createCheckoutSession() {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: "2024-06-20",
    } as any);

    const user = await getAuthUser();
    const [community] = await db.select().from(communities).where(eq(communities.id, user.communityId!)).limit(1);

    if (!community || community.duesAmount <= 0) {
        throw new Error("Dues amount is not set for this community");
    }

    const headersList = await headers();
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `${community.name} - ${community.duesPeriod.charAt(0).toUpperCase() + community.duesPeriod.slice(1)} Dues`,
                    },
                    unit_amount: community.duesAmount, // in cents
                },
                quantity: 1,
            },
        ],
        metadata: {
            userId: user.id.toString(),
            communityId: community.id.toString(),
        },
        success_url: `${origin}/payments?success=true`,
        cancel_url: `${origin}/payments?canceled=true`,
    });

    if (!session.url) {
        throw new Error("Failed to create Stripe session");
    }

    redirect(session.url);
}

export async function updateCommunityDues(formData: FormData) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can update dues");

    const planAccess = await getPlanAccess();
    if (!planAccess?.canManageDues) throw new Error("Your plan does not support managing dues");

    const amountStr = formData.get("amount") as string;
    const period = formData.get("period") as string;

    const amountDollars = parseFloat(amountStr);
    if (isNaN(amountDollars) || amountDollars < 0) throw new Error("Invalid amount");

    const amountCents = Math.round(amountDollars * 100);

    await db.update(communities)
        .set({ duesAmount: amountCents, duesPeriod: period })
        .where(eq(communities.id, user.communityId!));

    revalidatePath("/payments");
}

export async function markUserPaid(userIdToMark: number, isPaid: boolean) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can manually mark users as paid");

    const planAccess = await getPlanAccess();
    if (!planAccess?.canManageDues) throw new Error("Your plan does not support managing dues");

    // Validate user belongs to community via community_members
    const [targetMembership] = await db
        .select()
        .from(communityMembers)
        .where(and(
            eq(communityMembers.userId, userIdToMark),
            eq(communityMembers.communityId, user.communityId!)
        ))
        .limit(1);
    if (!targetMembership) {
        throw new Error("Invalid user");
    }

    await db.update(communityMembers)
        .set({ duesPaid: isPaid })
        .where(and(
            eq(communityMembers.userId, userIdToMark),
            eq(communityMembers.communityId, user.communityId!)
        ));

    if (isPaid) {
        // Record manual payment
        const [community] = await db.select().from(communities).where(eq(communities.id, user.communityId!)).limit(1);
        await db.insert(payments).values({
            userId: userIdToMark,
            communityId: user.communityId!,
            amount: community?.duesAmount || 0,
            stripeSessionId: "manual_override",
        });
    }

    revalidatePath("/payments");
}
