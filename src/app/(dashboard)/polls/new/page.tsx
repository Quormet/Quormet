"use client";

import { useState } from "react";
import { createPoll } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewPollPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            await createPoll(formData);
            toast.success("Poll created successfully!");
            // the server action redirects automatically
        } catch (e: any) {
            toast.error(e.message || "Failed to create poll");
            setIsLoading(false);
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
            <div className="mb-6">
                <Button variant="ghost" className="-ml-4 text-slate-500 mb-2" asChild>
                    <Link href="/polls"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Polls</Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create a Poll</h1>
                <p className="text-slate-500 mt-1">Ask your community a question and gather votes.</p>
            </div>

            <Card>
                <form action={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Poll Details</CardTitle>
                        <CardDescription>Members will be able to cast a single vote on active polls.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="question" className="text-sm font-medium">Question</label>
                            <Input id="question" name="question" placeholder="E.g., What color should we paint the clubhouse?" required disabled={isLoading} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="options" className="text-sm font-medium">Options <span className="text-slate-500 font-normal">(comma separated)</span></label>
                            <Input id="options" name="options" placeholder="Red, Blue, Green, Yellow" required disabled={isLoading} />
                            <p className="text-xs text-slate-500">Provide at least 2 options, separated by commas.</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="endsAt" className="text-sm font-medium">End Date <span className="text-slate-500 font-normal">(optional)</span></label>
                            <Input id="endsAt" name="endsAt" type="date" disabled={isLoading} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end bg-slate-50/50 px-6 py-4 border-t">
                        <Button type="button" variant="ghost" className="mr-2" asChild disabled={isLoading}>
                            <Link href="/polls">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publish Poll
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
