# Quormet — Pricing & Feature Gating Spec

> This document defines every pricing tier, what each tier includes,
> how features are gated, and how the pricing page should be built.

---

## The Plans

### Community Plans (Board pays, whole community benefits)

| Plan | Price | Member limit | Best for |
|------|-------|-------------|----------|
| **Free** | $0/mo | Up to 20 members | Small groups just getting started |
| **Community** | $29/mo | Up to 50 members | Active HOAs, clubs, small organizations |
| **Pro** | $49/mo | Up to 150 members | Growing communities that need automation |
| **Scale** | $49/mo + $8 per additional 50 members | Unlimited | Large associations, multi-building communities |

### Individual Plan (Member pays, for themselves)

| Plan | Price | Best for |
|------|-------|----------|
| **Member Pro** | $3/mo | Members whose board hasn't upgraded but want pro features personally |

**Key rule:** Member Pro never grants admin permissions. It upgrades the individual's experience — AI access, personal intelligence, advanced directory — but creating polls, managing issues, and posting announcements remain admin-only regardless of individual plan.

---

## Feature Gating — Full Matrix

Every feature in Quormet falls into one of four access levels:

- **Free** — available to all communities and members at no cost
- **Community+** — requires Community plan ($29/mo) or higher
- **Pro+** — requires Pro plan ($49/mo) or higher
- **Member Pro** — available to individual members on the $3/mo plan, regardless of community plan

### Announcements

| Feature | Free | Community | Pro | Member Pro |
|---------|------|-----------|-----|------------|
| View announcements | ✅ | ✅ | ✅ | ✅ |
| Post announcements (admin) | ✅ | ✅ | ✅ | — |
| Draft announcements | ✅ | ✅ | ✅ | — |
| AI-generated announcement drafts | ❌ | ✅ | ✅ | ✅ |
| Auto-announcement when poll closes | ❌ | ❌ | ✅ | — |
| Announcement read receipts (admin) | ❌ | ✅ | ✅ | — |

### Polls & Voting

| Feature | Free | Community | Pro | Member Pro |
|---------|------|-----------|-----|------------|
| View polls | ✅ | ✅ | ✅ | ✅ |
| Vote on polls | ✅ | ✅ | ✅ | ✅ |
| Create polls (admin) | ✅ | ✅ | ✅ | — |
| View results | ✅ | ✅ | ✅ | ✅ |
| Quorum progress bar | ❌ | ✅ | ✅ | ✅ |
| Auto-close polls at deadline | ❌ | ✅ | ✅ | — |
| AI-created polls via assistant | ❌ | ✅ | ✅ | ✅ |
| Auto-reminder to non-voters | ❌ | ❌ | ✅ | — |
| Poll participation analytics | ❌ | ❌ | ✅ | — |

### Events & RSVPs

| Feature | Free | Community | Pro | Member Pro |
|---------|------|-----------|-----|------------|
| View events | ✅ | ✅ | ✅ | ✅ |
| RSVP to events | ✅ | ✅ | ✅ | ✅ |
| Create events (admin) | ✅ | ✅ | ✅ | — |
| AI-created events via assistant | ❌ | ✅ | ✅ | ✅ |
| RSVP reminders (auto) | ❌ | ❌ | ✅ | — |
| Event attendance analytics | ❌ | ❌ | ✅ | — |

### Issues / Progress Tracker

| Feature | Free | Community | Pro | Member Pro |
|---------|------|-----------|-----|------------|
| Submit issues | ✅ | ✅ | ✅ | ✅ |
| View own issue status | ✅ | ✅ | ✅ | ✅ |
| Admin issue management | ✅ | ✅ | ✅ | — |
| 5-stage progress tracker | ✅ | ✅ | ✅ | ✅ |
| Vendor assignment | ❌ | ✅ | ✅ | — |
| Vendor directory & ratings | ❌ | ✅ | ✅ | — |
| Auto-escalation of stale issues | ❌ | ❌ | ✅ | — |
| Issue analytics (admin) | ❌ | ❌ | ✅ | — |

### Document Vault

| Feature | Free | Community | Pro | Member Pro |
|---------|------|-----------|-----|------------|
| View documents | ✅ | ✅ | ✅ | ✅ |
| Add documents (admin) | ❌ | ✅ | ✅ | — |
| Delete documents (admin) | ❌ | ✅ | ✅ | — |
| AI document search (Bylaw Bot) | ❌ | ✅ | ✅ | ✅ |
| Document citation in AI answers | ❌ | ✅ | ✅ | ✅ |

