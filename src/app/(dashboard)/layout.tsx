/**
 * Provides the dashboard's layout, including side navigation with links to key 
 * community management features, user profile information, and authentication checks.
 */
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communities, communityMembers } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { signOut } from "@/app/auth/actions";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/sign-in");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);

    const memberships = dbUser
        ? await db.select().from(communityMembers).where(eq(communityMembers.userId, dbUser.id))
        : [];

    if (!dbUser || memberships.length === 0) {
        if (!dbUser?.communityId) redirect("/onboarding");
    }

    const { cookies } = await import("next/headers");
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
            />

            <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
