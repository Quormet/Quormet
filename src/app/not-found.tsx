import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-3xl bg-blue-100 flex items-center justify-center mx-auto mb-8">
                    <span className="text-5xl">🏘️</span>
                </div>
                <h1 className="text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">404</h1>
                <h2 className="text-2xl font-bold text-slate-700 mb-3">Page not found</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or may have moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="h-12">
                        <Link href="/home">Go to Dashboard</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-12">
                        <Link href="/announcements">View Announcements</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
