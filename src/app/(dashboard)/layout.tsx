export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, communities } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Building, LayoutDashboard, Megaphone, Vote, Coins, FileText, Calendar, Users } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    //this is the database thing
    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!dbUser || !dbUser.communityId) {
        redirect("/onboarding");
    }


    const [community] = await db.select().from(communities).where(eq(communities.id, dbUser.communityId)).limit(1);

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Announcements", href: "/announcements", icon: Megaphone },
        { name: "Voting & Polls", href: "/polls", icon: Vote },
        { name: "Dues & Payments", href: "/dues", icon: Coins },
        { name: "Document Vault", href: "/documents", icon: FileText },
        { name: "Events", href: "/events", icon: Calendar },
        { name: "Directory", href: "/directory", icon: Users },
    ];

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50 md:flex-row">
            <aside className="w-full md:w-64 border-r bg-white flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Building className="h-6 w-6 text-blue-600" />
                        <span className="font-bold text-lg tracking-tight">Quormet</span>
                    </Link>
                </div>

                <div className="p-4 space-y-1 flex-1 overflow-auto">
                    <div className="mb-6 px-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Community</p>
                        <p className="font-medium text-slate-900 truncate">{community?.name}</p>
                        {dbUser.role === "admin" && (
                            <p className="text-xs text-slate-500 mt-1">Join Code: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">{community?.joinCode}</span></p>
                        )}
                    </div>

                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-6">Menu</p>
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.href} className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors">
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div className="h-16 border-t flex items-center px-6 justify-between">
                    <div className="flex items-center gap-3">
                        <UserButton afterSignOutUrl="/" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium truncate w-32">{dbUser.name}</span>
                            <span className="text-xs text-slate-500 capitalize">{dbUser.role}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Nav Top Bar omitted for brevity but should be added later */}

            <main className="flex-1 flex flex-col min-h-0 overflow-auto">
                {children}
            </main>
        </div>
    );
}
