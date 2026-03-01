"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { queryWolfram } from "@/lib/python";
import { Card, CardContent } from "@/components/ui/card";

interface WolframAnalyticsProps {
    payments: any[];
    communityName: string;
}

export function WolframAnalytics({ payments, communityName }: WolframAnalyticsProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        try {
            // Prepare a Wolfram query based on the community data
            const amounts = payments.map(p => p.amount / 100);
            const query = `Analyze the finance data: {${amounts.join(", ")}} for ${communityName}`;

            const data = await queryWolfram(query);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to connect to Wolfram. Please ensure WOLFRAM_APP_ID is set.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {!result ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-900">Statistical Revenue Analysis</p>
                        <p className="text-xs text-slate-500">
                            Run payment trends through Wolfram's computational engine to find cycles and growth patterns.
                        </p>
                    </div>
                    <Button
                        onClick={handleAnalyze}
                        disabled={loading}
                        variant="outline"
                        className="border-purple-200 hover:bg-purple-100 text-purple-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Computing...
                            </>
                        ) : (
                            <>
                                <BrainCircuit className="mr-2 h-4 w-4" />
                                Run Wolfram Analytics
                            </>
                        )}
                    </Button>
                    {error && (
                        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                            <AlertCircle className="h-3 w-3" />
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.results.map((pod: any, idx: number) => (
                            <Card key={idx} className="border-purple-100 overflow-hidden">
                                <div className="bg-purple-50 px-3 py-1.5 text-[10px] font-bold text-purple-700 uppercase">
                                    {pod.title}
                                </div>
                                <CardContent className="p-4 flex flex-col items-center">
                                    {pod.img ? (
                                        <img src={pod.img.src} alt={pod.title} className="max-w-full h-auto" />
                                    ) : (
                                        <p className="text-sm text-slate-700">{pod.text}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResult(null)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                        Clear and Reset
                    </Button>
                </div>
            )}
        </div>
    );
}
