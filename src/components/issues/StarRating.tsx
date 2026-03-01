'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitVendorRating } from '@/app/(dashboard)/issues/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function StarRating({
    issueId,
    vendorId,
    vendorName,
}: {
    issueId: string
    vendorId: string
    vendorName: string
}) {
    const [hovered, setHovered] = useState(0)
    const [selected, setSelected] = useState(0)
    const [comment, setComment] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit() {
        if (!selected) return
        setLoading(true)
        try {
            await submitVendorRating(issueId, vendorId, selected, comment)
            setSubmitted(true)
            toast.success('Thank you for your feedback!')
        } catch {
            toast.error('Failed to submit rating')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) return (
        <div className="border rounded-xl p-6 text-center text-sm font-medium text-muted-foreground bg-card shadow-sm">
            <div className="flex justify-center mb-2">
                <div className="bg-green-100 text-green-700 p-2 rounded-full">
                    <Star className="w-5 h-5 fill-current" />
                </div>
            </div>
            Thanks for rating {vendorName}!
        </div>
    )

    return (
        <div className="border rounded-xl p-5 space-y-4 bg-card shadow-sm text-center sm:text-left">
            <p className="font-semibold tracking-tight text-lg">How was the work by {vendorName}?</p>

            {/* Stars */}
            <div className="flex gap-1 justify-center sm:justify-start">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setSelected(star)}
                        className="p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    >
                        <Star className={cn(
                            'w-8 h-8 transition-colors',
                            star <= (hovered || selected)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30'
                        )} />
                    </button>
                ))}
            </div>

            <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Leave a comment (optional)..."
                className="resize-none"
                rows={2}
            />

            <Button
                onClick={handleSubmit}
                disabled={!selected || loading}
                className="w-full sm:w-auto"
            >
                Submit Rating
            </Button>
        </div>
    )
}
