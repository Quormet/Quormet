import { getIssues, getVendors } from './actions'
import { getCurrentUser } from '@/utils/getCurrentUser'
import Link from 'next/link'
import ReportIssueModal from '@/components/issues/ReportIssueModal'
import StatusBadge from '@/components/issues/StatusBadge'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'

export default async function IssuesPage() {
    const user = await getCurrentUser()
    if (!user) return null

    const issuesWithDetails = await getIssues()

    // Stats (Admin view)
    const stats = {
        submitted: issuesWithDetails.filter(i => i.issue.status === 'submitted').length,
        board_review: issuesWithDetails.filter(i => i.issue.status === 'board_review').length,
        vendor_assigned: issuesWithDetails.filter(i => i.issue.status === 'vendor_assigned').length,
        in_progress: issuesWithDetails.filter(i => i.issue.status === 'in_progress').length,
        resolved: issuesWithDetails.filter(i => i.issue.status === 'resolved').length,
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {user.role === 'admin' ? 'All Issues' : 'My Issues'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {user.role === 'admin'
                            ? `Manage maintenance and community reports (${issuesWithDetails.length} total).`
                            : 'Track the status of issues you have reported.'}
                    </p>
                </div>
                <ReportIssueModal />
            </div>

            {user.role === 'admin' && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="p-4 flex flex-col justify-center items-center text-center bg-slate-50 border-0 shadow-none">
                        <p className="text-muted-foreground text-xs uppercase font-semibold">Submitted</p>
                        <p className="text-2xl font-bold">{stats.submitted}</p>
                    </Card>
                    <Card className="p-4 flex flex-col justify-center items-center text-center bg-slate-50 border-0 shadow-none">
                        <p className="text-muted-foreground text-xs uppercase font-semibold">Review</p>
                        <p className="text-2xl font-bold">{stats.board_review}</p>
                    </Card>
                    <Card className="p-4 flex flex-col justify-center items-center text-center bg-slate-50 border-0 shadow-none">
                        <p className="text-muted-foreground text-xs uppercase font-semibold">Vendor</p>
                        <p className="text-2xl font-bold">{stats.vendor_assigned}</p>
                    </Card>
                    <Card className="p-4 flex flex-col justify-center items-center text-center bg-slate-50 border-0 shadow-none">
                        <p className="text-muted-foreground text-xs uppercase font-semibold">In Progress</p>
                        <p className="text-2xl font-bold">{stats.in_progress}</p>
                    </Card>
                    <Card className="p-4 flex flex-col justify-center items-center text-center bg-slate-50 border-0 shadow-none">
                        <p className="text-muted-foreground text-xs uppercase font-semibold">Resolved</p>
                        <p className="text-2xl font-bold">{stats.resolved}</p>
                    </Card>
                </div>
            )}

            <div className="grid gap-4 bg-background">
                {issuesWithDetails.map(({ issue, reporterName, vendorName }) => (
                    <Link key={issue.id} href={`/issues/${issue.id}`} className="block">
                        <Card className="p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-card shadow-sm group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{issue.title}</h3>
                                        <StatusBadge status={issue.status} />
                                    </div>
                                    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                                        <span>{issue.location}</span>
                                        <span>&bull;</span>
                                        {user.role === 'admin' && (
                                            <>
                                                <span>Reported by {reporterName || 'Unknown'}</span>
                                                <span>&bull;</span>
                                            </>
                                        )}
                                        <span>Submitted {format(new Date(issue.createdAt), 'MMM d, yyyy')}</span>
                                        {vendorName && (
                                            <>
                                                <span>&bull;</span>
                                                <span className="text-primary font-medium">{vendorName}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
                {issuesWithDetails.length === 0 && (
                    <div className="text-center py-12 border border-dashed rounded-lg bg-slate-50">
                        <p className="text-muted-foreground">No issues found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
