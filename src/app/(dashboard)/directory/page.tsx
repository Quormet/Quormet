import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users, Mail, Phone, MapPin, EyeOff } from "lucide-react";
import { ProfileForm } from "./profile-form";

export default async function DirectoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId) redirect("/onboarding");

    // Admins see everyone. Members see only opted-in users (plus themselves).
    const conditions = dbUser.role === "admin"
        ? eq(users.communityId, dbUser.communityId)
        : and(
            eq(users.communityId, dbUser.communityId),
            or(eq(users.directoryOptIn, true), eq(users.id, dbUser.id))
        );

    const directoryMembers = await db.select().from(users).where(conditions);

    // Split into self and others
    const me = directoryMembers.find(m => m.id === dbUser.id)!;
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

                {/* Neighbors List */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-slate-400" />
                        <h2 className="text-xl font-semibold">Members ({membersList.length})</h2>
                        {dbUser.role === "admin" && (
                            <span className="ml-auto text-xs bg-slate-800 text-white px-2 py-1 rounded">Admin: Viewing All</span>
                        )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {membersList.length === 0 ? (
                            <div className="sm:col-span-2 text-center py-12 px-4 bg-white border border-dashed rounded-lg">
                                <p className="text-slate-500">No other members are listed in the directory yet.</p>
                                {dbUser.role === "admin" && (
                                    <p className="text-xs text-slate-400 mt-1">As an admin, you see everyone. Members haven't joined yet.</p>
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
