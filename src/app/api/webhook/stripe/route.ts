import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/db";
import { communities, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
        apiVersion: "2026-02-25.clover" as any,
    });

    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (subscription.metadata?.plan === "community") {
            const communityId = parseInt(subscription.metadata.communityId);

            await db.update(communities)
                .set({
                    plan: "community",
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: subscription.customer as string,
                    planExpiresAt: new Date((subscription as any).current_period_end * 1000),
                    planMemberLimit: 100,
                })
                .where(eq(communities.id, communityId));
        } else if (subscription.metadata?.plan === "member_pro") {
            const userId = parseInt(subscription.metadata.userId);

            await db.update(users)
                .set({
                    individualPlan: "member_pro",
                    individualStripeSubscriptionId: subscription.id,
                    individualPlanExpiresAt: new Date((subscription as any).current_period_end * 1000),
                })
                .where(eq(users.id, userId));
        }
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (subscription.metadata?.plan === "community") {
            const communityId = parseInt(subscription.metadata.communityId);
            await db.update(communities)
                .set({
                    planExpiresAt: new Date((subscription as any).current_period_end * 1000),
                })
                .where(eq(communities.id, communityId));
        } else if (subscription.metadata?.plan === "member_pro") {
            const userId = parseInt(subscription.metadata.userId);
            await db.update(users)
                .set({
                    individualPlanExpiresAt: new Date((subscription as any).current_period_end * 1000),
                })
                .where(eq(users.id, userId));
        }
    }

    if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription;

        if (subscription.metadata?.plan === "community") {
            const communityId = parseInt(subscription.metadata.communityId);

            await db.update(communities)
                .set({
                    plan: subscription.status === "active" ? "community" : "free",
                    planExpiresAt: new Date((subscription as any).current_period_end * 1000),
                    planMemberLimit: subscription.status === "active" ? 100 : 20,
                })
                .where(eq(communities.id, communityId));
        } else if (subscription.metadata?.plan === "member_pro") {
            const userId = parseInt(subscription.metadata.userId);

            await db.update(users)
                .set({
                    individualPlan: subscription.status === "active" ? "member_pro" : "free",
                    individualPlanExpiresAt: new Date((subscription as any).current_period_end * 1000),
                })
                .where(eq(users.id, userId));
        }
    }

    return new NextResponse(null, { status: 200 });
}
