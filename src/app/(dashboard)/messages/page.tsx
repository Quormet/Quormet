import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getConversations, purgeOldMessages } from "./actions";
import NewChatButton from "./new-chat-button";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default async function MessagesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser) redirect("/onboarding");

    await purgeOldMessages();
    const { conversations } = await getConversations();

    function timeLabel(date: Date) {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-white shrink-0">
                <h1 className="text-xl font-bold tracking-tight">Messages</h1>
                <NewChatButton />
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-8">
                        <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                            <MessageSquare className="h-7 w-7 text-slate-400" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-slate-600">No messages yet</p>
                            <p className="text-sm mt-1">Click the pencil icon above to start a conversation.</p>
                        </div>
                    </div>
                ) : (
                    <ul className="divide-y">
                        {conversations.map((c) => (
                            <li key={c.id}>
                                <Link
                                    href={`/messages/${c.id}`}
                                    className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"
                                >
                                    {/* Avatar */}
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                        {(c.name || c.email || "?")[0].toUpperCase()}
                                    </div>
                                    {/* Details */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-sm truncate">{c.name || c.email}</p>
                                            <span className="text-[11px] text-slate-400 shrink-0">{timeLabel(c.lastAt)}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{c.lastBody}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
