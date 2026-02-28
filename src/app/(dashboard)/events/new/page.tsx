"use client";

import { useState } from "react";
import { createEvent } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            await createEvent(formData);
            toast.success("Event created successfully!");
        } catch (e: any) {
            toast.error(e.message || "Failed to create event");
            setIsLoading(false);
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
            <div className="mb-6">
                <Button variant="ghost" className="-ml-4 text-slate-500 mb-2" asChild>
                    <Link href="/events"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Events</Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create an Event</h1>
                <p className="text-slate-500 mt-1">Schedule a new gathering for the community.</p>
            </div>

            <Card>
                <form action={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                        <CardDescription>Members will be able to RSVP once published.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Event Name</label>
                            <Input id="name" name="name" placeholder="E.g., Summer Block Party" required disabled={isLoading} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="startsAt" className="text-sm font-medium">Date & Time</label>
                            <Input id="startsAt" name="startsAt" type="datetime-local" required disabled={isLoading} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="location" className="text-sm font-medium">Location <span className="text-slate-500 font-normal">(optional)</span></label>
                            <Input id="location" name="location" placeholder="E.g., The Clubhouse" disabled={isLoading} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">Description <span className="text-slate-500 font-normal">(optional)</span></label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Details about the event..."
                                className="min-h-[100px]"
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end bg-slate-50/50 px-6 py-4 border-t">
                        <Button type="button" variant="ghost" className="mr-2" asChild disabled={isLoading}>
                            <Link href="/events">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publish Event
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
