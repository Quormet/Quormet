/**
 * Defines server actions for event management, including creating new events 
 * (restricted to admins) and submitting user RSVPs with appropriate 
 * community-level validation.
 */
"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, events, rsvps } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getAuthUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId) throw new Error("No community found");

    return dbUser;
}

export async function createEvent(formData: FormData) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can create events");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const startsAtStr = formData.get("startsAt") as string;

    if (!name || !startsAtStr) throw new Error("Name and start time are required");

    await db.insert(events).values({
        communityId: user.communityId!,
        name,
        description,
        location,
        startsAt: new Date(startsAtStr),
    });

    revalidatePath("/events");
    redirect("/events");
}

export async function submitRsvp(eventId: number, response: "yes" | "no") {
    const user = await getAuthUser();

    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event || event.communityId !== user.communityId) {
        throw new Error("Invalid event");
    }

    const [existing] = await db.select()
        .from(rsvps)
        .where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, user.id)))
        .limit(1);

    if (existing) {
        await db.update(rsvps)
            .set({ response })
            .where(eq(rsvps.id, existing.id));
    } else {
        await db.insert(rsvps).values({
            eventId,
            userId: user.id,
            response,
        });
    }

    revalidatePath("/events");
}

export async function deleteEvent(eventId: number) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can delete events");

    // Drizzle with cascade should handle RSVPs, but just in case
    await db.delete(rsvps).where(eq(rsvps.eventId, eventId));
    await db.delete(events).where(and(
        eq(events.id, eventId),
        eq(events.communityId, user.communityId!)
    ));

    revalidatePath("/events");
}
