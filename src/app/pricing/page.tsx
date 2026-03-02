import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Info, ArrowLeft } from "lucide-react";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50 selection:bg-blue-100 pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl leading-none">
                        Q
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">Quorify</span>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/auth/login">Log in</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/sign-up">Get Started</Link>
                    </Button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="text-center py-20 px-6 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
                    Pricing that scales with your community.
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Start for free and upgrade as your community grows.
                    <br />
                    <span className="font-medium text-blue-600 block mt-2 px-4 py-2 bg-blue-50 rounded-lg inline-block text-sm">Note: All premium tiers are illustrative for future implementation. Quorify is currently in free beta.</span>
                </p>

                <div className="mt-10 flex items-center justify-center gap-3">
                    <span className="font-semibold text-slate-900">Monthly</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform" />
                    </button>
                    <span className="font-semibold text-slate-500">Annually <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider ml-1 bg-emerald-50 px-2 py-0.5 rounded-full">Save 20%</span></span>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Free */}
                <div className="bg-white rounded-3xl p-8 border shadow-sm flex flex-col relative overflow-hidden">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">Free</h3>
                        <p className="text-sm text-slate-500 mt-2 min-h-[40px]">Perfect for small groups just getting started.</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">$0</span>
                        <span className="text-slate-500">/mo</span>
                    </div>
                    <Button className="w-full mb-8 bg-slate-900 text-white hover:bg-slate-800" asChild>
                        <Link href="/sign-up">Start for free (Beta)</Link>
                    </Button>
                    <div className="space-y-4 flex-1">
                        <p className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Includes:</p>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-slate-900 shrink-0" /> Up to 20 members</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-slate-900 shrink-0" /> Standard Polling</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-slate-900 shrink-0" /> Event RSVP Management</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-slate-900 shrink-0" /> Issue Tracking & Directory</li>
                        </ul>
                    </div>
                </div>

                {/* Community (Popular) */}
                <div className="bg-slate-900 rounded-3xl p-8 shadow-xl flex flex-col relative overflow-hidden transform md:-translate-y-4">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-white">Community</h3>
                        <p className="text-sm text-slate-300 mt-2 min-h-[40px]">For active communities needing more tools.</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-white">$20</span>
                        <span className="text-slate-400">/mo</span>
                    </div>
                    <Button disabled className="w-full mb-8 bg-slate-800 text-slate-400 hover:bg-slate-800 border-0 cursor-not-allowed">
                        Coming Soon
                    </Button>
                    <div className="space-y-4 flex-1">
                        <p className="text-sm font-semibold text-white uppercase tracking-wider">Everything in Free, plus:</p>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-blue-400 shrink-0" /> Up to 100 members</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-blue-400 shrink-0" /> AI Assistant (100 msgs/mo)</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-blue-400 shrink-0" /> Community Board & Dues</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-blue-400 shrink-0" /> Document Vault AI Search</li>
                        </ul>
                    </div>
                </div>

                {/* Pro */}
                <div className="bg-white rounded-3xl p-8 border shadow-sm flex flex-col relative overflow-hidden">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">Pro</h3>
                        <p className="text-sm text-slate-500 mt-2 min-h-[40px]">Advanced intelligence for HOA boards and large networks.</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">$50</span>
                        <span className="text-slate-500">/mo</span>
                    </div>
                    <Button disabled variant="outline" className="w-full mb-8 border-slate-200 text-slate-400 cursor-not-allowed">
                        Coming Soon
                    </Button>
                    <div className="space-y-4 flex-1">
                        <p className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Everything in Community, plus:</p>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Up to 500 members</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Unlimited AI Messages</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Intelligence Feed & Health Score</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 shrink-0" /> Workflow Automations & Nudges</li>
                        </ul>
                    </div>
                </div>

                {/* Scale */}
                <div className="bg-white rounded-3xl p-8 border shadow-sm flex flex-col relative mx-auto w-full">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">Scale</h3>
                        <p className="text-sm text-slate-500 mt-2 min-h-[40px]">For master-planned communities and platforms.</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">$100</span>
                        <span className="text-slate-500">/mo</span>
                    </div>
                    <Button disabled variant="outline" className="w-full mb-8 border-slate-200 text-slate-400 cursor-not-allowed">
                        Contact Sales (Future)
                    </Button>
                    <div className="space-y-4 flex-1">
                        <p className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Everything in Pro, plus:</p>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-indigo-500 shrink-0" /> Unlimited members</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-indigo-500 shrink-0" /> White-labeling (Custom Domain)</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-indigo-500 shrink-0" /> Full API Access</li>
                            <li className="flex items-start gap-3"><Check className="h-5 w-5 text-indigo-500 shrink-0" /> Dedicated Account Manager</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Individual Plan Section */}
            <div className="max-w-4xl mx-auto px-6 mt-32">
                <div className="bg-indigo-50 rounded-[2rem] p-8 md:p-12 border border-indigo-100 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-widest rounded-full mb-4">For Individuals</div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Member Pro</h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-6">
                            Community stuck on the Free plan? Upgrade individually to unlock AI features, post paid gigs, and get a personal to-do strip.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                            <Button disabled className="bg-indigo-200 text-indigo-500 px-8 py-6 text-lg rounded-xl shadow-none w-full sm:w-auto cursor-not-allowed">
                                Coming Soon ($5/mo)
                            </Button>
                            <span className="text-sm text-slate-500 font-medium whitespace-nowrap">or $50/year (save 17%)</span>
                        </div>
                    </div>
                    <div className="w-full md:w-72 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 shrink-0 space-y-4 relative">
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-md transform rotate-12">
                            <Check className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-center uppercase tracking-wider text-sm border-b pb-4">Unlock Instantly</h4>
                        <ul className="space-y-3 text-sm text-slate-600 font-medium">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-500" /> AI Assistant (50 msgs/mo)</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-500" /> Personal To-Do Strip</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-500" /> View/Post Paid Gigs</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-500" /> Search Skill Tags</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="max-w-5xl mx-auto px-6 mt-32">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Compare Features</h2>
                    <p className="text-slate-500 text-lg">Detailed breakdown of what's included in each plan.</p>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-semibold text-slate-900 w-1/3">Core Features</th>
                                <th className="p-4 font-semibold text-slate-900 text-center w-1/6 border-l">Free</th>
                                <th className="p-4 font-semibold text-blue-700 text-center w-1/6 border-l bg-blue-50/50">Community</th>
                                <th className="p-4 font-semibold text-slate-900 text-center w-1/6 border-l">Pro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="p-4 text-slate-600 font-medium">Member Limit</td>
                                <td className="p-4 text-center text-slate-900 font-medium border-l bg-slate-50/30">20</td>
                                <td className="p-4 text-center text-slate-900 font-bold border-l bg-blue-50/30">100</td>
                                <td className="p-4 text-center text-slate-900 font-bold border-l">500</td>
                            </tr>
                            <tr>
                                <td className="p-4 text-slate-600 font-medium">Basic Polls & Events</td>
                                <td className="p-4 text-center border-l bg-slate-50/30"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                                <td className="p-4 text-center border-l bg-blue-50/30"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                                <td className="p-4 text-center border-l"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                            </tr>
                            <tr>
                                <td className="p-4 text-slate-600 font-medium flex items-center gap-2">Documents Vault <Info className="w-3 h-3 text-slate-400" /></td>
                                <td className="p-4 text-center border-l bg-slate-50/30"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                                <td className="p-4 text-center border-l bg-blue-50/30"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                                <td className="p-4 text-center border-l"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                            </tr>
                            <tr>
                                <td className="p-4 text-slate-600 font-medium">Payment Tracking & Dues</td>
                                <td className="p-4 text-center border-l bg-slate-50/30 text-slate-300">-</td>
                                <td className="p-4 text-center border-l bg-blue-50/30"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                                <td className="p-4 text-center border-l"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                            </tr>

                            <tr className="bg-slate-50 border-b border-t-2 border-slate-200">
                                <th className="p-4 font-semibold text-slate-900 w-1/3">Artificial Intelligence</th>
                                <th className="p-4 font-semibold text-slate-900 text-center w-1/6 border-l">Free</th>
                                <th className="p-4 font-semibold text-blue-700 text-center w-1/6 border-l bg-blue-50/50">Community</th>
                                <th className="p-4 font-semibold text-slate-900 text-center w-1/6 border-l">Pro</th>
                            </tr>
                            <tr>
                                <td className="p-4 text-slate-600 font-medium">AI Messages / Month</td>
                                <td className="p-4 text-center text-slate-400 border-l bg-slate-50/30">0</td>
                                <td className="p-4 text-center text-slate-900 font-bold border-l bg-blue-50/30">100</td>
                                <td className="p-4 text-center text-slate-900 font-bold border-l">Unlimited</td>
                            </tr>
                            <tr>
                                <td className="p-4 text-slate-600 font-medium">Ask questions & Search Docs</td>
                                <td className="p-4 text-center border-l bg-slate-50/30 text-slate-300">-</td>
                                <td className="p-4 text-center border-l bg-blue-50/30"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                                <td className="p-4 text-center border-l"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                            </tr>
                            <tr>
                                <td className="p-4 text-slate-600 font-medium">AI Action Creation (Polls, Events)</td>
                                <td className="p-4 text-center border-l bg-slate-50/30 text-slate-300">-</td>
                                <td className="p-4 text-center border-l bg-blue-50/30"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                                <td className="p-4 text-center border-l"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                            </tr>

                            <tr className="bg-slate-50 border-b border-t-2 border-slate-200">
                                <th className="p-4 font-semibold text-slate-900 w-1/3">Intelligence & Automation</th>
                                <th className="p-4 font-semibold text-slate-900 text-center w-1/6 border-l">Free</th>
                                <th className="p-4 font-semibold text-blue-700 text-center w-1/6 border-l bg-blue-50/50">Community</th>
                                <th className="p-4 font-semibold text-slate-900 text-center w-1/6 border-l">Pro</th>
                            </tr>
                            <tr>
                                <td className="p-4 text-slate-600 font-medium">Personal To-Do Strip</td>
                                <td className="p-4 text-center border-l bg-slate-50/30 text-slate-300">-</td>
                                <td className="p-4 text-center border-l bg-blue-50/30"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                                <td className="p-4 text-center border-l"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                            </tr>
                            <tr>
                                <td className="p-4 text-slate-600 font-medium">Community Health Score</td>
                                <td className="p-4 text-center border-l bg-slate-50/30 text-slate-300">-</td>
                                <td className="p-4 text-center border-l bg-blue-50/30 text-slate-300">-</td>
                                <td className="p-4 text-center border-l"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                            </tr>
                            <tr>
                                <td className="p-4 text-slate-600 font-medium">Workflow Automations & Nudges</td>
                                <td className="p-4 text-center border-l bg-slate-50/30 text-slate-300">-</td>
                                <td className="p-4 text-center border-l bg-blue-50/30 text-slate-300">-</td>
                                <td className="p-4 text-center border-l"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-center mt-20 text-slate-500">
                <p>© 2026 Quorify. All rights reserved.</p>
            </div>
        </div>
    );
}
