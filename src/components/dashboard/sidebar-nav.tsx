"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building, LayoutDashboard, Megaphone, Vote, Coins, FileText, Calendar, Users, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { signOut } from "@/app/auth/actions";

const allNavItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Announcements", href: "/announcements", icon: Megaphone },
    { name: "Voting & Polls", href: "/polls", icon: Vote },
    { name: "Dues & Payments", href: "/dues", icon: Coins },
    { name: "Document Vault", href: "/documents", icon: FileText },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Directory", href: "/directory", icon: Users },
];

export function SidebarNav({ role, communityName, joinCode, userName }: { role: string, communityName: string, joinCode: string, userName: string }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const navItems = [...allNavItems];
    if (role === "admin") {
        navItems.push({ name: "Settings", href: "/settings", icon: Settings });
    }

    const renderNavLinks = () => (
        <>
            <div className="mb-6 px-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Community</p>
                <p className="font-medium text-slate-900 truncate">{communityName || "Community"}</p>
                {role === "admin" && (
                    <p className="text-xs text-slate-500 mt-1">Join Code: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">{joinCode}</span></p>
                )}
            </div>

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-6">Menu</p>
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                            ? "bg-slate-100 text-blue-700"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                );
            })}
        </>
    );

    const renderUserMenu = () => (
        <div className="flex items-center gap-3 mb-2 px-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                {userName ? userName[0] : "U"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate">{userName || "User"}</span>
                <span className="text-xs text-slate-500 capitalize">{role}</span>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header & Nav */}
            <div className="md:hidden flex h-14 items-center justify-between px-4 border-b bg-white sticky top-0 z-30">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    <span className="font-bold tracking-tight">Quormet</span>
                </Link>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <div className="p-4 space-y-1 flex-1 overflow-auto mt-6">
                            {renderNavLinks()}
                        </div>
                        <div className="p-4 border-t bg-slate-50">
                            {renderUserMenu()}
                            <form action={signOut}>
                                <button type="submit" className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-600 transition-colors mt-2 w-full text-left px-2">
                                    <LogOut className="h-3 w-3" />
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="w-64 border-r bg-white flex-col hidden md:flex shrink-0 h-screen sticky top-0">
                <div className="h-16 flex items-center px-6 border-b shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Building className="h-6 w-6 text-blue-600" />
                        <span className="font-bold text-lg tracking-tight">Quormet</span>
                    </Link>
                </div>

                <div className="p-4 space-y-1 flex-1 overflow-auto">
                    {renderNavLinks()}
                </div>
                <div className="border-t flex flex-col p-4 shrink-0 bg-slate-50/50">
                    {renderUserMenu()}
                    <form action={signOut}>
                        <button type="submit" className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-600 transition-colors px-2">
                            <LogOut className="h-3 w-3" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
