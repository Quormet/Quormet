"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, communities, payments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Stripe from "stripe";
async function getAuthUser() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!dbUser || !dbUser.communityId) throw new Error("No community found");

    return dbUser;
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
        success_url: `${origin}/dues?success=true`,
        cancel_url: `${origin}/dues?canceled=true`,
    });

    if (!session.url) {
        throw new Error("Failed to create Stripe session");
    }

    redirect(session.url);
}

export async function updateCommunityDues(formData: FormData) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can update dues");

    const amountStr = formData.get("amount") as string;
    const period = formData.get("period") as string;

    const amountDollars = parseFloat(amountStr);
    if (isNaN(amountDollars) || amountDollars < 0) throw new Error("Invalid amount");

    const amountCents = Math.round(amountDollars * 100);

    await db.update(communities)
        .set({ duesAmount: amountCents, duesPeriod: period })
        .where(eq(communities.id, user.communityId!));

    revalidatePath("/dues");
}

export async function markUserPaid(userIdToMark: number, isPaid: boolean) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can manually mark users as paid");

    // Validate user belongs to community
    const [targetUser] = await db.select().from(users).where(eq(users.id, userIdToMark)).limit(1);
    if (!targetUser || targetUser.communityId !== user.communityId) {
        throw new Error("Invalid user");
    }

    await db.update(users)
        .set({ duesPaid: isPaid })
        .where(eq(users.id, userIdToMark));

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

    revalidatePath("/dues");
}
