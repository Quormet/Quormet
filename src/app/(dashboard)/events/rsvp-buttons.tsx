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
        <div className="flex flex-wrap gap-2">
            <Button
                variant={userResponse === "yes" ? "default" : "outline"}
                size="sm"
                className={`flex-1 min-w-[100px] h-9 px-3 ${userResponse === "yes" ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" : ""}`}
                onClick={() => handleRsvp("yes")}
                disabled={isLoading !== null}
            >
                {isLoading === "yes" ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Going
            </Button>
            <Button
                variant={userResponse === "no" ? "secondary" : "outline"}
                size="sm"
                className={`flex-1 min-w-[100px] h-9 px-3 ${userResponse === "no" ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-100" : ""}`}
                onClick={() => handleRsvp("no")}
                disabled={isLoading !== null}
            >
                {isLoading === "no" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Can't go
            </Button>
        </div>
    );
}
