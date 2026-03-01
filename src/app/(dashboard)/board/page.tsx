import { getHelpRequests } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, HandHelping, BriefcaseBusiness, Lock } from 'lucide-react'
import { db } from '@/db'
import { getPlanAccess } from '@/utils/planAccess'
import { users, helpOffers, communities } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'
import Link from 'next/link'
import OfferHelpButton from './offer-button'
import ResolveRequestButton from './resolve-button'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { getTerms } from '@/utils/communityTerms'
import { redirect } from 'next/navigation'

export default async function HelpBoardPage() {
    const dbUser = await getCurrentUser()
    if (!dbUser || !dbUser.communityId) redirect('/onboarding')

    const planAccess = await getPlanAccess()

    const [community] = await db.select().from(communities).where(eq(communities.id, dbUser.communityId)).limit(1)
    const terms = getTerms(community?.communityType || 'default')

    const requests = await getHelpRequests()

    const enrichedRequests = await Promise.all(
        requests.map(async (req) => {
            const [author] = await db.select({ name: users.name }).from(users).where(eq(users.id, req.requestedBy)).limit(1)
            const offersList = await db.select().from(helpOffers).where(eq(helpOffers.requestId, req.id))
            const hasOffered = offersList.some(offer => offer.offeredBy === dbUser.id)
            return {
                ...req,
                authorName: author?.name || 'Unknown Member',
                offerCount: offersList.length,
                hasOffered
            }
        })
    )

    const memberLabel = terms.memberLabel || 'member'
    const memberLabelCapitalized = memberLabel.charAt(0).toUpperCase() + memberLabel.slice(1)

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Community Board</h1>
                    <p className="text-slate-500 mt-1">A place to request assistance or offer a helping hand to your fellow members.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/board/new"><PlusCircle className="mr-2 h-4 w-4" /> Post Request</Link>
                    </Button>
                    <Button variant="outline" className={!planAccess?.isCommunity && !planAccess?.isPro ? 'opacity-50 pointer-events-none' : ''} title={(!planAccess?.isCommunity && !planAccess?.isPro) ? "Upgrade to post paid gigs" : ""}>
                        <BriefcaseBusiness className="mr-2 h-4 w-4" /> Post Paid Gig
                        {!planAccess?.isCommunity && !planAccess?.isPro && <Lock className="ml-2 h-3 w-3 text-amber-600" />}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {enrichedRequests.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white border border-dashed rounded-lg">
                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                            <HandHelping className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No help requests</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            Be the first to ask your fellow {memberLabel.toLowerCase()}s for a hand!
                        </p>
                    </div>
                ) : (
                    enrichedRequests.map(req => (
                        <Card key={req.id} className="overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl mb-1 flex items-center gap-2">
                                            {req.title}
                                        </CardTitle>
                                        <CardDescription>
                                            <span className="font-medium text-slate-700">{req.authorName}</span>
                                            <span> • </span>
                                            <span>Posted {format(new Date(req.createdAt), 'MMM d')}</span>
                                            {req.neededBy && (
                                                <>
                                                    <span> • </span>
                                                    <span className="text-amber-600 font-medium">Needed by {format(new Date(req.neededBy), 'MMM d, h:mm a')}</span>
                                                </>
                                            )}
                                        </CardDescription>
                                    </div>
                                    {req.requestedBy === dbUser.id && !req.isResolved && (
                                        <ResolveRequestButton requestId={req.id} />
                                    )}
                                    {req.isResolved && (
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                            Resolved
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-slate-700 leading-relaxed">{req.description}</p>
                                {req.tags && req.tags.length > 0 && (
                                    <div className="flex gap-2 mt-4 flex-wrap">
                                        <span className="text-sm text-slate-500 mr-2 mt-0.5 font-medium">Topic:</span>
                                        {req.tags.map((tag: string) => (
                                            <span key={tag} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 transition-colors hover:bg-blue-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 border-t py-3 px-6 flex justify-between items-center">
                                <p className="text-sm text-slate-500 font-medium italic">
                                    {req.offerCount === 0
                                        ? 'Be the first to offer help!'
                                        : req.offerCount === 1
                                            ? '1 member offered to help'
                                            : `${req.offerCount} members offered to help`}
                                </p>
                                {req.requestedBy !== dbUser.id && !req.isResolved && (
                                    <OfferHelpButton requestId={req.id} hasOffered={req.hasOffered} />
                                )}
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
