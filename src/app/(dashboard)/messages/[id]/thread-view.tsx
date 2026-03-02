'use client';

import { useState, useRef, useEffect, useTransition } from "react";
import { sendMessage } from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Message = {
    id: number;
    senderId: number;
    body: string;
    createdAt: Date;
};

type Props = {
    initialThread: Message[];
    currentUserId: number;
    partnerId: number;
    partnerName: string;
};

export default function ThreadView({ initialThread, currentUserId, partnerId, partnerName }: Props) {
    const [isPending, startTransition] = useTransition();
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [initialThread]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const form = e.currentTarget.closest("form") as HTMLFormElement | null;
            if (form) form.requestSubmit();
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {initialThread.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <p className="text-sm">No messages yet. Say hello to <span className="font-semibold text-slate-600">{partnerName}</span>!</p>
                    </div>
                ) : (
                    initialThread.map((m) => {
                        const isMine = m.senderId === currentUserId;
                        return (
                            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isMine
                                    ? "bg-blue-600 text-white rounded-br-sm"
                                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                                    }`}>
                                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                                    <p className={`text-[10px] mt-1 ${isMine ? "text-blue-200 text-right" : "text-slate-400"}`}>
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="border-t bg-white p-3">
                <form
                    action={async (formData) => {
                        const body = formData.get("body") as string;
                        if (!body?.trim()) return;
                        startTransition(async () => {
                            try {
                                await sendMessage(formData);
                            } catch (e: any) {
                                if (e?.message === "NEXT_REDIRECT") throw e;
                                toast.error(e.message || "Failed to send");
                            }
                        });
                    }}
                    className="flex gap-2 items-end"
                >
                    <input type="hidden" name="recipientId" value={partnerId} />
                    <Textarea
                        ref={textareaRef}
                        name="body"
                        placeholder={`Message ${partnerName}…`}
                        className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm"
                        rows={1}
                        onKeyDown={handleKeyDown}
                        disabled={isPending}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isPending}
                        className="h-11 w-11 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
