"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building, LayoutDashboard, Megaphone, Vote, Coins, FileText, Calendar, Users, LogOut, Settings, Menu, ChevronDown, Check, ClipboardList, Briefcase, MessageSquare, Search, HandHelping } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useTransition } from "react";
import { signOut } from "@/app/auth/actions";
import { setActiveCommunity } from "@/utils/setCommunity";
import { getTerms } from "@/utils/communityTerms";

const allNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Announcements", href: "/announcements", icon: Megaphone },
    { name: "Voting & Polls", href: "/polls", icon: Vote },
    { name: "Dues & Payments", href: "/payments", icon: Coins },
    { name: "Document Vault", href: "/documents", icon: FileText },
    { name: "Community Events", href: "/events", icon: Calendar },
    { name: "Directory", href: "/directory", icon: Users },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Issues", href: "/issues", icon: ClipboardList },
    { name: "Community Board", href: "/board", icon: HandHelping },
];

type Membership = {
    id: number;
    communityId: number;
    role: string;
};

type Community = {
    id: number;
    name: string;
};

export function SidebarNav({
    role,
    communityName,
    communityType = "default",
    joinCode,
    userName,
    activeCommunityId,
    memberships = [],
    communities = [],
    notifs = {},
}: {
    role: string;
    communityName: string;
    communityType?: string;
    joinCode: string;
    userName: string;
    activeCommunityId?: number;
    memberships?: Membership[];
    communities?: Community[];
    notifs?: Record<string, number>;
}) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const terms = getTerms(communityType);
    const duesLabelCapitalized = terms.fees.charAt(0).toUpperCase() + terms.fees.slice(1);

    const navItems = allNavItems.map(item => {
        if (item.name === "Dues & Payments") {
            return { ...item, name: `${duesLabelCapitalized} & Payments` };
        }
        return item;
    });

    if (role === "admin") {
        navItems.push({ name: "Vendors", href: "/vendors", icon: Briefcase });
        navItems.push({ name: "Settings", href: "/settings", icon: Settings });
    }

    function handleSwitchCommunity(communityId: number) {
        startTransition(async () => {
            await setActiveCommunity(communityId);
        });
    }

    const renderCommunitySwitcher = () => {
        // always show the dropdown even if there's only one (or zero) communities
        return (
            <div className="mb-6 px-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Community</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button suppressHydrationWarning disabled={isPending} className="w-full flex items-center justify-between gap-2 text-left font-medium text-slate-900 hover:text-blue-700 transition-colors">
                            <span className="truncate">{communityName || "Community"}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        {communities.map((c) => {
                            const m = memberships.find(m => m.communityId === c.id);
                            return (
                                <DropdownMenuItem
                                    key={c.id}
                                    onClick={() => handleSwitchCommunity(c.id)}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-medium text-sm">{c.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{m?.role || "member"}</p>
                                    </div>
                                    {c.id === activeCommunityId && <Check className="h-4 w-4 text-blue-600" />}
                                </DropdownMenuItem>
                            );
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/communities" className="text-sm text-slate-500">
                                + Join another community
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {role === "admin" && (
                    <p className="text-xs text-slate-500 mt-1">Join Code: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700">{joinCode}</span></p>
                )}
            </div>
        );
    };

    const renderNavLinks = () => (
        <>
            {renderCommunitySwitcher()}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-6">Menu</p>
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const dotCount = notifs[item.href] ?? 0;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                            ? "bg-blue-50 text-blue-700 border-l-[3px] border-blue-600 shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5 border-l-[3px] border-transparent"
                            }`}
                    >
                        <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-blue-600' : ''}`} />
                        <span className="flex-1">{item.name}</span>
                        {dotCount > 0 && (
                            <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-1 shadow-sm">
                                {dotCount > 9 ? '9+' : dotCount}
                            </span>
                        )}
                    </Link>
                );
            })}
        </>
    );

    const renderUserMenu = () => (
        <div className="flex items-center gap-3 mb-2 px-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
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
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20">
                        Q
                    </div>
                    <span className="font-bold tracking-tight">Quorify</span>
                </Link>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button suppressHydrationWarning variant="ghost" size="icon" className="-mr-2">
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
                            <div className="mt-4 px-2 text-[10px] text-slate-400 leading-tight">
                                Proudly supporting UN SDG 11 & 16.
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="w-64 border-r bg-white flex-col hidden md:flex shrink-0">
                <div className="h-16 flex items-center px-6 border-b shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                            Q
                        </div>
                        <span className="font-bold text-lg tracking-tight">Quorify</span>
                    </Link>
                </div>

                <div className="p-4 space-y-1 flex-1 overflow-auto">
                    {renderNavLinks()}
                </div>
                <div className="border-t flex flex-col p-4 shrink-0 bg-slate-50/50">
                    {renderUserMenu()}
                    <form action={signOut}>
                        <button type="submit" className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-600 transition-colors px-2 mt-2">
                            <LogOut className="h-3 w-3" />
                            Sign Out
                        </button>
                    </form>
                    <div className="mt-4 px-2 text-[10px] text-slate-400 leading-tight">
                        Proudly supporting UN SDG 11 & 16.
                    </div>
                </div>
            </aside>
        </>
    );
}
