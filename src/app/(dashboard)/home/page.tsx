import { getDashboardData } from './actions'
import AssistantPanel from '@/components/assistant/AssistantPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Megaphone, Vote, Coins, Calendar, ArrowRight, CheckCircle2, Clock, PlusCircle, Users } from "lucide-react"
import Link from "next/link"
import PersonalTodos from '@/components/intelligence/PersonalTodos'
import IntelligencePanel from '@/components/intelligence/IntelligencePanel'
import { format, formatDistanceToNow } from 'date-fns'
import { getTerms } from '@/utils/communityTerms'

export default async function DashboardPage() {
    const data = await getDashboardData()
    const { user, communityName, communityType, announcements, polls, events, stats, userVotes, userRsvps, health } = data
    const isAdmin = user.role === 'admin'
    const terms = getTerms(communityType)

    return (
        <div className="flex w-full h-full overflow-hidden">
            <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto w-full flex-1 overflow-y-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Good morning, {user.name.split(' ')[0]} <span className="inline-block animate-wave origin-[70%_70%]">👋</span></h1>
                        <p className="text-slate-500 mt-1 text-lg">{communityName}</p>
                    </div>

                    {isAdmin && (
                        <div className="flex gap-2">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                                <Link href="/settings"><PlusCircle className="mr-2 h-4 w-4" /> Manage Community</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {isAdmin && health && (
                    <Card className="bg-white border-slate-200 shadow-sm mb-8">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center justify-between">
                                Community Health Score
                                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${health.color.replace('text-', 'bg-').replace('-500', '-100')} ${health.color}`}>
                                    {health.label}
                                </span>
                            </CardTitle>
                            <CardDescription>{health.insight}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold flex-shrink-0 text-slate-800">{health.score}<span className="text-sm font-normal text-slate-500">/100</span></div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex-1">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${health.score >= 85 ? 'bg-green-500' : health.score >= 65 ? 'bg-blue-500' : health.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(100, Math.max(0, health.score))}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500">{terms.members}</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800">{stats.memberCount}</div>
                            <p className="text-xs text-slate-500 mt-1">Total {terms.members.toLowerCase()}</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500">Upcoming Events</CardTitle>
                            <Calendar className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800">{stats.eventCount}</div>
                            <p className="text-xs text-slate-500 mt-1">Scheduled this month</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500">Active Polls</CardTitle>
                            <Vote className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800">{stats.activePollsCount}</div>
                            <p className="text-xs text-slate-500 mt-1">Pending your vote</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-500 capitalize">{terms.fees}</CardTitle>
                            <Coins className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800 flex items-baseline gap-1">
                                {stats.paidCount} <span className="text-sm font-normal text-slate-500">/ {stats.totalCount}</span>
                            </div>
                            <div className="mt-2 w-full">
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${(stats.paidCount / (stats.totalCount || 1)) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                                    {stats.paidCount} of {stats.totalCount} paid
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {isAdmin && <IntelligencePanel />}
                        <PersonalTodos />

                        {/* Announcements */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold tracking-tight text-slate-800">Recent Announcements</h2>
                                <div className="flex gap-2">
                                    {isAdmin && (
                                        <Button variant="outline" size="sm" className="h-8 shadow-sm" asChild>
                                            <Link href="/announcements"><PlusCircle className="mr-1 h-3 w-3" /> Post Announcement</Link>
                                        </Button>
                                    )}
                                    <Button variant="link" size="sm" asChild>
                                        <Link href="/announcements">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {announcements.length === 0 ? (
                                    <Card className="bg-slate-50 border-dashed border-2">
                                        <CardContent className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
                                            <Megaphone className="h-8 w-8 mb-3 text-slate-400 opacity-50" />
                                            <p className="font-medium">No announcements yet.</p>
                                            <p className="text-sm mt-1">Check back later for community updates.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    announcements.map((ann) => (
                                        <Card key={ann.id} className="hover:border-blue-200 transition-colors">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-slate-900 leading-tight">{ann.title}</h3>
                                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap ml-3">
                                                        {formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                                                    {ann.body}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Active Polls */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold tracking-tight text-slate-800">Active Polls</h2>
                                <div className="flex gap-2">
                                    {isAdmin && (
                                        <Button variant="outline" size="sm" className="h-8 shadow-sm" asChild>
                                            <Link href="/polls"><PlusCircle className="mr-1 h-3 w-3" /> Start a Poll</Link>
                                        </Button>
                                    )}
                                    <Button variant="link" size="sm" asChild>
                                        <Link href="/polls">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {polls.length === 0 ? (
                                    <Card className="bg-slate-50 border-dashed border-2">
                                        <CardContent className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
                                            <Vote className="h-8 w-8 mb-3 text-slate-400 opacity-50" />
                                            <p className="font-medium">No active polls.</p>
                                            {isAdmin ? <p className="text-sm mt-1">Click New to ask the community a question.</p> : <p className="text-sm mt-1">Check back later.</p>}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    polls.map((poll) => {
                                        const hasVoted = userVotes.includes(poll.id);
                                        return (
                                            <Card key={poll.id} className="hover:border-emerald-200 transition-colors">
                                                <CardContent className="p-5">
                                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                                        <div>
                                                            <h3 className="font-bold text-slate-900">{poll.question}</h3>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                {hasVoted ? (
                                                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center">
                                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> You voted
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md flex items-center">
                                                                        <Clock className="h-3 w-3 mr-1" /> You haven't voted yet
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button variant={hasVoted ? "secondary" : "default"} size="sm" className="shrink-0 w-full sm:w-auto" asChild>
                                                            <Link href="/polls">{hasVoted ? "View Results" : "Vote Now"}</Link>
                                                        </Button>
                                                    </div>

                                                    {hasVoted && (poll as any).results?.topOption && (
                                                        <div className="mt-3 pt-3 border-t w-full animate-in fade-in slide-in-from-top-1 duration-500">
                                                            <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 uppercase font-semibold tracking-wider">
                                                                <span className="truncate max-w-[70%] text-slate-700">Leading: {(poll as any).results.topOption.option}</span>
                                                                <span className="text-blue-600">{(poll as any).results.topOption.percentage}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                                                    style={{ width: `${(poll as any).results.topOption.percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Events */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold tracking-tight text-slate-800">Upcoming Events</h2>
                                <div className="flex gap-2">
                                    {isAdmin && (
                                        <Button variant="outline" size="sm" className="h-8 shadow-sm" asChild>
                                            <Link href="/events"><PlusCircle className="mr-1 h-3 w-3" /> Create Event</Link>
                                        </Button>
                                    )}
                                    <Button variant="link" size="sm" asChild>
                                        <Link href="/events">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {events.length === 0 ? (
                                    <Card className="bg-slate-50 border-dashed border-2">
                                        <CardContent className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
                                            <Calendar className="h-8 w-8 mb-3 text-slate-400 opacity-50" />
                                            <p className="font-medium">No upcoming events.</p>
                                            <p className="text-sm mt-1">Nothing on the schedule right now.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    events.map((event) => {
                                        const rsvp = userRsvps.find(r => r.eventId === event.id);
                                        const isGoing = rsvp?.response === 'yes';

                                        return (
                                            <Card key={event.id} className="hover:border-indigo-200 transition-colors group">
                                                <CardContent className="p-0 flex h-full">
                                                    <div className="bg-slate-50 group-hover:bg-indigo-50 transition-colors w-24 shrink-0 flex flex-col justify-center items-center border-r p-3 sm:p-4 text-center">
                                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{format(new Date(event.startsAt), 'MMM')}</span>
                                                        <span className="text-3xl font-black text-slate-800">{format(new Date(event.startsAt), 'd')}</span>
                                                    </div>
                                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                                                        <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{event.name}</h3>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-slate-500 mb-3">
                                                            <span className="flex items-center"><Clock className="mr-1.5 h-3.5 w-3.5" />{format(new Date(event.startsAt), 'h:mm a')}</span>
                                                        </div>

                                                        <div className="mt-auto flex items-center justify-between">
                                                            {isGoing ? (
                                                                <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-2.5 py-1 rounded-md">
                                                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> You're going
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs font-medium text-slate-500">
                                                                    Not RSVP'd
                                                                </span>
                                                            )}
                                                            <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" asChild>
                                                                <Link href="/events">View <ArrowRight className="ml-1 h-3 w-3" /></Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AssistantPanel userRole={user.role as 'admin' | 'member'} />
        </div>
    );
}
