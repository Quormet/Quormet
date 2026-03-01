import { getCurrentUser } from "@/utils/getCurrentUser";
import { db } from "@/db";
import { events, rsvps, users } from "@/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, MapPin, Clock, Users } from "lucide-react";
import { RsvpButtons } from "./rsvp-buttons";
import { EventActions } from "./event-actions";
import { format } from "date-fns";

export default async function EventsPage() {
    const dbUser = await getCurrentUser();
    if (!dbUser || !dbUser.communityId) redirect("/onboarding");


    const allEvents = await db.select()
        .from(events)
        .where(eq(events.communityId, dbUser.communityId))
        .orderBy(desc(events.startsAt));

    const eventIds = allEvents.map(e => e.id);

    // Fetch RSVPs
    let allRsvps: any[] = [];
    if (eventIds.length > 0) {
        allRsvps = await db.select({
            id: rsvps.id,
            eventId: rsvps.eventId,
            userId: rsvps.userId,
            response: rsvps.response,
            userName: users.name,
        })
            .from(rsvps)
            .leftJoin(users, eq(rsvps.userId, users.id))
            .where(inArray(rsvps.eventId, eventIds));
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                    <p className="text-slate-500 mt-1">Upcoming gatherings, meetings, and block parties.</p>
                </div>

                {dbUser.role === "admin" && (
                    <Button asChild>
                        <Link href="/events/new"><Plus className="mr-2 h-4 w-4" /> Plan an Event</Link>
                    </Button>
                )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {allEvents.length === 0 ? (
                    <div className="md:col-span-3 text-center py-16 px-4 bg-white border border-dashed rounded-lg">
                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No upcoming events</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            {dbUser.role === "admin" ? "Plan an event to bring everyone together." : "When an event is scheduled, you'll see it here along with RSVP options."}
                        </p>
                    </div>
                ) : (
                    allEvents.map((event) => {
                        const eventRsvps = allRsvps.filter(r => r.eventId === event.id);
                        const userRsvp = eventRsvps.find(r => r.userId === dbUser.id)?.response;
                        const attendees = eventRsvps.filter(r => r.response === "yes");

                        const isPast = new Date(event.startsAt) < new Date();

                        return (
                            <Card key={event.id} className={`flex flex-col relative overflow-hidden ${isPast ? 'opacity-70 grayscale' : ''}`}>
                                <div className="h-2 w-full bg-blue-600 absolute top-0 left-0" />
                                {dbUser.role === "admin" && (
                                    <EventActions id={event.id} />
                                )}
                                <CardHeader>
                                    <CardTitle className="text-xl leading-snug pr-8">{event.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1">
                                    <div className="space-y-2 text-sm text-slate-600">
                                        <div className="flex items-start gap-2">
                                            <Clock className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                                            <div>
                                                <p className="font-medium text-slate-900">{new Date(event.startsAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                                <p>{new Date(event.startsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {event.description && (
                                        <div className="text-sm p-3 bg-slate-50 rounded text-slate-700 whitespace-pre-wrap">
                                            {event.description}
                                        </div>
                                    )}

                                    {!isPast && (
                                        <div className="pt-2">
                                            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Your RSVP</p>
                                            <RsvpButtons eventId={event.id} userResponse={userRsvp} />
                                        </div>
                                    )}
                                </CardContent>

                                {dbUser.role === "admin" && (
                                    <div className="p-4 bg-slate-50 border-t mt-auto text-sm">
                                        <p className="font-semibold text-slate-700 mb-1">RSVPs ({attendees.length} Yes)</p>
                                        {attendees.length > 0 ? (
                                            <p className="text-slate-500 max-h-16 overflow-y-auto">
                                                {attendees.map(a => a.userName).join(", ")}
                                            </p>
                                        ) : (
                                            <p className="text-slate-400 italic">No attendees yet</p>
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
