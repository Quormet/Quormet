'use client'

import { AlertTriangle, CheckCircle, Clock, Calendar, DollarSign, Wrench } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Nudge } from '@/utils/intelligence/generateNudges'

const ICONS = {
    poll_closing: { icon: Clock, color: 'text-orange-500' },
    dues_overdue: { icon: DollarSign, color: 'text-red-500' },
    stale_issue: { icon: Wrench, color: 'text-yellow-500' },
    poll_passed: { icon: CheckCircle, color: 'text-green-500' },
    no_events: { icon: Calendar, color: 'text-blue-500' },
    new_member: { icon: AlertTriangle, color: 'text-purple-500' },
}

const PRIORITY_BORDER = {
    high: 'border-l-red-400',
    medium: 'border-l-yellow-400',
    low: 'border-l-blue-300',
}

export default function NudgeCard({
    nudge,
    onAction,
}: {
    nudge: Nudge
    onAction?: (action: string, data: Record<string, any>) => void
}) {
    const { icon: Icon, color } = ICONS[nudge.type]

    return (
        <Card className={cn(
            'p-4 border-l-4',
            PRIORITY_BORDER[nudge.priority]
        )}>
            <div className="flex gap-3">
                <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', color)} />
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{nudge.title}</p>
                    <p className="text-xs text-muted-foreground">{nudge.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                        {nudge.actions.map(action => (
                            action.href ? (
                                <Link key={action.label} href={action.href}>
                                    <Button variant="outline" size="sm" className="h-7 text-xs">
                                        {action.label}
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    key={action.label}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => onAction && action.action ? onAction(action.action, nudge.data) : undefined}
                                >
                                    {action.label}
                                </Button>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}