### Payments & Dues

| Feature | Free | Community | Pro | Member Pro |
|---------|------|-----------|-----|------------|
| View dues status | ✅ | ✅ | ✅ | ✅ |
| Pay dues via Stripe | ✅ | ✅ | ✅ | ✅ |
| Admin: set dues amount | ❌ | ✅ | ✅ | — |
| Admin: view payment table | ❌ | ✅ | ✅ | — |
| Admin: mark as paid manually | ❌ | ✅ | ✅ | — |
| Auto-reminder 3 days before due | ❌ | ❌ | ✅ | — |
| Auto-reminder 1 day after due | ❌ | ❌ | ✅ | — |
| Payment analytics + bar chart | ❌ | ❌ | ✅ | — |

### Member Directory

| Feature | Free | Community | Pro | Member Pro |
|---------|------|-----------|-----|------------|
| View opted-in members | ✅ | ✅ | ✅ | ✅ |
| Edit own listing | ✅ | ✅ | ✅ | ✅ |
| Add skill tags | ✅ | ✅ | ✅ | ✅ |
| Search by skill tag | ❌ | ✅ | ✅ | ✅ |
| Admin: view all members | ✅ | ✅ | ✅ | — |

### Community Board

| Feature | Free | Community | Pro | Member Pro |
|---------|------|-----------|-----|------------|
| View posts | ✅ | ✅ | ✅ | ✅ |
| Post requests and offers | ✅ | ✅ | ✅ | ✅ |
| Post paid gigs | ❌ | ✅ | ✅ | ✅ |
| Skill matching suggestions | ❌ | ❌ | ✅ | ✅ |

### AI Assistant

| Feature | Free | Community | Pro | Member Pro |
|---------|------|-----------|-----|------------|
| Access AI assistant | ❌ | ✅ | ✅ | ✅ |
| Ask questions about community | ❌ | ✅ | ✅ | ✅ |
| Search community documents | ❌ | ✅ | ✅ | ✅ |
| Create announcements via AI | ❌ | ✅ | ✅ | ✅ (view only — no admin actions) |
| Create polls via AI (admin) | ❌ | ✅ | ✅ | — |
| Create events via AI (admin) | ❌ | ✅ | ✅ | — |
| Summarize meeting notes | ❌ | ✅ | ✅ | ✅ |
| Messages per month | 0 | 100 | Unlimited | 50 |

### Intelligence & Automation (Pro only)

| Feature | Free | Community | Pro | Member Pro |
|---------|------|-----------|-----|------------|
| Community health score | ❌ | ❌ | ✅ | — |
| Intelligence feed / nudges | ❌ | ❌ | ✅ | — |
| Personal to-do strip | ❌ | ✅ | ✅ | ✅ |
| Auto-reminders (dues, votes, RSVPs) | ❌ | ❌ | ✅ | — |
| Workflow automation | ❌ | ❌ | ✅ | — |
| Draft announcements on poll close | ❌ | ❌ | ✅ | — |
| Stale issue escalation | ❌ | ❌ | ✅ | — |

---

## Member Pro — Exactly What It Unlocks

Member Pro ($3/mo) is for the individual member whose board hasn't upgraded.
It gives them a meaningfully better personal experience without crossing into admin territory.

**What Member Pro unlocks:**
- AI assistant access (50 messages/month)
- AI document search and bylaw citations
- Personal to-do strip on home
- Quorum progress bar on polls
- Skill tag search in directory
- Post paid gigs on community board
- Skill matching suggestions
- Summarize meeting notes

**What Member Pro never unlocks:**
- Creating polls, announcements, or events
- Managing issues or assigning vendors
- Viewing payment table or admin controls
- Community health score or intelligence feed
- Auto-reminders or workflow automation
- Any admin-only feature — ever

**The upgrade trigger:**
The single most effective moment to convert a member to Member Pro is when they try to use the AI assistant on a free community. Show the paywall inline in the chat panel:

```
┌─────────────────────────────────────────┐
│  🔒 AI Assistant is a Pro feature       │
│                                         │
│  Upgrade to Member Pro for $3/month     │
│  to unlock the AI assistant and more.   │
│                                         │
│  Your board hasn't upgraded yet —       │
│  you can unlock it for yourself.        │
│                                         │
│  [Upgrade for $3/mo]  [Maybe later]     │
└─────────────────────────────────────────┘
```

