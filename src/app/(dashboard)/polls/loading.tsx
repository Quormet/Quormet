import { Skeleton } from "@/components/ui/skeleton";

export default function PollsLoading() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-44" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border shadow-sm space-y-4">
                        <Skeleton className="h-5 w-4/5" />
                        <div className="space-y-2">
                            {[...Array(3)].map((_, j) => (
                                <Skeleton key={j} className="h-10 w-full rounded-lg" />
                            ))}
                        </div>
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    );
}
