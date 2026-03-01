'use client';

import { useState, useTransition } from "react";
import { sendMessage, getCommunityMembers } from "./actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PenSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Member = { id: number; name: string; email: string };

export default function NewChatButton() {
    const [open, setOpen] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [selected, setSelected] = useState<number | "">("");
    const router = useRouter();

    async function handleOpen() {
        setOpen(true);
        setLoadingMembers(true);
        try {
            const m = await getCommunityMembers();
            setMembers(m);
        } catch {
            toast.error("Could not load members");
        } finally {
            setLoadingMembers(false);
        }
    }

    function handleSelectAndGo(memberId: number) {
        setOpen(false);
        router.push(`/messages/${memberId}`);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 rounded-lg" onClick={handleOpen}>
                    <PenSquare className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs">
                <DialogHeader>
                    <DialogTitle>New Chat</DialogTitle>
                </DialogHeader>
                {loadingMembers ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                ) : members.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No other members to message.</p>
                ) : (
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                        {members.map(m => (
                            <button
                                key={m.id}
                                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                                onClick={() => handleSelectAndGo(m.id)}
                            >
                                <p className="text-sm font-medium">{m.name || m.email}</p>
                                {m.name && <p className="text-xs text-slate-400">{m.email}</p>}
                            </button>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