---

## Scale Pricing — How It Works

Scale plan starts at $49/mo for up to 150 members.
Every additional 50 members adds $8/mo.

| Members | Monthly price |
|---------|--------------|
| 1–150 | $49 |
| 151–200 | $57 |
| 201–250 | $65 |
| 251–300 | $73 |
| 301–500 | $105 |
| 501–1,000 | $153 |

Member count is checked monthly. If a community drops below a threshold,
the price adjusts on the next billing cycle automatically.

---

## Upgrade Prompts — When and Where to Show Them

Never block a user mid-task without warning. Show upgrade prompts at the
right moment — not randomly.

| User tries to | On plan | Show |
|--------------|---------|------|
| Use AI assistant | Free community, no Member Pro | Member Pro paywall inline in chat |
| Create a poll | Free community | "Polls are available on all plans — you're good" (polls are free) |
| Add a document | Free community | "Document Vault requires Community plan — upgrade or ask your board" |
| See quorum bar | Free, no Member Pro | Soft lock — show bar blurred with "Upgrade to see live quorum" |
| Auto-reminders | Community plan | "Auto-reminders are a Pro feature — upgrade your community plan" |
| Community health | Community plan | "Community Health is a Pro feature" with upgrade CTA |
| Post a paid gig | Free, no Member Pro | "Paid gigs require Member Pro ($3/mo) or a Community plan" |

**Rules for upgrade prompts:**
- Never interrupt a completed action to upsell
- Always explain what plan unlocks the feature
- Always give two paths: upgrade the community plan OR upgrade personally
- Never show a paywall without a "Maybe later" or dismiss option
- Admin-facing upsells should reference the community plan
- Member-facing upsells should reference Member Pro first, community plan second

---

## Database Schema Changes

Add to `src/db/schema.ts`:

```ts
// Add to communities table
plan: text('plan').notNull().default('free'),
// 'free' | 'community' | 'pro' | 'scale'
planMemberLimit: integer('plan_member_limit').default(20),
stripeCustomerId: text('stripe_customer_id'),
stripeSubscriptionId: text('stripe_subscription_id'),
planExpiresAt: timestamp('plan_expires_at'),

// Add to users table
individualPlan: text('individual_plan').default('free'),
// 'free' | 'member_pro'
individualPlanExpiresAt: timestamp('individual_plan_expires_at'),
individualStripeSubscriptionId: text('individual_stripe_subscription_id'),
```

---

## Plan Check Helper

Write this once. Use it everywhere to check feature access.

`src/utils/planAccess.ts`

```ts
import { getCurrentUser } from '@/utils/getCurrentUser'
import { db } from '@/db'
import { communities } from '@/db/schema'
import { eq } from 'drizzle-orm'

type Plan = 'free' | 'community' | 'pro' | 'scale'
type IndividualPlan = 'free' | 'member_pro'

const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  community: 1,
  pro: 2,
  scale: 3,
}

export async function getPlanAccess() {
  const user = await getCurrentUser()
  if (!user) return null

  const [community] = await db.select().from(communities)
    .where(eq(communities.id, user.communityId!))

  const communityPlan = community?.plan as Plan ?? 'free'
  const individualPlan = user.individualPlan as IndividualPlan ?? 'free'
  const hasMemberPro = individualPlan === 'member_pro'
  const isAdmin = user.role === 'admin'

  function communityAtLeast(plan: Plan): boolean {
    return PLAN_RANK[communityPlan] >= PLAN_RANK[plan]
  }

  return {
    // Community plan checks
    isFree: communityPlan === 'free',
    isCommunity: communityAtLeast('community'),
    isPro: communityAtLeast('pro'),
    isScale: communityAtLeast('scale'),

    // Individual plan
    hasMemberPro,

    // Feature access — combine community + individual plans
    canUseAI: communityAtLeast('community') || hasMemberPro,
    canSearchDocuments: communityAtLeast('community') || hasMemberPro,
    canSeeQuorumBar: communityAtLeast('community') || hasMemberPro,
    canSeePersonalTodos: communityAtLeast('community') || hasMemberPro,
    canPostPaidGigs: communityAtLeast('community') || hasMemberPro,
    canSeeSkillMatching: communityAtLeast('pro') || hasMemberPro,
    canSeeHealthScore: communityAtLeast('pro') && isAdmin,
    canSeeIntelligenceFeed: communityAtLeast('pro') && isAdmin,
    canUseAutomation: communityAtLeast('pro') && isAdmin,
    canManageDues: communityAtLeast('community') && isAdmin,
    canManageDocuments: communityAtLeast('community') && isAdmin,
    canAssignVendors: communityAtLeast('community') && isAdmin,

    // Raw values for UI
    communityPlan,
    individualPlan,
    isAdmin,
  }
}
```

