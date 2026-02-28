import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users, Mail, Phone, MapPin, EyeOff } from "lucide-react";
import { updateProfileSettings } from "./actions";

export default async function DirectoryPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
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
    const neighbors = directoryMembers.filter(m => m.id !== dbUser.id);

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Member Directory</h1>
                <p className="text-slate-500 mt-1">Connect with your neighbors and manage your profile.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
                {/* Profile Settings */}
                <Card className="md:col-span-1 border-blue-100 bg-blue-50/30">
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>Update your contact info and visibility.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={updateProfileSettings} className="space-y-4 text-sm">
                            <div className="space-y-1">
                                <label className="font-medium text-slate-700">Name</label>
                                <div className="p-2 bg-slate-100 rounded border text-slate-500 cursor-not-allowed">{me.name}</div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-medium text-slate-700">Email</label>
                                <div className="p-2 bg-slate-100 rounded border text-slate-500 cursor-not-allowed break-all">{me.email}</div>
                            </div>

                            <div className="space-y-1 pt-2">
                                <label htmlFor="phone" className="font-medium text-slate-700">Phone Number</label>
                                <Input id="phone" name="phone" placeholder="(555) 123-4567" defaultValue={me.phone || ""} />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="address" className="font-medium text-slate-700">Unit / Address</label>
                                <Input id="address" name="address" placeholder="Unit 4B or 123 Main St" defaultValue={me.address || ""} />
                            </div>

                            <div className="pt-2 border-t mt-4">
                                <label className="flex items-start gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-slate-50">
                                    <input
                                        type="checkbox"
                                        name="directoryOptIn"
                                        defaultChecked={me.directoryOptIn}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                    />
                                    <div>
                                        <p className="font-medium text-slate-900">Show me in directory</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Allow neighbors to see my name and contact info.</p>
                                    </div>
                                </label>
                            </div>

                            <Button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700">Save Profile</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Neighbors List */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-slate-400" />
                        <h2 className="text-xl font-semibold">Neighbors ({neighbors.length})</h2>
                        {dbUser.role === "admin" && (
                            <span className="ml-auto text-xs bg-slate-800 text-white px-2 py-1 rounded">Admin: Viewing All</span>
                        )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {neighbors.length === 0 ? (
                            <div className="sm:col-span-2 text-center py-12 px-4 bg-white border border-dashed rounded-lg">
                                <p className="text-slate-500">No other neighbors are listed in the directory yet.</p>
                                {dbUser.role === "admin" && (
                                    <p className="text-xs text-slate-400 mt-1">As an admin, you see everyone. Members haven't joined yet.</p>
                                )}
                            </div>
                        ) : (
                            neighbors.map(neighbor => (
                                <Card key={neighbor.id} className="overflow-hidden">
                                    <CardHeader className="p-4 pb-2 bg-slate-50/50 border-b">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{neighbor.name}</CardTitle>
                                            {!neighbor.directoryOptIn && dbUser.role === "admin" && (
                                                <span title="User is hidden from members"><EyeOff className="h-4 w-4 text-slate-400" /></span>
                                            )}
                                        </div>
                                        {neighbor.role === "admin" && (
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded mt-1">Admin</span>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                            <a href={`mailto:${neighbor.email}`} className="hover:text-blue-600 truncate">{neighbor.email}</a>
                                        </div>
                                        {neighbor.phone && (
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                                <a href={`tel:${neighbor.phone}`} className="hover:text-blue-600">{neighbor.phone}</a>
                                            </div>
                                        )}
                                        {neighbor.address && (
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span>{neighbor.address}</span>
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
