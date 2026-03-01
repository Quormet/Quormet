import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communities, payments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, CheckCircle2, Clock, AlertCircle, ExternalLink, BrainCircuit } from "lucide-react";
import { format } from "date-fns";
import { createCheckoutSession, updateCommunityDues, markUserPaid } from "./actions";
import { WolframAnalytics } from "@/app/(dashboard)/dues/wolfram-analytics";

export default async function DuesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId) redirect("/onboarding");

    const [community] = await db.select().from(communities).where(eq(communities.id, dbUser.communityId)).limit(1);


    const userPayments = await db.select()
        .from(payments)
        .where(eq(payments.userId, dbUser.id))
        .orderBy(desc(payments.paidAt));


    let allMembers: typeof users.$inferSelect[] = [];
    if (dbUser.role === "admin") {
        allMembers = await db.select().from(users).where(eq(users.communityId, dbUser.communityId));
    }

    const duesAmountDollars = (community.duesAmount / 100).toFixed(2);
    const duesConfigured = community.duesAmount > 0;

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dues & Payments</h1>
                <p className="text-slate-500 mt-1">Manage your community contributions.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Member Status Card */}
                <Card className={dbUser.duesPaid ? "border-emerald-200" : "border-red-200"}>
                    <div className={`h-2 w-full absolute top-0 left-0 ${dbUser.duesPaid ? "bg-emerald-500" : "bg-red-500"}`} />
                    <CardHeader className="pt-8">
                        <CardTitle>Your Dues Status</CardTitle>
                        <CardDescription>
                            {community.duesPeriod.charAt(0).toUpperCase() + community.duesPeriod.slice(1)} dues for {community.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Amount:</span>
                            <span className="text-2xl font-bold">${duesAmountDollars}</span>
                        </div>

                        <div className="p-4 rounded-lg flex items-center gap-3 bg-slate-50">
                            {dbUser.duesPaid ? (
                                <>
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                    <div>
                                        <p className="font-semibold text-emerald-800">Paid in full</p>
                                        <p className="text-xs text-emerald-600">You are all caught up for this period.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                    <div>
                                        <p className="font-semibold text-red-800">Payment Required</p>
                                        <p className="text-xs text-red-600">Your dues for this period are unpaid.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        {!dbUser.duesPaid && duesConfigured && (
                            <form action={createCheckoutSession} className="w-full">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit">
                                    Pay Now securely with Stripe
                                </Button>
                            </form>
                        )}
                        {!dbUser.duesPaid && !duesConfigured && (
                            <p className="text-sm text-amber-600 text-center w-full">
                                Your admin has not configured the dues amount yet.
                            </p>
                        )}
                    </CardFooter>
                </Card>

                {/* Payment History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>Your past payments to the community</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {userPayments.length === 0 ? (
                            <p className="text-sm text-slate-500 py-4 text-center">No payment history found.</p>
                        ) : (
                            <div className="space-y-3">
                                {userPayments.map(p => (
                                    <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium">${(p.amount / 100).toFixed(2)}</span>
                                            <span className="text-xs text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</span>
                                        </div>
                                        {p.stripeSessionId === "manual_override" ? (
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Manual Entry</span>
                                        ) : (
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Stripe</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {dbUser.role === "admin" && (
                    <>
                        {/* Admin: Config */}
                        <Card className="md:col-span-2 border-slate-300 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">ADMIN VIEW</div>
                            <CardHeader className="pt-6">
                                <CardTitle>Configure Community Dues</CardTitle>
                                <CardDescription>Set the amount and frequency of dues for your community members.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={updateCommunityDues} className="flex flex-col sm:flex-row gap-4 items-end">
                                    <div className="space-y-2 flex-1 w-full">
                                        <label htmlFor="amount" className="text-sm font-medium">Amount ($)</label>
                                        <Input id="amount" name="amount" type="number" step="0.01" min="0" defaultValue={duesAmountDollars} required />
                                    </div>
                                    <div className="space-y-2 flex-1 w-full">
                                        <label htmlFor="period" className="text-sm font-medium">Billing Period</label>
                                        <select name="period" id="period" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" defaultValue={community.duesPeriod}>
                                            <option value="monthly">Monthly</option>
                                            <option value="annual">Annually</option>
                                            <option value="one-time">One-time</option>
                                        </select>
                                    </div>
                                    <Button type="submit" className="w-full sm:w-auto">Save Settings</Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Wolfram Award Section */}
                        <Card className="md:col-span-2 border-purple-200 bg-purple-50/30">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <BrainCircuit className="h-5 w-5 text-purple-600" />
                                    <CardTitle className="text-purple-900">Wolfram Finance Intelligence</CardTitle>
                                    <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">WOLFRAM AWARD</span>
                                </div>
                                <CardDescription className="text-purple-700">
                                    Leverage Wolfram Alpha's computational engine to analyze community financial health.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <WolframAnalytics payments={userPayments} communityName={community.name} />
                            </CardContent>
                        </Card>

                        {/* Admin: Member Status List */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Member Dues Status</CardTitle>
                                <CardDescription>Track who has paid and manually override statuses for cash/check payments.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 font-medium text-slate-500">Member Name</th>
                                                <th className="px-4 py-3 font-medium text-slate-500">Email</th>
                                                <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                                                <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {allMembers.map(member => (
                                                <tr key={member.id} className="hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-medium">{member.name} {member.id === dbUser.id && "(You)"}</td>
                                                    <td className="px-4 py-3 text-slate-500">{member.email}</td>
                                                    <td className="px-4 py-3">
                                                        {member.duesPaid ? (
                                                            <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Paid
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium bg-red-50 text-red-700">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Unpaid
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <form action={async () => {
                                                            "use server";
                                                            await markUserPaid(member.id, !member.duesPaid);
                                                        }}>
                                                            <Button type="submit" variant="ghost" size="sm" className={member.duesPaid ? "text-red-600 hover:text-red-700" : "text-emerald-600 hover:text-emerald-700"}>
                                                                {member.duesPaid ? "Mark Unpaid" : "Mark Paid"}
                                                            </Button>
                                                        </form>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
