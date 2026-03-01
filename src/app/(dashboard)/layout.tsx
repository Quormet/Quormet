/**
 * Provides the dashboard's layout, including side navigation with links to key 
 * community management features, user profile information, and authentication checks.
 */
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signOut } from "@/app/auth/actions";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId) {
        redirect("/onboarding");
    }

    const [community] = await db.select().from(communities).where(eq(communities.id, dbUser.communityId)).limit(1);

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50 md:flex-row">
            <SidebarNav
                role={dbUser.role || "member"}
                communityName={community?.name || ""}
                joinCode={community?.joinCode || ""}
                userName={dbUser.name}
            />

            <main className="flex-1 flex flex-col min-h-0 overflow-auto">
                {children}
            </main>
        </div>
    );
}
