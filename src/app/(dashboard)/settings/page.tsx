import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communities, communityMembers } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Users, Key, Building2, ShieldCheck, ArrowUpRight, Copy } from "lucide-react";
import { updateCommunitySettings } from "./actions";
import { PlanUpgradeButton } from "./plan-upgrade-button";

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
    free: { label: "Free", color: "bg-slate-100 text-slate-700" },
    community: { label: "Community", color: "bg-blue-100 text-blue-700" },
    pro: { label: "Pro", color: "bg-indigo-100 text-indigo-700" },
    scale: { label: "Scale", color: "bg-purple-100 text-purple-700" },
};

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId || dbUser.role !== "admin") {
        notFound();
    }

    const [community] = await db.select().from(communities).where(eq(communities.id, dbUser.communityId)).limit(1);

    const [{ memberCount }] = await db
        .select({ memberCount: count() })
        .from(communityMembers)
        .where(eq(communityMembers.communityId, community.id));

    const planInfo = PLAN_LABELS[community.plan] ?? { label: community.plan, color: "bg-slate-100 text-slate-700" };

    return (
        <div className="p-6 md:p-10 max-w-3xl mx-auto w-full space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Building2 className="w-7 h-7 text-blue-600" />
                    Community Settings
                </h1>
                <p className="text-slate-500 mt-1">Manage your community details, members, and billing.</p>
            </div>

            {/* General */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">General</CardTitle>
                    <CardDescription>Update your community&apos;s display name.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={updateCommunitySettings} className="space-y-4 max-w-sm">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-medium text-slate-700">Community Name</label>
                            <Input id="name" name="name" defaultValue={community.name} required className="h-10" />
                        </div>
                        <Button type="submit" size="sm">Save Changes</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Membership */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" /> Membership
                    </CardTitle>
                    <CardDescription>Overview of your community members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{memberCount}</p>
                            <p className="text-sm text-slate-500">
                                of {community.planMemberLimit ?? 20} member limit
                            </p>
                        </div>
                        <div className="w-32 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${Math.min((memberCount / (community.planMemberLimit ?? 20)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Invite Code */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-600" /> Join Code
                    </CardTitle>
                    <CardDescription>Share this code with members so they can join your community during sign-up.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 max-w-xs">
                        <div className="flex-1 bg-slate-100 border rounded-lg py-3 px-4 text-center font-mono text-2xl tracking-[0.3em] font-bold text-blue-700">
                            {community.joinCode}
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 max-w-xs">
                        Only share this with verified residents. Anyone with this code can join your community.
                    </p>
                </CardContent>
            </Card>

            {/* Billing */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" /> Plan &amp; Billing
                    </CardTitle>
                    <CardDescription>Manage your subscription tier and feature access.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 capitalize">{community.plan} Plan</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planInfo.color}`}>
                                    {planInfo.label}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500">
                                {community.plan === 'free'
                                    ? `Up to ${community.planMemberLimit ?? 20} members included`
                                    : `Renews ${community.planExpiresAt?.toLocaleDateString() ?? 'N/A'}`}
                            </p>
                        </div>
                        {community.plan === 'free' ? (
                            <PlanUpgradeButton />
                        ) : (
                            <Button disabled variant="outline" size="sm" className="text-slate-400 cursor-not-allowed gap-1">
                                Manage <ArrowUpRight className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    {community.plan === 'free' && (
                        <div className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>Upgrade to unlock the AI assistant, quorum transparency, workflow automations, and extended member limits.</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