Use it in any server component or server action:

```ts
const access = await getPlanAccess()
if (!access?.canUseAI) {
  return { error: 'upgrade_required', feature: 'ai_assistant' }
}
```

---

## Pricing Page — `/pricing`

Public page. No auth required.

### Structure

```
[Hero]
  Headline: "Simple pricing for every community"
  Subheadline: "Start free. Upgrade when you're ready."

[Plan cards — 4 community plans side by side]
  Free | Community | Pro | Scale

[Individual plan — separate section below]
  "Already a member? Upgrade yourself for $3/month."

[Feature comparison table — full matrix]
  Collapsible by category

[FAQ]
  Common questions

[CTA]
  "Start free — no credit card required"
```

### Plan card structure

Each card shows:
- Plan name
- Price (monthly)
- Member limit
- 4-5 key features as bullet points
- CTA button

**Free card CTA:** "Get started free"
**Community card CTA:** "Start 14-day free trial"
**Pro card CTA:** "Start 14-day free trial"
**Scale card CTA:** "Contact us"

Mark the **Pro** plan as "Most popular."

### FAQ content

**Can I switch plans at any time?**
Yes. Upgrade or downgrade anytime. Changes take effect on your next billing cycle.

**What happens when I hit my member limit?**
You'll see a prompt to upgrade. Existing members are never removed — new members just can't join until you upgrade.

**What's the difference between a community plan and Member Pro?**
Community plans are paid by the board and unlock pro features for everyone in the community. Member Pro is paid by an individual member and unlocks pro features for themselves — even if the board hasn't upgraded.

**Do you offer discounts for nonprofits or tenant unions?**
Yes. Contact us for 50% off any community plan for registered nonprofits, tenant unions, and community advocacy organizations.

**Is there a free trial?**
Community and Pro plans include a 14-day free trial. No credit card required to start.

**What payment methods do you accept?**
All major credit cards via Stripe. Community plans can also be invoiced annually for a 15% discount.

---

## Annual Pricing (15% discount)

Offer annual billing on all paid plans. Show monthly equivalent.

| Plan | Monthly | Annual (save 15%) |
|------|---------|-------------------|
| Community | $29/mo | $296/yr ($24.67/mo) |
| Pro | $49/mo | $500/yr ($41.67/mo) |
| Member Pro | $3/mo | $30/yr ($2.50/mo) |

Add a toggle on the pricing page: **Monthly / Yearly** — switching updates all prices simultaneously.

---

## Stripe Integration Notes

### Community plan checkout
```ts
// src/app/api/checkout/community/route.ts
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: PRICE_IDS[plan], // map plan names to Stripe price IDs
    quantity: 1,
  }],
  success_url: `${APP_URL}/settings?upgrade=success`,
  cancel_url: `${APP_URL}/pricing`,
  metadata: { communityId, plan },
})
```

### Member Pro checkout
```ts
// src/app/api/checkout/member-pro/route.ts
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: MEMBER_PRO_PRICE_ID,
    quantity: 1,
  }],
  success_url: `${APP_URL}/home?upgrade=success`,
  cancel_url: `${APP_URL}/pricing`,
  metadata: { userId },
})
```

### Webhook handlers
`src/app/api/webhook/stripe/route.ts` — handle these events:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Update community `plan` or user `individualPlan` |
| `customer.subscription.updated` | Handle plan changes and upgrades |
| `customer.subscription.deleted` | Downgrade to free, send notification |
| `invoice.payment_failed` | Flag community/user, send payment failed notification |

---

## ✅ Pricing Done When

- [ ] `plan` and `individualPlan` fields exist on `communities` and `users` tables
- [ ] `getPlanAccess()` helper works and is used in all gated features
- [ ] AI assistant shows paywall on free communities with Member Pro CTA
- [ ] Upgrade prompts appear at the right moments — not randomly
- [ ] `/pricing` page exists and is accessible without auth
- [ ] Community plan Stripe checkout works
- [ ] Member Pro Stripe checkout works

---
