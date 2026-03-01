"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function PlanUpgradeButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/checkout/community", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ interval: "month" }),
            });

            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Failed to checkout:", error);
            // Optionally add toast error here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button disabled className="bg-slate-200 text-slate-500 hover:bg-slate-200 cursor-not-allowed">
            Upgrade to Community Plan (Coming Soon)
        </Button>
    );
}
