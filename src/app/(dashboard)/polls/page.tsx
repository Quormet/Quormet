import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, polls, votes } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Vote as VoteIcon } from "lucide-react";
import PollCardClient from "./poll-card-client";
import { PollActions } from "./poll-actions";

export default async function PollsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId) redirect("/onboarding");

    // Fetch all polls in community
    const allPolls = await db.select()
        .from(polls)
        .where(eq(polls.communityId, dbUser.communityId))
        .orderBy(desc(polls.createdAt));

    // Determine user votes and all vote tallies
    const pollIds = allPolls.map(p => p.id);

    let allVotes: any[] = [];
    if (pollIds.length > 0) {
        allVotes = await db.select().from(votes).where(inArray(votes.pollId, pollIds));
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Voting & Polls</h1>
                    <p className="text-slate-500 mt-1">Make your voice heard in community decisions.</p>
                </div>

                {dbUser.role === "admin" && (
                    <Button asChild>
                        <Link href="/polls/new"><PlusCircle className="mr-2 h-4 w-4" /> Start a Vote</Link>
                    </Button>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
                {allPolls.length === 0 ? (
                    <div className="md:col-span-2 text-center py-16 px-4 bg-white border border-dashed rounded-lg">
                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                            <VoteIcon className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No polls yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            {dbUser.role === "admin" ? "Start a vote to get feedback from members." : "Check back later when there are decisions to be made."}
                        </p>
                    </div>
                ) : (
                    allPolls.map((poll) => {
                        // Calculate votes for this poll
                        const pollVotes = allVotes.filter(v => v.pollId === poll.id);
                        const userVote = pollVotes.find(v => v.userId === dbUser.id);
                        const hasVoted = !!userVote;
                        const userVoteIndex = userVote ? userVote.optionIndex : null;

                        const voteCounts: Record<number, number> = {};
                        pollVotes.forEach(v => {
                            voteCounts[v.optionIndex] = (voteCounts[v.optionIndex] || 0) + 1;
                        });
                        const totalVotes = pollVotes.length;

                        const isClosed = poll.endsAt ? new Date(poll.endsAt) < new Date() : false;

                        return (
                            <Card key={poll.id} className="overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-start justify-between">
                                    <CardTitle className="text-lg leading-snug">{poll.question}</CardTitle>
                                    {dbUser.role === "admin" && (
                                        <PollActions id={poll.id} isClosed={isClosed} />
                                    )}
                                </CardHeader>
                                <CardContent className="p-6">
                                    <PollCardClient
                                        poll={{ ...poll, options: poll.options as string[] | null }}
                                        hasVoted={hasVoted}
                                        userVoteIndex={userVoteIndex}
                                        isAdmin={dbUser.role === "admin"}
                                        voteCounts={voteCounts}
                                        totalVotes={totalVotes}
                                    />
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
