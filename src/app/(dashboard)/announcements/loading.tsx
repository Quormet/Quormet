import { Skeleton } from "@/components/ui/skeleton";

export default function AnnouncementsLoading() {
    return (
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-52" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ))}
            </div>
        </div>
    );
}
