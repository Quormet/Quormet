import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, messages, communityMembers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { purgeOldMessages } from "./actions";

export default async function MessagesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId) redirect("/onboarding");

    // remove old messages first
    await purgeOldMessages();

    const inbox = await db.select({
        id: messages.id,
        body: messages.body,
        senderId: messages.senderId,
        senderName: users.name,
        createdAt: messages.createdAt,
    })
    .from(messages)
    .leftJoin(users, eq(users.id, messages.senderId))
    .where(and(eq(messages.recipientId, dbUser.id), eq(messages.communityId, dbUser.communityId)))
    .orderBy(desc(messages.createdAt));

    const sent = await db.select({
        id: messages.id,
        body: messages.body,
        recipientId: messages.recipientId,
        recipientName: users.name,
        createdAt: messages.createdAt,
    })
    .from(messages)
    .leftJoin(users, eq(users.id, messages.recipientId))
    .where(and(eq(messages.senderId, dbUser.id), eq(messages.communityId, dbUser.communityId)))
    .orderBy(desc(messages.createdAt));

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                <Button asChild size="sm">
                    <Link href="/messages/new">
                        <Mail className="mr-2 h-4 w-4" /> New Message
                    </Link>
                </Button>
            </div>

            <section>
                <h2 className="text-2xl font-semibold mb-2">Inbox</h2>
                {inbox.length === 0 ? (
                    <p className="text-slate-500">You have no messages.</p>
                ) : (
                    <div className="space-y-2">
                        {inbox.map((m) => (
                            <Link
                                key={m.id}
                                href={`/messages/${m.id}`}
                                className="block p-4 rounded-lg border hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{m.senderName || "(unknown)"}</span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(m.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700 truncate mt-1">
                                    {m.body}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-2">Sent</h2>
                {sent.length === 0 ? (
                    <p className="text-slate-500">You haven't sent any messages yet.</p>
                ) : (
                    <div className="space-y-2">
                        {sent.map((m) => (
                            <Link
                                key={m.id}
                                href={`/messages/${m.id}`}
                                className="block p-4 rounded-lg border hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">To {m.recipientName || "(unknown)"}</span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(m.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700 truncate mt-1">
                                    {m.body}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}