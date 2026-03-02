"use client";

import { useState } from "react";
import { sendMessage } from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewMessageForm({ recipients }: { recipients: { id: number; name: string; email: string }[] }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            await sendMessage(formData);
            toast.success("Message sent");
        } catch (e: any) {
            if (e?.message === "NEXT_REDIRECT") throw e;
            toast.error(e.message || "Failed to send message");
            setIsLoading(false);
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
            <div className="mb-6">
                <Button variant="ghost" className="-ml-4 text-slate-500 mb-2" asChild>
                    <Link href="/messages"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Messages</Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">New Message</h1>
                <p className="text-slate-500 mt-1">Send a direct message to another member.</p>
            </div>

            <Card>
                <form action={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Compose</CardTitle>
                        <CardDescription>Choose a recipient and type your message.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="recipientId" className="text-sm font-medium">Recipient</label>
                            <select
                                id="recipientId"
                                name="recipientId"
                                className="block w-full rounded-md border border-slate-300 p-2"
                                required
                                disabled={isLoading}
                            >
                                <option value="">-- select --</option>
                                {recipients.map(r => (
                                    <option key={r.id} value={r.id}>{r.name || r.email || `User #${r.id}`}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="body" className="text-sm font-medium">Message</label>
                            <Textarea
                                id="body"
                                name="body"
                                placeholder="Type your message..."
                                className="min-h-[150px]"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end bg-slate-50/50 px-6 py-4 border-t">
                        <Button type="button" variant="ghost" className="mr-2" asChild disabled={isLoading}>
                            <Link href="/messages">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
