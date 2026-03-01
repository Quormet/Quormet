import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full animate-pulse">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-48" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border shadow-sm space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                ))}
            </div>

            {/* Two-column main area */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-6 w-40" />
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border shadow-sm space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="bg-white rounded-2xl p-5 border shadow-sm space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </div>
        </div>
    );
}
