'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { resolveRequest } from './actions'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

export default function ResolveRequestButton({ requestId }: { requestId: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    try {
                        await resolveRequest(requestId)
                        toast.success("Request marked as resolved")
                    } catch (e) {
                        toast.error("Failed to resolve request")
                    }
                })
            }}
        >
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Mark Resolved
        </Button>
    )
}
