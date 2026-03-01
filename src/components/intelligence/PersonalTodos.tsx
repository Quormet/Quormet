import { getPersonalTodos } from '@/utils/intelligence/getPersonalTodos'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { CheckCircle2, Vote, Calendar, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const TODO_ICONS = {
    unvoted_poll: { icon: Vote, color: 'text-purple-500' },
    unrsvpd_event: { icon: Calendar, color: 'text-blue-500' },
    unpaid_dues: { icon: DollarSign, color: 'text-red-500' },
}

const URGENCY_DOT = {
    high: 'bg-red-400',
    medium: 'bg-yellow-400',
    low: 'bg-blue-400',
}

export default async function PersonalTodos() {
    const user = await getCurrentUser()
    if (!user?.communityId) return null

    const todos = await getPersonalTodos(user.id, user.communityId)

    return (
        <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Your Action Items</h3>

            {todos.length === 0 ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <p className="text-sm">You&apos;re all caught up!</p>
                </div>
            ) : (
                todos.map(todo => {
                    const { icon: Icon, color } = TODO_ICONS[todo.type]
                    return (
                        <div key={todo.id} className="flex items-start gap-3">
                            <div className={cn(
                                'w-2 h-2 rounded-full mt-2 shrink-0',
                                URGENCY_DOT[todo.urgency]
                            )} />
                            <div className="flex-1">
                                <p className="text-sm font-medium">{todo.title}</p>
                                <p className="text-xs text-muted-foreground">{todo.description}</p>
                            </div>
                            <Link href={todo.href}>
                                <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0">
                                    Go →
                                </Button>
                            </Link>
                        </div>
                    )
                })
            )}
        </Card>
    )
}
