'use client';

import { useState, useEffect } from "react";
import { createCommunity, joinCommunity, searchCommunities, joinCommunityById } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Building, KeyRound, Search, Loader2, ArrowRight, Copy, CheckCircle2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";

export default function CommunitiesPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [path, setPath] = useState<'create' | 'join' | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Join path state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ id: number; name: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Create path state
    const [createdCode, setCreatedCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function performSearch() {
            if (debouncedSearch.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const results = await searchCommunities(debouncedSearch);
                setSearchResults(results);
            } catch (e) {
                console.error("Search failed", e);
            } finally {
                setIsSearching(false);
            }
        }
        if (path === 'join') {
            performSearch();
        }
    }, [debouncedSearch, path]);

    async function handleCreate(formData: FormData) {
        setIsLoading(true);
        try {
            const result = await createCommunity(formData);
            if (result?.joinCode) {
                setCreatedCode(result.joinCode);
                setStep(3); // Go to success step for creation
                router.refresh(); // Refresh dashboard context
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to create community");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleJoin(formData: FormData) {
        setIsLoading(true);
        try {
            await joinCommunity(formData);
            toast.success("Joined successfully!");
            router.refresh(); // Refresh dashboard context
            router.push('/home');
        } catch (e: any) {
            toast.error(e.message || "Failed to join community");
            setIsLoading(false);
        }
    }

    async function handleJoinById(id: number) {
        setIsLoading(true);
        try {
            await joinCommunityById(id);
            toast.success("Joined successfully!");
            router.refresh(); // Refresh dashboard context
            router.push('/home');
        } catch (e: any) {
            toast.error(e.message || "Failed to join community");
            setIsLoading(false);
        }
    }

    const copyToClipboard = () => {
        if (!createdCode) return;
        navigator.clipboard.writeText(createdCode);
        setCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col items-center py-10 px-4 transition-all duration-500 ease-in-out">
            <div className="max-w-2xl w-full text-center mb-8">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8 select-none">
                    <div className={`h-2.5 w-16 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    <div className={`h-2.5 w-16 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    {path === 'create' && (
                        <div className={`h-2.5 w-16 rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    )}
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 transition-all duration-300">
                    {step === 1 && "Join or Create Community"}
                    {step === 2 && path === 'create' && "Create your community"}
                    {step === 2 && path === 'join' && "Join your community"}
                    {step === 3 && "You're all set!"}
                </h1>
                <p className="text-lg text-slate-500 transition-all duration-300 h-8">
                    {step === 1 && "Create a new community or join an existing one with an invite code."}
                    {step === 2 && path === 'create' && "Give your community a name."}
                    {step === 2 && path === 'join' && "Enter your invite code or search by name."}
                </p>
            </div>

            <div className="max-w-2xl w-full relative">

                {/* Step 1: Choose Path */}
                {step === 1 && (
                    <div className="grid sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button
                            onClick={() => { setPath('create'); setStep(2); }}
                            className="text-left group flex flex-col items-start p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all h-full"
                        >
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                <Building className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Create a Community</h3>
                            <p className="text-slate-500 text-sm mb-6 flex-1">
                                Set up a new workspace for your community. You will be the admin.
                            </p>
                            <div className="flex items-center text-blue-600 font-medium text-sm mt-auto">
                                Continue <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>

                        <button
                            onClick={() => { setPath('join'); setStep(2); }}
                            className="text-left group flex flex-col items-start p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all h-full"
                        >
                            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                                <KeyRound className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Join a Community</h3>
                            <p className="text-slate-500 text-sm mb-6 flex-1">
                                Connect with your existing community using an invite code from your admin.
                            </p>
                            <div className="flex items-center text-emerald-600 font-medium text-sm mt-auto">
                                Continue <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </div>
                )}

                {/* Step 2: Forms */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <Button
                            variant="ghost"
                            className="mb-4 text-slate-500 hover:text-slate-900 -ml-4"
                            onClick={() => { setStep(1); setPath(null); }}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                            {path === 'create' ? (
                                <>
                                    <div className="h-2 w-full bg-blue-600" />
                                    <CardContent className="pt-8 pb-8 px-6 sm:px-10">
                                        <form action={handleCreate} className="space-y-6">
                                            <div className="space-y-3">
                                                <label htmlFor="name" className="text-sm font-medium text-slate-700">Community Name</label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    placeholder="E.g., Maplewood HOA"
                                                    required
                                                    disabled={isLoading}
                                                    className="h-12 text-lg"
                                                    minLength={3}
                                                    maxLength={50}
                                                />
                                                <p className="text-xs text-slate-500">Must be between 3 and 50 characters.</p>
                                            </div>
                                            <Button type="submit" size="lg" className="w-full text-base h-12" disabled={isLoading}>
                                                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                                Create Community
                                            </Button>
                                        </form>
                                    </CardContent>
                                </>
                            ) : (
                                <>
                                    <div className="h-2 w-full bg-emerald-600" />
                                    <CardContent className="pt-8 pb-8 px-6 sm:px-10">
                                        <div className="space-y-8">
                                            <form action={handleJoin} className="space-y-4">
                                                <div className="space-y-3">
                                                    <label htmlFor="code" className="text-sm font-medium text-slate-700">Enter your 6-character Join Code</label>
                                                    <Input
                                                        id="code"
                                                        name="code"
                                                        placeholder="E.g., A1B2C3"
                                                        required
                                                        disabled={isLoading}
                                                        className="uppercase h-14 text-center text-2xl tracking-widest font-mono"
                                                        maxLength={6}
                                                    />
                                                </div>
                                                <Button type="submit" size="lg" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-base" disabled={isLoading}>
                                                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                                    Join Community
                                                </Button>
                                            </form>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <span className="w-full border-t" />
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-white px-2 text-slate-400 font-medium">Or search by name</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        placeholder="E.g., Maplewood"
                                                        className="pl-12 h-12 text-base bg-slate-50 border-slate-200"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                </div>

                                                {isSearching ? (
                                                    <div className="flex items-center justify-center py-6">
                                                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                                    </div>
                                                ) : searchResults.length > 0 ? (
                                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                                        {searchResults.map((community) => (
                                                            <div key={community.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm transition-all">
                                                                <span className="font-semibold">{community.name}</span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-6"
                                                                    onClick={() => handleJoinById(community.id)}
                                                                    disabled={isLoading}
                                                                >
                                                                    Join
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : debouncedSearch.length >= 2 ? (
                                                    <p className="text-center text-sm text-slate-500 py-6 bg-slate-50 rounded-lg">No communities found matching &quot;{debouncedSearch}&quot;</p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </CardContent>
                                </>
                            )}
                        </Card>
                    </div>
                )}

                {/* Step 3: Success View (Admin Create Only) */}
                {step === 3 && createdCode && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <Card className="border-0 shadow-2xl overflow-hidden rounded-2xl text-center">
                            <div className="h-2 w-full bg-blue-600" />
                            <CardContent className="pt-10 pb-10 px-6 sm:px-12 flex flex-col items-center">
                                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                                    <span className="text-5xl">🎉</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Community created successfully!</h2>
                                <p className="text-slate-500 mb-8 max-w-md">
                                    You are now the admin. Share the code below with your members so they can join.
                                </p>

                                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl w-full max-w-sm mb-8 relative group">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Join Code</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-4xl font-mono tracking-widest font-bold text-slate-900">{createdCode}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4 w-full bg-white font-medium"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />}
                                        {copied ? "Copied!" : "Copy Code"}
                                    </Button>
                                </div>

                                <Button size="lg" className="w-full h-14 text-base shadow-lg shadow-blue-200" onClick={() => router.push('/home')}>
                                    Go to your community <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
