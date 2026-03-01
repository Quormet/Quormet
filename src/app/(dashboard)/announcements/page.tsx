import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, announcements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Megaphone } from "lucide-react";
import { DeleteAnnouncementButton } from "./delete-button";

export default async function AnnouncementsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId) redirect("/onboarding");

    // Fetch announcements with author details
    const allAnnouncements = await db.select({
        id: announcements.id,
        title: announcements.title,
        body: announcements.body,
        createdAt: announcements.createdAt,
        authorName: users.name,
    })
        .from(announcements)
        .leftJoin(users, eq(announcements.authorId, users.id))
        .where(eq(announcements.communityId, dbUser.communityId))
        .orderBy(desc(announcements.createdAt));

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-slate-500 mt-1">Updates and news from your community board.</p>
                </div>

                {dbUser.role === "admin" && (
                    <Button asChild>
                        <Link href="/announcements/new"><PlusCircle className="mr-2 h-4 w-4" /> New Announcement</Link>
                    </Button>
                )}
            </div>

            <div className="space-y-6">
                {allAnnouncements.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white border border-dashed rounded-lg">
                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                            <Megaphone className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No announcements yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            When the community board posts an announcement, it will appear here.
                        </p>
                    </div>
                ) : (
                    allAnnouncements.map((ann) => (
                        <Card key={ann.id} className="overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle className="text-xl mb-1">{ann.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <span className="font-medium text-slate-700">{ann.authorName}</span>
                                        <span>•</span>
                                        <span>{new Date(ann.createdAt).toLocaleDateString()} at {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </CardDescription>
                                </div>
                                {dbUser.role === "admin" && (
                                    <DeleteAnnouncementButton id={ann.id} />
                                )}
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{ann.body}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
