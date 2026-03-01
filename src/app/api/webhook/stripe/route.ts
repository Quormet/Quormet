/**
 * Handles incoming Stripe webhook events, specifically the 'checkout.session.completed' 
 * event to record user payments and update their dues status in the database.
 */
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/db";
import { users, payments } from "@/db/schema";
import { eq } from "drizzle-orm";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: "2024-06-20",
    } as any);

    try {
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get("stripe-signature");

        if (!signature || !webhookSecret) {
            return new NextResponse("Missing Stripe configuration", { status: 400 });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            const userIdStr = session.metadata?.userId;
            const communityIdStr = session.metadata?.communityId;

            if (userIdStr && communityIdStr) {
                const userId = parseInt(userIdStr);
                const communityId = parseInt(communityIdStr);

                await db.insert(payments).values({
                    userId,
                    communityId,
                    amount: session.amount_total || 0,
                    stripeSessionId: session.id,
                });

                await db.update(users).set({ duesPaid: true }).where(eq(users.id, userId));
            }
        }

        return new NextResponse(null, { status: 200 });
    } catch (err: any) {
        return new NextResponse(`Server Error: ${err.message}`, { status: 500 });
    }
}
