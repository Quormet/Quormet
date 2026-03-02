/**
 * The landing page for Quorify, featuring sections for features, pricing, 
 * and calls to action for creating or joining a community.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Building, ShieldCheck, Mail, Megaphone, FileText, Vote, Coins, Calendar, Users, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Frosted Glass Header */}
      <header className="px-6 lg:px-14 h-16 flex items-center border-b border-white/20 glass sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
            Q
          </div>
          <span className="font-bold text-xl tracking-tight">Quorify</span>
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
            <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium hover:underline underline-offset-4 text-slate-700 hover:text-blue-600 transition-colors">
                Log in
              </Link>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero — Animated Gradient with Floating Orbs */}
        <section className="w-full py-20 md:py-32 lg:py-48 px-4 md:px-6 relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 animate-gradient" />
          {/* Decorative floating orbs */}
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-[15%] w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-300/10 rounded-full blur-3xl animate-pulse-soft" />

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="space-y-4 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-blue-100 text-sm font-medium text-blue-700 shadow-sm backdrop-blur-sm mb-4">
                  <Sparkles className="h-4 w-4" />
                  Trusted by communities everywhere
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Your Community, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Simplified.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl/relaxed lg:text-2xl/relaxed mt-4">
                  The all-in-one platform for communities, HOAs, and member groups to communicate, govern, and operate without the chaos.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-fade-in-up-d2">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all" asChild>
                  <Link href="/sign-up">
                    Create your community <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 bg-white/70 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Join with code
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features — Cards with Hover Lift + Top Border Accents */}
        <section id="features" className="w-full py-16 md:py-24 bg-white border-y relative">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center space-y-4 mb-16 animate-fade-in-up">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Ditch the email chains</h2>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-lg">
                Everything you need to run your community in one centralized, easy-to-use platform.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Megaphone, color: "blue", title: "Announcements", desc: "Keep everyone in the loop with a central bulletin board for important updates." },
                { icon: Vote, color: "emerald", title: "Secure Voting", desc: "Run fair, transparent polls and elections. One vote per resident guaranteed." },
                { icon: Coins, color: "amber", title: "Dues Collection", desc: "Accept payments online via Stripe. Track who has paid at a glance." },
                { icon: FileText, color: "purple", title: "Document Vault", desc: "Store bylaws, minutes, and budgets securely. Readily accessible to members." },
                { icon: Calendar, color: "indigo", title: "Event Management", desc: "Plan community events with RSVP tracking, reminders, and calendars." },
                { icon: Users, color: "rose", title: "Member Directory", desc: "A private, searchable directory so neighbors can connect easily." },
                { icon: Mail, color: "teal", title: "Direct Messages", desc: "Secure messaging between members and board — no personal emails shared." },
                { icon: Sparkles, color: "violet", title: "AI Assistant", desc: "Get intelligent suggestions, auto-generated summaries, and smart reminders." },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className={`group relative flex flex-col items-center text-center space-y-3 p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Top gradient accent */}
                  <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${feature.color === 'blue' ? 'from-blue-400 to-blue-600' :
                      feature.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
                        feature.color === 'amber' ? 'from-amber-400 to-amber-600' :
                          feature.color === 'purple' ? 'from-purple-400 to-purple-600' :
                            feature.color === 'indigo' ? 'from-indigo-400 to-indigo-600' :
                              feature.color === 'rose' ? 'from-rose-400 to-rose-600' :
                                feature.color === 'teal' ? 'from-teal-400 to-teal-600' :
                                  'from-violet-400 to-violet-600'
                    } opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      feature.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                        feature.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                          feature.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                            feature.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                              feature.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                                feature.color === 'teal' ? 'bg-teal-100 text-teal-600' :
                                  'bg-violet-100 text-violet-600'
                    }`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="w-full py-16 md:py-24 relative overflow-hidden">
          {/* Subtle background orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Simple, transparent pricing</h2>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-lg">
                Choose the plan that fits your community's needs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col p-6 bg-white border rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
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

              <div className="flex flex-col p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 relative hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
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
                <Button className="w-full mt-auto bg-white text-blue-600 hover:bg-slate-100 shadow-lg">Upgrade to Pro</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with gradient top border */}
      <footer className="w-full py-8 bg-slate-900 text-slate-300 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">Q</div>
              <span className="font-bold text-xl tracking-tight text-white">Quorify</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mt-2">
              Proudly supporting the United Nations Sustainable Development Goals (SDG 11: Sustainable Cities and Communities & SDG 16: Peace, Justice and Strong Institutions).
            </p>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Quorify Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm hover:underline hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm hover:underline hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
