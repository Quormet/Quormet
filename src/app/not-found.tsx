import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 animate-gradient" />
            {/* Decorative floating orbs */}
            <div className="absolute top-20 left-[15%] w-64 h-64 bg-blue-400/15 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-float-delayed" />

            <div className="text-center max-w-md relative z-10 animate-fade-in-up">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/10 animate-float">
                    <span className="text-6xl">🏘️</span>
                </div>
                <h1 className="text-7xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">404</h1>
                <h2 className="text-2xl font-bold text-slate-700 mb-3">Page not found</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    The page you&apos;re looking for doesn&apos;t exist or may have moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-12 bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all">
                        <Link href="/announcements">View Announcements</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
