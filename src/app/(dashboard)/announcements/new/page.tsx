"use client";

import { useState } from "react";
import { createAnnouncement } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewAnnouncementPage() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            const res = await createAnnouncement(formData);
            if (res && res.success) {
                toast.success("Announcement posted!");
                window.location.href = "/announcements"; // Use window.location for a full refresh or router.push
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to post announcement");
            setIsLoading(false);
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
            <div className="mb-6">
                <Button variant="ghost" className="-ml-4 text-slate-500 mb-2" asChild>
                    <Link href="/announcements"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Announcements</Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Post Announcement</h1>
                <p className="text-slate-500 mt-1">Share important news with your entire community.</p>
            </div>

            <Card>
                <form action={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Announcement Details</CardTitle>
                        <CardDescription>Everyone in the community will immediately be able to see this.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">Title</label>
                            <Input id="title" name="title" placeholder="E.g., Upcoming Street Cleaning" required disabled={isLoading} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="body" className="text-sm font-medium">Message</label>
                            <Textarea
                                id="body"
                                name="body"
                                placeholder="Write the full announcement here..."
                                className="min-h-[150px]"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end bg-slate-50/50 px-6 py-4 border-t">
                        <Button type="button" variant="ghost" className="mr-2" asChild disabled={isLoading}>
                            <Link href="/announcements">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Announcement
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
