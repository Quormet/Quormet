import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
    submitted: { label: 'Submitted', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
    board_review: { label: 'Board Review', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    vendor_assigned: { label: 'Vendor Assigned', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
}

export default function StatusBadge({ status }: { status: string }) {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    if (!config) return null

    return (
        <Badge className={cn('font-medium border-0', config.color)}>
            {config.label}
        </Badge>
    )
}
