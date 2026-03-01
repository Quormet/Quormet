"use client";

import { useState } from "react";
import { submitVote } from "./actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Lock } from "lucide-react";

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
    canSeeQuorumBar: boolean;
    memberCount: number;
    isClosed: boolean;
};

export default function PollCardClient({
    poll, hasVoted, userVoteIndex, isAdmin, voteCounts, totalVotes, canSeeQuorumBar, memberCount, isClosed
}: PollCardProps) {
    const [isVoting, setIsVoting] = useState<number | null>(null);

    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const showResults = hasVoted || isClosed;
    const optionsList = Array.isArray(poll.options) ? poll.options : [];

    async function handleVote() {
        if (isClosed || hasVoted || selectedOption === null) return;

        setIsVoting(selectedOption);
        try {
            await submitVote(poll.id, selectedOption);
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
                        <label
                            key={i}
                            className={`flex items-center space-x-3 p-3 rounded-md border text-sm font-medium cursor-pointer transition-colors ${selectedOption === i ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'}`}
                        >
                            <input
                                type="radio"
                                name={`poll-${poll.id}`}
                                value={i}
                                checked={selectedOption === i}
                                onChange={() => setSelectedOption(i)}
                                disabled={isVoting !== null}
                                className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                            />
                            <span>{opt}</span>
                        </label>
                    );
                })}
            </div>

            {!showResults && (
                <Button
                    className="w-full mt-2"
                    onClick={handleVote}
                    disabled={selectedOption === null || isVoting !== null}
                >
                    {isVoting !== null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Submit Vote
                </Button>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t mb-2">
                <span>{totalVotes} vote{totalVotes !== 1 && 's'}</span>
                {isClosed ? (
                    <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">Closed</span>
                ) : poll.endsAt ? (
                    <span>Closes {new Date(poll.endsAt).toLocaleDateString()}</span>
                ) : (
                    <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                )}
            </div>

            {/* Quorum Progress Bar */}
            <div className="mt-4 pt-4 border-t relative">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                    <span>Quorum</span>
                    <span>{Math.min(totalVotes, memberCount)} / {memberCount} required</span>
                </div>
                {!canSeeQuorumBar ? (
                    <div className="relative overflow-hidden rounded-md h-4 bg-slate-100/50">
                        <div className="absolute inset-0 backdrop-blur-[2px] z-10 flex items-center justify-center bg-white/50">
                            <span className="text-[10px] font-medium text-slate-600 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Upgrade to see live quorum
                            </span>
                        </div>
                        <Progress value={25} className="h-full opacity-30 [&>div]:bg-slate-300" />
                    </div>
                ) : (
                    <Progress value={Math.min((totalVotes / Math.max(memberCount, 1)) * 100, 100)} className="h-2 [&>div]:bg-blue-500" />
                )}
            </div>
        </div>
    );
}
