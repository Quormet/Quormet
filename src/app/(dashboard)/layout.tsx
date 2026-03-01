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

    if (!user) redirect("/auth/login");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);

    // Fetch all memberships for this user
    const memberships = dbUser
        ? await db.select().from(communityMembers).where(eq(communityMembers.userId, dbUser.id))
        : [];

    if (!dbUser || memberships.length === 0) {
        // No community membership at all → go to onboarding
        if (!dbUser?.communityId) redirect("/onboarding");
        // Has legacy communityId but no community_members rows (first login after migration)
        // Fall back: redirect to onboarding won't happen; rely on getCurrentUser fallback
    }

    // Determine active community from cookie
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const activeCookieVal = cookieStore.get("quormet_active_community")?.value;
    const activeCommunityId = activeCookieVal
        ? parseInt(activeCookieVal)
        : (memberships[0]?.communityId ?? dbUser?.communityId);

    // Ensure the cookie-stored communityId is actually one the user belongs to
    const validMembership = memberships.find(m => m.communityId === activeCommunityId)
        ?? memberships[0];

    if (!validMembership && !dbUser?.communityId) {
        redirect("/onboarding");
    }

    const resolvedCommunityId = validMembership?.communityId ?? dbUser?.communityId!;
    const resolvedRole = validMembership?.role ?? dbUser?.role ?? "member";

    // Fetch community record
    const [community] = await db.select().from(communities).where(eq(communities.id, resolvedCommunityId)).limit(1);

    // Fetch all communities for switcher (if user has multiple)
    let allCommunities: { id: number; name: string }[] = [];
    if (memberships.length > 0) {
        const communityIds = memberships.map(m => m.communityId);
        allCommunities = await db.select({ id: communities.id, name: communities.name })
            .from(communities)
            .where(inArray(communities.id, communityIds));
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50 md:flex-row">
            <SidebarNav
                role={resolvedRole}
                communityName={community?.name || ""}
                joinCode={community?.joinCode || ""}
                userName={dbUser?.name || ""}
                activeCommunityId={resolvedCommunityId}
                memberships={memberships.map(m => ({ id: m.id, communityId: m.communityId, role: m.role }))}
                communities={allCommunities}
            />

            <main className="flex-1 flex flex-col min-h-0 overflow-auto">
                {children}
            </main>
        </div>
    );
}
