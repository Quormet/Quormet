import { getVendors } from '../issues/actions'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Briefcase, Mail, Phone, Tag } from 'lucide-react'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { vendorRatings, vendors, issues } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { format } from 'date-fns'

export default async function VendorsPage() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') redirect('/home')

    const vendorsList = await getVendors()

    // Fetch rating stats for each vendor
    const vendorDetails = await Promise.all(
        vendorsList.map(async (v) => {
            const stats = await db.select({
                avgRating: sql<number>`avg(${vendorRatings.rating})`,
                count: sql<number>`count(${vendorRatings.id})`,
            }).from(vendorRatings).where(eq(vendorRatings.vendorId, v.id))

            const [lastIssue] = await db.select().from(issues)
                .where(eq(issues.assignedVendorId, v.id))
                .orderBy(sql`${issues.updatedAt} DESC`)
                .limit(1)

            return {
                ...v,
                avgRating: stats[0]?.avgRating ? Number(Number(stats[0].avgRating).toFixed(1)) : 0,
                jobCount: stats[0]?.count ? Number(stats[0].count) : 0,
                lastUsed: lastIssue?.updatedAt,
            }
        })
    )

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Vendor Directory</h1>
                    <p className="text-muted-foreground text-sm">Manage contractors and service providers.</p>
                </div>
                {/* Placeholder for Add Vendor in the future */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {vendorDetails.map((v) => (
                    <Card key={v.id} className="hover:border-primary/50 transition-colors bg-card shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary" />
                                {v.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span key={star} className={`text-lg leading-none ${star <= Math.round(v.avgRating) ? 'text-amber-400' : 'text-slate-200'}`}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span className="text-sm font-semibold">{v.avgRating || 'No ratings'}</span>
                                <span className="text-xs text-muted-foreground ml-auto">{v.jobCount} {v.jobCount === 1 ? 'job' : 'jobs'}</span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Tag className="w-4 h-4 text-slate-400" />
                                    <span className="capitalize">{v.categories?.join(', ') || 'General'}</span>
                                </div>
                                {v.phone && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span>{v.phone}</span>
                                    </div>
                                )}
                                {v.email && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span>{v.email}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t text-xs text-muted-foreground text-center">
                                Last assigned: {v.lastUsed ? format(new Date(v.lastUsed), 'MMM d, yyyy') : 'Never'}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {vendorDetails.length === 0 && (
                    <div className="col-span-full text-center py-12 border border-dashed rounded-lg bg-slate-50">
                        <p className="text-muted-foreground">No vendors exist in the directory yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
