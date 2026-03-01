'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { offerHelp } from './actions'
import { toast } from 'sonner'
import { HandHelping, Check } from 'lucide-react'

export default function OfferHelpButton({ requestId, hasOffered }: { requestId: string, hasOffered: boolean }) {
    const [isPending, startTransition] = useTransition()

    if (hasOffered) {
        return (
            <Button variant="secondary" size="sm" disabled>
                <Check className="mr-2 h-4 w-4" /> Offered
            </Button>
        )
    }

    return (
        <Button
            size="sm"
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    try {
                        await offerHelp(requestId)
                        toast.success("Offer sent!")
                    } catch (e) {
                        toast.error("Failed to offer help")
                    }
                })
            }}
        >
            <HandHelping className="mr-2 h-4 w-4" /> I can help!
        </Button>
    )
}
