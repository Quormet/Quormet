import { Calendar, Megaphone, BarChart2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'

export default function AssistantActionCard({ type, data }: { type: string; data: any }) {
    if (type === 'announcement') return (
        <Card className="p-3 mt-2 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-2 mb-1">
                <Megaphone className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-500">Announcement Posted</span>
            </div>
            <p className="font-semibold text-sm">{data.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.body}</p>
            <Link href="/home">
                <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">View Dashboard →</Button>
            </Link>
        </Card>
    )

    if (type === 'event') return (
        <Card className="p-3 mt-2 border-l-4 border-l-green-500">
            <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-green-500">Event Created</span>
            </div>
            <p className="font-semibold text-sm">{data.name}</p>
            <p className="text-xs text-muted-foreground">
                {format(new Date(data.startsAt), 'MMM d · h:mm a')}
                {data.location && ` · ${data.location}`}
            </p>
            <Link href="/events">
                <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">View Events →</Button>
            </Link>
        </Card>
    )

    if (type === 'poll') return (
        <Card className="p-3 mt-2 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-2 mb-1">
                <BarChart2 className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-500">Poll Created</span>
            </div>
            <p className="font-semibold text-sm">{data.question}</p>
            <p className="text-xs text-muted-foreground">{data.options?.length} options</p>
            <Link href="/polls">
                <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">View Polls →</Button>
            </Link>
        </Card>
    )

    return null
}
