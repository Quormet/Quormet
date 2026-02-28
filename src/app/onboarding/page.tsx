"use client";

import { useState } from "react";
import { createCommunity, joinCommunity } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleCreate(formData: FormData) {
        setIsLoading(true);
        try {
            await createCommunity(formData);
        } catch (e: any) {
            toast.error(e.message || "Failed to create community");
            setIsLoading(false);
        }
    }

    async function handleJoin(formData: FormData) {
        setIsLoading(true);
        try {
            await joinCommunity(formData);
        } catch (e: any) {
            toast.error(e.message || "Failed to join community");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Welcome to Quormet!</h1>
                <p className="text-lg text-slate-500">To get started, simply choose an option below.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                <Card className="flex flex-col border-2 relative overflow-hidden transition-all hover:border-blue-200">
                    <div className="h-2 w-full bg-blue-600 absolute top-0 left-0" />
                    <CardHeader>
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                            <Building className="h-6 w-6" />
                        </div>
                        <CardTitle>Create a Community</CardTitle>
                        <CardDescription>You will be the administrator of this new workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <form action={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Community Name</label>
                                <Input id="name" name="name" placeholder="E.g., Sunnyvale HOA" required disabled={isLoading} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                Create Community
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="flex flex-col border-2 relative overflow-hidden transition-all hover:border-emerald-200">
                    <div className="h-2 w-full bg-emerald-600 absolute top-0 left-0" />
                    <CardHeader>
                        <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                            <KeyRound className="h-6 w-6" />
                        </div>
                        <CardTitle>Join a Community</CardTitle>
                        <CardDescription>Enter the 6-character invite code provided by your admin.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <form action={handleJoin} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="code" className="text-sm font-medium">Join Code</label>
                                <Input id="code" name="code" placeholder="E.g., A1B2C3" required disabled={isLoading} className="uppercase" maxLength={6} />
                            </div>
                            <Button type="submit" variant="secondary" className="w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200" disabled={isLoading}>
                                Join Community
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
