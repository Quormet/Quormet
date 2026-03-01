import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { users, communities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Copy, CheckCircle2 } from "lucide-react";
import { updateCommunitySettings } from "./actions";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id)).limit(1);
    if (!dbUser || !dbUser.communityId || dbUser.role !== "admin") {
        notFound();
    }

    const [community] = await db.select().from(communities).where(eq(communities.id, dbUser.communityId)).limit(1);

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Community Settings</h1>
                <p className="text-slate-500 mt-1">Manage your community details and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Update the name of your community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={updateCommunitySettings} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Community Name</label>
                            <Input id="name" name="name" defaultValue={community.name} required />
                        </div>
                        <Button type="submit">Save Changes</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invite Members</CardTitle>
                    <CardDescription>Share this join code with your members so they can sign up.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 max-w-sm">
                        <div className="flex-1 bg-slate-100 border p-3 rounded-lg text-center font-mono text-xl tracking-widest text-blue-700 font-bold">
                            {community.joinCode}
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-4">
                        Users will be asked for this code during the onboarding process. Keep it secure and only share it with actual residents.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
