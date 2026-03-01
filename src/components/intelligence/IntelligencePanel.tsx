import { Card, CardContent } from '@/components/ui/card'
import NudgeCard from './NudgeCard'
import { generateNudges } from '@/utils/intelligence/generateNudges'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { Brain, Lock } from 'lucide-react'

export default async function IntelligencePanel({ isLocked }: { isLocked?: boolean }) {
    const user = await getCurrentUser()
    if (!user?.communityId || user.role !== 'admin') return null

    const nudges = await generateNudges(user.communityId)

    if (nudges.length === 0) return (
        <Card className="bg-slate-50/50 border-dashed border-2">
            <CardContent className="p-6 text-center space-y-2">
                <Brain className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-medium text-slate-600">All caught up</p>
                <p className="text-xs text-slate-400">No action items right now.</p>
            </CardContent>
        </Card>
    )

    return (
        <div className={`space-y-3 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Quormet Intelligence</h3>
                {isLocked ? (
                    <span className="text-xs text-amber-600 font-medium ml-auto flex items-center gap-1"><Lock className="w-3 h-3" /> Upgrade to Pro</span>
                ) : (
                    <span className="text-xs text-muted-foreground ml-auto">Updated just now</span>
                )}
            </div>
            {nudges.map(nudge => (
                <NudgeCard key={nudge.id} nudge={nudge} />
            ))}
        </div>
    )
}
