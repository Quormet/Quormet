/**
 * Provides the dashboard's layout, including side navigation with links to key 
 * community management features, user profile information, and authentication checks.
 */
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communities, communityMembers, polls, votes, issues } from "@/db/schema";
import { eq, inArray, and, gt, isNull, or } from "drizzle-orm";
import { signOut } from "@/app/auth/actions";
import { cookies } from "next/headers";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import AssistantPanel from "@/components/assistant/AssistantPanel";
import { getPlanAccess } from "@/utils/planAccess";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    let user = (await supabase.auth.getUser()).data.user;

    if (!user) redirect("/auth/login");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);

    const memberships = dbUser
        ? await db.select().from(communityMembers).where(eq(communityMembers.userId, dbUser.id))
        : [];

    if (!dbUser || memberships.length === 0) {
        if (!dbUser?.communityId) redirect("/onboarding");
    }

    const cookieStore = await cookies();
    const activeCookieVal = cookieStore.get("quormet_active_community")?.value;
    const activeCommunityId = activeCookieVal
        ? parseInt(activeCookieVal)
        : (memberships[0]?.communityId ?? dbUser?.communityId);

    const validMembership = memberships.find(m => m.communityId === activeCommunityId)
        ?? memberships[0];

    if (!validMembership && !dbUser?.communityId) {
        redirect("/onboarding");
    }

    const resolvedCommunityId = validMembership?.communityId ?? dbUser?.communityId!;
    const resolvedRole = validMembership?.role ?? dbUser?.role ?? "member";

    const [community] = await db.select().from(communities).where(eq(communities.id, resolvedCommunityId)).limit(1);

    let allCommunities: { id: number; name: string }[] = [];
    if (memberships.length > 0) {
        const communityIds = memberships.map(m => m.communityId);
        allCommunities = await db.select({ id: communities.id, name: communities.name })
            .from(communities)
            .where(inArray(communities.id, communityIds));
    }

    const planAccess = await getPlanAccess();

    // Notification counts for sidebar badges
    let notifs: Record<string, number> = {};
    if (dbUser && resolvedCommunityId) {
        // Unvoted active polls
        const now = new Date();
        const activePollsRaw = await db.select({ id: polls.id })
            .from(polls)
            .where(and(
                eq(polls.communityId, resolvedCommunityId),
                or(isNull(polls.endsAt), gt(polls.endsAt, now))
            ));
        const userVoteRows = await db.select({ pollId: votes.pollId })
            .from(votes)
            .where(eq(votes.userId, dbUser.id));
        const userVotedPollIds = new Set(userVoteRows.map(v => v.pollId));
        const unvotedCount = activePollsRaw.filter(p => !userVotedPollIds.has(p.id)).length;
        if (unvotedCount > 0) notifs['/polls'] = unvotedCount;

        // Open issues (submitted / in_progress)
        const openIssuesCount = await db.select({ id: issues.id })
            .from(issues)
            .where(and(
                eq(issues.communityId, resolvedCommunityId),
                inArray(issues.status, ['submitted', 'board_review', 'in_progress'])
            ));
        if (openIssuesCount.length > 0) notifs['/issues'] = openIssuesCount.length;
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 flex-col md:flex-row">
            <SidebarNav
                role={resolvedRole}
                communityName={community?.name || ""}
                communityType={community?.communityType || "default"}
                joinCode={community?.joinCode || ""}
                userName={dbUser?.name || ""}
                activeCommunityId={resolvedCommunityId}
                memberships={memberships.map(m => ({ id: m.id, communityId: m.communityId, role: m.role }))}
                communities={allCommunities}
                notifs={notifs}
            />

            <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-y-auto">
                {children}
            </main>
            <AssistantPanel userRole={resolvedRole as 'admin' | 'member'} canUseAI={planAccess?.canUseAI ?? false} />
        </div>
    );
}
