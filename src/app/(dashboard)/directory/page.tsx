import { getCurrentUser } from "@/utils/getCurrentUser";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Phone, MapPin, EyeOff, Search, Lock } from "lucide-react";
import { ProfileForm } from "./profile-form";
import { getPlanAccess } from "@/utils/planAccess";

export default async function DirectoryPage() {
    const dbUser = await getCurrentUser();
    if (!dbUser || !dbUser.communityId) redirect("/onboarding");

    const planAccess = await getPlanAccess();

    // Admins see everyone. Members see only opted-in users (plus themselves).
    const conditions = dbUser.role === "admin"
        ? eq(users.communityId, dbUser.communityId)
        : and(
            eq(users.communityId, dbUser.communityId),
            or(eq(users.directoryOptIn, true), eq(users.id, dbUser.id))
        );

    const directoryMembers = await db.select().from(users).where(conditions);

    // Split into self and others
    const me = directoryMembers.find(m => m.id === dbUser.id);
    if (!me) return null; // Should not happen
    const membersList = directoryMembers.filter(m => m.id !== dbUser.id);

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Member Directory</h1>
                <p className="text-slate-500 mt-1">Connect with your fellow members and manage your profile.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
                {/* Profile Settings */}
                <Card className="md:col-span-1 border-blue-100 bg-blue-50/30">
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>Update your contact info and visibility.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm me={{
                            name: me.name,
                            email: me.email,
                            phone: me.phone,
                            address: me.address,
                            directoryOptIn: me.directoryOptIn
                        }} />
                    </CardContent>
                </Card>

                {/* Members List */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-slate-400" />
                        <h2 className="text-xl font-semibold">Members ({membersList.length})</h2>
                        {dbUser.role === "admin" && (
                            <span className="ml-auto text-xs bg-slate-800 text-white px-2 py-1 rounded">Admin: Viewing All</span>
                        )}
                    </div>

                    <div className={`relative ${!planAccess?.isCommunity && !planAccess?.isPro ? 'opacity-60 pointer-events-none' : ''}`}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or skill tag..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            disabled
                        />
                        {!planAccess?.isCommunity && !planAccess?.isPro && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-amber-600 text-xs font-medium">
                                <Lock className="h-3 w-3 mr-1" /> Upgrade to search skills
                            </div>
                        )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {membersList.length === 0 ? (
                            <div className="sm:col-span-2 text-center py-16 px-4 bg-white border border-dashed rounded-lg">
                                <Users className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-900 mb-1">Building the Directory</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    When other members opt-in to the directory, they will appear here. Encourage your members to join!
                                </p>
                                {dbUser.role === "admin" && (
                                    <p className="text-xs text-blue-600 mt-4 font-semibold uppercase tracking-wider">
                                        Admin Tip: You're seeing all members, but they must opt-in to see each other.
                                    </p>
                                )}
                            </div>
                        ) : (
                            membersList.map(member => (
                                <Card key={member.id} className="overflow-hidden">
                                    <CardHeader className="p-4 pb-2 bg-slate-50/50 border-b">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{member.name}</CardTitle>
                                            {!member.directoryOptIn && dbUser.role === "admin" && (
                                                <span title="User is hidden from members"><EyeOff className="h-4 w-4 text-slate-400" /></span>
                                            )}
                                        </div>
                                        {member.role === "admin" && (
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded mt-1">Admin</span>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                            <a href={`mailto:${member.email}`} className="hover:text-blue-600 truncate">{member.email}</a>
                                        </div>
                                        {member.phone && (
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                                <a href={`tel:${member.phone}`} className="hover:text-blue-600">{member.phone}</a>
                                            </div>
                                        )}
                                        {member.address && (
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span>{member.address}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
