import { Check } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const STAGES = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'board_review', label: 'Board Review' },
    { key: 'vendor_assigned', label: 'Vendor Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
]

type Update = {
    newStatus: string
    createdAt: Date
}

export default function ProgressStepper({
    currentStatus,
    updates,
}: {
    currentStatus: string
    updates: Update[]
}) {
    const currentIndex = STAGES.findIndex(s => s.key === currentStatus)

    const getDateForStage = (stageKey: string) =>
        updates.find(u => u.newStatus === stageKey)?.createdAt

    return (
        <div className="w-full py-6 overflow-x-auto">
            <div className="flex items-center justify-between relative min-w-[600px] px-4">
                {/* Connecting line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
                <div
                    className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                    style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
                />

                {STAGES.map((stage, index) => {
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex
                    const isPending = index > currentIndex
                    const date = getDateForStage(stage.key)

                    return (
                        <div key={stage.key} className="flex flex-col items-center gap-2 z-10 w-24">
                            {/* Circle */}
                            <div className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background',
                                isCompleted && 'bg-primary border-primary text-primary-foreground',
                                isCurrent && 'border-primary text-primary ring-4 ring-primary/20',
                                isPending && 'border-muted text-muted-foreground'
                            )}>
                                {isCompleted
                                    ? <Check className="w-4 h-4" />
                                    : <span className="text-xs font-bold">{index + 1}</span>
                                }
                            </div>

                            {/* Label */}
                            <div className="text-center">
                                <p className={cn(
                                    'text-xs font-medium',
                                    (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                                )}>
                                    {stage.label}
                                </p>
                                {date && (
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(date), 'MMM d')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
