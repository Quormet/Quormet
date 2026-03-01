import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, messages } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import { deleteMessage } from "../actions";

export default async function MessageDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId) redirect("/onboarding");

    const messageId = parseInt(params.id);
    const [msgRow] = await db.select({
        id: messages.id,
        body: messages.body,
        senderId: messages.senderId,
        recipientId: messages.recipientId,
        createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.id, messageId));

    if (!msgRow) notFound();

    const isSender = msgRow.senderId === dbUser.id;
    const isRecipient = msgRow.recipientId === dbUser.id;
    if (!isSender && !isRecipient) redirect("/messages");

    const [senderUser] = await db.select({ name: users.name }).from(users).where(eq(users.id, msgRow.senderId));
    const [recipientUser] = await db.select({ name: users.name }).from(users).where(eq(users.id, msgRow.recipientId));
    const senderName = senderUser?.name ?? null;
    const recipientName = recipientUser?.name ?? null;

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
            <Button variant="ghost" className="-ml-4 mb-4" asChild>
                <Link href="/messages"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Messages</Link>
            </Button>
            <div className="space-y-4">
                <div className="text-sm text-slate-500">
                    {isSender ? (
                        <span>To: {recipientName || "(unknown)"}</span>
                    ) : (
                        <span>From: {senderName || "(unknown)"}</span>
                    )}
                    <span className="ml-4">{new Date(msgRow.createdAt).toLocaleString()}</span>
                </div>
                <div className="border p-4 rounded-lg whitespace-pre-wrap">{msgRow.body}</div>
                <div className="flex space-x-2">
                    <form action={async () => { await deleteMessage(messageId); }}>
                        <Button size="sm" variant="destructive" type="submit" className="flex items-center">
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}