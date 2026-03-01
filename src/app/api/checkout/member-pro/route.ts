import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/getCurrentUser";
import Stripe from "stripe";

export async function POST(req: Request) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
            apiVersion: "2026-02-25.clover" as any,
        });

        const user = await getCurrentUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { interval } = await req.json(); // "month" or "year"

        const amount = interval === "year" ? 5000 : 500; // $50/year or $5/month
        const planName = interval === "year" ? "Quormet Member Pro (Annual)" : "Quormet Member Pro (Monthly)";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: planName,
                        },
                        unit_amount: amount,
                        recurring: {
                            interval: interval === "year" ? "year" : "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/home?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
            customer_email: user.email || undefined,
            client_reference_id: user.id.toString(),
            subscription_data: {
                metadata: {
                    plan: "member_pro",
                    userId: user.id.toString(),
                },
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe checkout error:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
