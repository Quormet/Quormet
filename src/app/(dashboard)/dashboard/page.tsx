import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, communities, announcements, polls, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Vote, Coins, Calendar, PlusCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!dbUser || !dbUser.communityId) redirect("/onboarding");

    
    const [latestAnnouncements, activePolls, upcomingEvents] = await Promise.all([
        db.select().from(announcements)
            .where(eq(announcements.communityId, dbUser.communityId))
            .orderBy(desc(announcements.createdAt))
            .limit(3),
        db.select().from(polls)
            .where(eq(polls.communityId, dbUser.communityId))
            .orderBy(desc(polls.createdAt))
            .limit(3), 
        db.select().from(events)
            .where(eq(events.communityId, dbUser.communityId))
            .orderBy(desc(events.startsAt))
            .limit(3)
    ]);

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                    <p className="text-slate-500 mt-1">Here is what is happening in your community today.</p>
                </div>

                {dbUser.role === "admin" && (
                    <div className="flex gap-2">
                        <Button size="sm" asChild>
                            <Link href="/announcements/new"><PlusCircle className="mr-2 h-4 w-4" /> Announcement</Link>
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Dues Status</CardTitle>
                        <Coins className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        {dbUser.duesPaid ? (
                            <div className="text-2xl font-bold text-emerald-600">Paid</div>
                        ) : (
                            <div className="text-2xl font-bold text-red-600">Unpaid</div>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            Current period
                        </p>
                    </CardContent>
                    {!dbUser.duesPaid && (
                        <CardFooter className="pt-0">
                            <Button size="sm" variant="outline" className="w-full bg-slate-50" asChild>
                                <Link href="/dues">Pay Now</Link>
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
                        <Vote className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activePolls.length}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Require your vote
                        </p>
                    </CardContent>
                </Card>

                {/* Other metrics omitted for brevity but can be added */}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Announcements */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight">Recent Announcements</h2>
                        <Button variant="link" size="sm" asChild>
                            <Link href="/announcements">View all</Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {latestAnnouncements.length === 0 ? (
                            <Card className="bg-slate-50/50 border-dashed">
                                <CardContent className="p-6 text-center text-slate-500">
                                    No announcements yet.
                                </CardContent>
                            </Card>
                        ) : (
                            latestAnnouncements.map((ann) => (
                                <Card key={ann.id}>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base">{ann.title}</CardTitle>
                                        <CardDescription className="text-xs">{new Date(ann.createdAt).toLocaleDateString()}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-sm text-slate-600 line-clamp-2">
                                        {ann.body}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcomming Events */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight">Upcoming Events</h2>
                        <Button variant="link" size="sm" asChild>
                            <Link href="/events">View all</Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {upcomingEvents.length === 0 ? (
                            <Card className="bg-slate-50/50 border-dashed">
                                <CardContent className="p-6 text-center text-slate-500">
                                    No upcoming events.
                                </CardContent>
                            </Card>
                        ) : (
                            upcomingEvents.map((event) => (
                                <Card key={event.id}>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base">{event.name}</CardTitle>
                                        <CardDescription className="text-xs flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(event.startsAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
