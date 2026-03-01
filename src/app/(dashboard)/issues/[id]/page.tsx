import { getIssue, getVendors } from '../actions'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { getPlanAccess } from '@/utils/planAccess'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, MapPin, Tag, ImageIcon, MessageSquare } from 'lucide-react'
import ProgressStepper from '@/components/issues/ProgressStepper'
import AdminStatusPanel from '@/components/issues/AdminStatusPanel'
import StarRating from '@/components/issues/StarRating'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function IssueDetailPage({ params }: { params: { id: string } }) {
    const user = await getCurrentUser()
    if (!user) return null

    // Await the params to prevent sync property access
    const resolvedParams = await Promise.resolve(params);
    const idValue = resolvedParams.id;

    const { issue, reporterName, vendorName, updates } = await getIssue(idValue)
    const vendors = user.role === 'admin' ? await getVendors() : []

    const planAccess = await getPlanAccess()
    const canAssignVendors = planAccess?.isCommunity ?? false

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col space-y-4">
                <Link href="/issues" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Issues
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{issue.title}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                                <AvatarFallback className="text-[10px]">{reporterName?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-700">{reporterName}</span>
                        </span>
                        <span>&bull;</span>
                        <span>{format(new Date(issue.createdAt), 'MMMM d, yyyy')}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            <span className="capitalize">{issue.category}</span>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {issue.location}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-slate-50/50">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Progress Tracking</h2>
                </div>
                <div className="p-6 overflow-x-auto">
                    <ProgressStepper currentStatus={issue.status} updates={updates} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b py-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Description</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm md:text-base">
                                {issue.description}
                            </p>

                            {issue.photoUrl && (
                                <div className="mt-6 border rounded-lg p-2 bg-slate-50 relative overflow-hidden group">
                                    <span className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur text-xs px-2 py-1 rounded font-medium shadow-sm flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" /> Photo Attached
                                    </span>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={issue.photoUrl} alt="Issue photo" className="w-full h-auto rounded-md object-cover max-h-[400px]" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b py-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Timeline & Updates</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 pb-2">
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {updates.map((update, idx) => (
                                    <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>

                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border shadow-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-sm capitalize text-slate-900">
                                                    {update.newStatus.replace('_', ' ')}
                                                </h4>
                                                <time className="text-xs text-slate-500 font-medium">{format(new Date(update.createdAt), 'MMM d, h:mm a')}</time>
                                            </div>
                                            {update.note ? (
                                                <p className="text-sm text-slate-600 mt-2 italic bg-slate-50 p-3 rounded-md border border-slate-100">
                                                    &quot;{update.note}&quot;
                                                </p>
                                            ) : (
                                                <p className="text-sm text-slate-500 mt-1">Status changed from {update.previousStatus ? update.previousStatus.replace('_', ' ') : 'new'} to {update.newStatus.replace('_', ' ')}.</p>
                                            )}
                                        </div>
                                    </div>
                                )).reverse()}
                            </div>
                        </CardContent>
                    </Card>

                </div>

                <div className="space-y-6">
                    {user.role === 'admin' ? (
                        <AdminStatusPanel
                            issueId={issue.id}
                            currentStatus={issue.status}
                            vendors={vendors}
                            currentVendorId={issue.assignedVendorId}
                            canAssignVendors={canAssignVendors}
                        />
                    ) : (
                        issue.status === 'resolved' && vendorName && (
                            <StarRating
                                issueId={issue.id}
                                vendorId={issue.assignedVendorId!}
                                vendorName={vendorName}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
