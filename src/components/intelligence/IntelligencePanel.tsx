import NudgeCard from './NudgeCard'
import { generateNudges } from '@/utils/intelligence/generateNudges'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { Brain } from 'lucide-react'

export default async function IntelligencePanel() {
    const user = await getCurrentUser()
    if (!user?.communityId || user.role !== 'admin') return null

    const nudges = await generateNudges(user.communityId)

    if (nudges.length === 0) return (
        <div className="border rounded-xl p-6 text-center space-y-2">
            <Brain className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">All caught up</p>
            <p className="text-xs text-muted-foreground">No action items right now.</p>
        </div>
    )

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Quormet Intelligence</h3>
                <span className="text-xs text-muted-foreground ml-auto">Updated just now</span>
            </div>
            {nudges.map(nudge => (
                <NudgeCard key={nudge.id} nudge={nudge} />
            ))}
        </div>
    )
}
