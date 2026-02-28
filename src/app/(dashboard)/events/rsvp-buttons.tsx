"use client";

import { useState } from "react";
import { submitRsvp } from "./actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function RsvpButtons({ eventId, userResponse }: { eventId: number, userResponse?: string }) {
    const [isLoading, setIsLoading] = useState<"yes" | "no" | null>(null);

    async function handleRsvp(response: "yes" | "no") {
        setIsLoading(response);
        try {
            await submitRsvp(eventId, response);
            toast.success("RSVP updated!");
        } catch (e: any) {
            toast.error(e.message || "Failed to submit RSVP");
        } finally {
            setIsLoading(null);
        }
    }

    return (
        <div className="flex gap-2">
            <Button
                variant={userResponse === "yes" ? "default" : "outline"}
                size="sm"
                className={userResponse === "yes" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                onClick={() => handleRsvp("yes")}
                disabled={isLoading !== null}
            >
                {isLoading === "yes" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Yes, I'm going
            </Button>
            <Button
                variant={userResponse === "no" ? "secondary" : "outline"}
                size="sm"
                className={userResponse === "no" ? "bg-red-100 text-red-700 hover:bg-red-200" : ""}
                onClick={() => handleRsvp("no")}
                disabled={isLoading !== null}
            >
                {isLoading === "no" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Can't make it
            </Button>
        </div>
    );
}
