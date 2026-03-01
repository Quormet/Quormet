/**
 * The landing page for Quormet, featuring sections for features, pricing, 
 * and calls to action for creating or joining a community.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Building, ShieldCheck, Mail, Megaphone, FileText, Vote, Coins } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="px-6 lg:px-14 h-16 flex items-center border-b bg-white sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Building className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl tracking-tight">Quormet</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block text-slate-600 hover:text-slate-900 transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block text-slate-600 hover:text-slate-900 transition-colors">
            Pricing
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {user ? (
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium hover:underline underline-offset-4 text-slate-700 hover:text-blue-600 transition-colors">
                Log in
              </Link>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-48 px-4 md:px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Your Community, <span className="text-blue-600">Simplified.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl/relaxed lg:text-2xl/relaxed mt-4">
                  The all-in-one platform for communities, HOAs, and member groups to communicate, govern, and operate without the chaos.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button size="lg" className="h-12 px-8" asChild>
                  <Link href="/sign-up">
                    Create your community <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8">
                  Join with code
                </Button>
              </div>
              <div className="pt-8 text-sm text-slate-500 font-medium tracking-wide">
                TRUSTED BY COMMUNITIES EVERYWHERE
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-16 md:py-24 bg-white border-y">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Ditch the email chains</h2>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-lg">
                Everything you need to run your community in one centralized, easy-to-use platform.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Megaphone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Announcements</h3>
                <p className="text-slate-500 text-sm">Keep everyone in the loop with a central bulletin board for important updates.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Vote className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Secure Voting</h3>
                <p className="text-slate-500 text-sm">Run fair, transparent polls and elections. One vote per resident guaranteed.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Coins className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Dues Collection</h3>
                <p className="text-slate-500 text-sm">Accept payments online via Stripe. Track who has paid at a glance.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Document Vault</h3>
                <p className="text-slate-500 text-sm">Store bylaws, minutes, and budgets securely. Readily accessible to members.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Simple, transparent pricing</h2>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-lg">
                Choose the plan that fits your community's needs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col p-6 bg-white border rounded-2xl shadow-sm">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    $0
                    <span className="ml-1 text-xl font-medium text-slate-500">/mo</span>
                  </div>
                  <p className="mt-4 text-slate-500">Perfect for small communities getting started.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center"><CheckCircle2 className="text-green-500 h-5 w-5 mr-3 flex-shrink-0" />Up to 50 residents</li>
                  <li className="flex items-center"><CheckCircle2 className="text-green-500 h-5 w-5 mr-3 flex-shrink-0" />Basic announcements</li>
                  <li className="flex items-center"><CheckCircle2 className="text-green-500 h-5 w-5 mr-3 flex-shrink-0" />Simple polling</li>
                  <li className="flex items-center"><CheckCircle2 className="text-green-500 h-5 w-5 mr-3 flex-shrink-0" />1 admin account</li>
                </ul>
                <Button className="w-full mt-auto" variant="outline">Get Started for Free</Button>
              </div>

              <div className="flex flex-col p-6 bg-blue-600 text-white rounded-2xl shadow-md relative">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    $29
                    <span className="ml-1 text-xl font-medium text-blue-200">/mo</span>
                  </div>
                  <p className="mt-4 text-blue-100">For active communities that need advanced tools.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1 text-blue-50">
                  <li className="flex items-center"><CheckCircle2 className="text-blue-300 h-5 w-5 mr-3 flex-shrink-0" />Unlimited residents</li>
                  <li className="flex items-center"><CheckCircle2 className="text-blue-300 h-5 w-5 mr-3 flex-shrink-0" />Dues collection via Stripe</li>
                  <li className="flex items-center"><CheckCircle2 className="text-blue-300 h-5 w-5 mr-3 flex-shrink-0" />Document vault storage</li>
                  <li className="flex items-center"><CheckCircle2 className="text-blue-300 h-5 w-5 mr-3 flex-shrink-0" />Member directory</li>
                  <li className="flex items-center"><CheckCircle2 className="text-blue-300 h-5 w-5 mr-3 flex-shrink-0" />Priority email support</li>
                </ul>
                <Button className="w-full mt-auto bg-white text-blue-600 hover:bg-slate-100">Upgrade to Pro</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-blue-500" />
              <span className="font-bold text-xl tracking-tight text-white">Quormet</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mt-2">
              Proudly supporting the United Nations Sustainable Development Goals (SDG 11: Sustainable Cities and Communities & SDG 16: Peace, Justice and Strong Institutions).
            </p>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Quormet Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm hover:underline hover:text-white">Terms of Service</Link>
            <Link href="#" className="text-sm hover:underline hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
