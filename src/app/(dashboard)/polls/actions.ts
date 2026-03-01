/**
 * Defines server actions for community polls, enabling admins to create new 
 * polls and members to submit votes while enforcing constraints such as 
 * poll deadlines and single-vote policies.
 */
"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, polls, votes } from "@/db/schema";
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

export async function createPoll(formData: FormData) {
    const user = await getAuthUser();
    if (user.role !== "admin") throw new Error("Only admins can create polls");

    const question = formData.get("question") as string;
    const optionsStr = formData.get("options") as string;
    const endsAtStr = formData.get("endsAt") as string;

    if (!question || !optionsStr) throw new Error("Question and options are required");

    const options = optionsStr.split(',').map(o => o.trim()).filter(Boolean);
    if (options.length < 2) throw new Error("At least 2 options are required");

    let endsAt: Date | null = null;
    if (endsAtStr) {
        endsAt = new Date(endsAtStr);
    }

    await db.insert(polls).values({
        communityId: user.communityId!,
        authorId: user.id,
        question,
        options,
        endsAt,
    });

    revalidatePath("/polls");
    redirect("/polls");
}

export async function submitVote(pollId: number, optionIndex: number) {
    const user = await getAuthUser();

    const [poll] = await db.select().from(polls).where(eq(polls.id, pollId)).limit(1);
    if (!poll || poll.communityId !== user.communityId) {
        throw new Error("Invalid poll");
    }

    if (poll.endsAt && new Date(poll.endsAt) < new Date()) {
        throw new Error("This poll is closed");
    }

    const [existingVote] = await db.select()
        .from(votes)
        .where(and(eq(votes.pollId, pollId), eq(votes.userId, user.id)))
        .limit(1);

    if (existingVote) {
        throw new Error("You have already voted on this poll");
    }

    await db.insert(votes).values({
        pollId,
        userId: user.id,
        optionIndex,
    });

    revalidatePath("/polls");
}
