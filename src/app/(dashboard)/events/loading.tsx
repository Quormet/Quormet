import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-5 w-56" />
                </div>
                <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${(i + 2) * 100}ms` }}>
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                            </div>
                        </div>
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-9 flex-1 rounded-lg" />
                            <Skeleton className="h-9 flex-1 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
