import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { getThread } from "../actions";
import ThreadView from "./thread-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser) redirect("/onboarding");

    const partnerId = parseInt(id);
    if (isNaN(partnerId)) notFound();

    const { thread, currentUserId, partner } = await getThread(partnerId);
    if (!partner) notFound();

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 md:hidden" asChild>
                    <Link href="/messages"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                    {(partner.name || partner.email || "?")[0].toUpperCase()}
                </div>
                <div>
                    <p className="font-semibold text-sm leading-tight">{partner.name || partner.email}</p>
                    {partner.name && <p className="text-xs text-slate-400">{partner.email}</p>}
                </div>
            </div>

            {/* Chat UI (client) */}
            <div className="flex-1 min-h-0 bg-slate-50">
                <ThreadView
                    initialThread={thread}
                    currentUserId={currentUserId}
                    partnerId={partnerId}
                    partnerName={partner.name || partner.email || "Member"}
                />
            </div>
        </div>
    );
}