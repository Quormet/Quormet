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
                            <Card key={event.id} className={`flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300 group ${isPast ? 'opacity-70 grayscale shadow-none' : 'shadow-sm border-slate-200'}`}>
                                <div className={`h-1.5 w-full absolute top-0 left-0 ${isPast ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`} />
                                {dbUser.role === "admin" && (
                                    <EventActions id={event.id} />
                                )}
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl font-bold leading-tight tracking-tight pr-8 text-slate-900 group-hover:text-blue-700 transition-colors">{event.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1 pb-6">
                                    <div className="space-y-2.5 text-sm text-slate-600">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1 bg-blue-50 text-blue-600 rounded-md shrink-0">
                                                <Clock className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{new Date(event.startsAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                                <p className="text-slate-500">{new Date(event.startsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-3">
                                                <div className="p-1 bg-indigo-50 text-indigo-600 rounded-md shrink-0">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="font-medium truncate">{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    {event.description && (
                                        <div className="text-sm p-4 bg-slate-50/50 rounded-xl text-slate-600 italic border border-slate-100/50 leading-relaxed">
                                            {event.description}
                                        </div>
                                    )}

                                    {!isPast && (
                                        <div className="pt-2">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">RSVP Status</p>
                                            <RsvpButtons eventId={event.id} userResponse={userRsvp} />
                                        </div>
                                    )}
                                </CardContent>

                                {dbUser.role === "admin" && (
                                    <div className="px-6 py-4 bg-slate-50 border-t mt-auto text-xs">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="h-3.5 w-3.5 text-slate-400" />
                                            <p className="font-bold text-slate-700 uppercase tracking-tighter">Attendees ({attendees.length})</p>
                                        </div>
                                        {attendees.length > 0 ? (
                                            <p className="text-slate-500 max-h-16 overflow-y-auto leading-normal">
                                                {attendees.map(a => a.userName).join(", ")}
                                            </p>
                                        ) : (
                                            <p className="text-slate-400 italic">No "Yes" responses yet</p>
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
