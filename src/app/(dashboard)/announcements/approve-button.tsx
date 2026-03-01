"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { approveAnnouncement } from "./actions";
import { toast } from "sonner";

export function ApproveAnnouncementButton({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = () => {
        startTransition(async () => {
            try {
                await approveAnnouncement(id);
                toast.success("Announcement approved and posted");
            } catch (error) {
                toast.error("Failed to approve announcement");
                console.error(error);
            }
        });
    };

    return (
        <Button
            variant="default"
            size="sm"
            onClick={handleApprove}
            disabled={isPending}
        >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isPending ? "Posting..." : "Approve & Post →"}
        </Button>
    );
}
