"use client";

import { useState } from "react";
import { submitVote } from "./actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

type PollCardProps = {
    poll: {
        id: number;
        question: string;
        options: string[] | null;
        endsAt: Date | null;
    };
    hasVoted: boolean;
    userVoteIndex: number | null;
    isAdmin: boolean;
    voteCounts: Record<number, number>;
    totalVotes: number;
};

export default function PollCardClient({
    poll, hasVoted, userVoteIndex, isAdmin, voteCounts, totalVotes
}: PollCardProps) {
    const [isVoting, setIsVoting] = useState<number | null>(null);

    const isClosed = poll.endsAt ? new Date(poll.endsAt) < new Date() : false;
    const showResults = hasVoted || isClosed;
    const optionsList = Array.isArray(poll.options) ? poll.options : [];

    async function handleVote(optionIndex: number) {
        if (isClosed || hasVoted) return;

        setIsVoting(optionIndex);
        try {
            await submitVote(poll.id, optionIndex);
            toast.success("Vote cast successfully!");
        } catch (e: any) {
            toast.error(e.message || "Failed to cast vote");
        } finally {
            setIsVoting(null);
        }
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {optionsList.map((opt, i) => {
                    const count = voteCounts[i] || 0;
                    const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                    const isUserChoice = userVoteIndex === i;

                    if (showResults) {
                        return (
                            <div key={i} className="space-y-1 relative">
                                <div className="flex justify-between text-sm mb-1 px-1 relative z-10">
                                    <span className="font-medium flex items-center gap-2">
                                        {opt}
                                        {isUserChoice && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                                    </span>
                                    <span className="text-slate-500">{percentage}% ({count})</span>
                                </div>
                                <Progress value={percentage} className={`h-8 ${isUserChoice ? "[&>div]:bg-emerald-500" : "[&>div]:bg-blue-200"}`} />
                            </div>
                        );
                    }

                    return (
                        <Button
                            key={i}
                            variant="outline"
                            className="w-full justify-start h-auto py-3 px-4 font-normal text-left"
                            onClick={() => handleVote(i)}
                            disabled={isVoting !== null}
                        >
                            {isVoting === i && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {opt}
                        </Button>
                    );
                })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
                <span>{totalVotes} vote{totalVotes !== 1 && 's'}</span>
                {isClosed ? (
                    <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">Closed</span>
                ) : poll.endsAt ? (
                    <span>Closes {new Date(poll.endsAt).toLocaleDateString()}</span>
                ) : (
                    <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                )}
            </div>
        </div>
    );
}
