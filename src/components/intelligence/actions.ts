"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, announcements, polls, votes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createDraftAnnouncementFromPoll(pollId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId || dbUser.role !== "admin") throw new Error("Unauthorized or not admin");

    // Fetch the poll
    const [poll] = await db.select().from(polls).where(
        and(eq(polls.id, pollId), eq(polls.communityId, dbUser.communityId))
    ).limit(1);

    if (!poll) throw new Error("Poll not found");

    // Fetch votes to see the winner
    const allVotes = await db.select().from(votes).where(eq(votes.pollId, pollId));

    // Group votes
    const voteCounts: Record<number, number> = {};
    for (const v of allVotes) {
        voteCounts[v.optionIndex] = (voteCounts[v.optionIndex] || 0) + 1;
    }

    let winnerName = "an option";
    let winnerVotes = 0;

    const parsedOptions = typeof poll.options === 'string' ? JSON.parse(poll.options) : poll.options;
    const optionsList = Array.isArray(parsedOptions) ? parsedOptions : [];

    for (let i = 0; i < optionsList.length; i++) {
        const count = voteCounts[i] || 0;
        if (count > winnerVotes) {
            winnerVotes = count;
            winnerName = optionsList[i]?.text || optionsList[i] || `Option ${i + 1}`;
        }
    }

    // Auto-generate a draft
    const title = `Result: ${poll.question}`;
    const body = `The community has voted on "${poll.question}".\n\nThe most voted option was "${winnerName}" with ${winnerVotes} vote(s).\n\nThank you to everyone who participated!`;

    // Create the draft announcement
    await db.insert(announcements).values({
        communityId: dbUser.communityId,
        authorId: dbUser.id,
        title,
        body,
        isDraft: true,
    });

    // Mark the poll as having an announcement posted so the nudge goes away
    await db.update(polls).set({ announcementPosted: true }).where(eq(polls.id, pollId));

    revalidatePath("/dashboard");
    revalidatePath("/announcements");
    revalidatePath("/home");

    return { success: true };
}
