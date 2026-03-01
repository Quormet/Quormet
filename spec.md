# Quormet — Identity & Product Direction Spec

> This document defines what Quormet *is*, how it should feel, and how every
> feature, screen, and word should reflect that identity.
> Read this before building or designing anything.

---

## The Identity

**Quormet is the platform for running any community.**

Not a dashboard. Not a chat tool. Not a management system.
A platform. For communities. Any community.

Every design decision, every word of copy, every feature interaction should
pass one test:

> *Does this help a community govern itself, communicate clearly, and get things done?*

If yes, it belongs. If not, it doesn't.

---

## The One-Sentence Pitch

> Quormet is the community layer the internet is missing — the first platform
> built from the ground up for the way communities actually work, with real
> governance, real transparency, and an AI that runs your community alongside you.

This is not marketing copy. This is the product vision. Every person on the
team should be able to say this from memory.

---

## What Quormet Is Not

Getting this wrong is just as important as getting it right.

| What people might compare it to | Why Quormet is different |
|----------------------------------|--------------------------|
| **Slack / Discord** | Those are conversation tools. Quormet is a governance tool. Slack gives you a place to talk about decisions. Quormet gives you the structure to make them, record them, and act on them. |
| **Nextdoor** | Nextdoor is a social network for neighborhoods. Quormet is an operating system for communities. Nextdoor optimizes for engagement. Quormet optimizes for outcomes. |
| **Buildium / AppFolio** | Those are property management tools for landlords. Quormet is a community tool for members. They're built for administrators. Quormet is built for everyone. |
| **Google Groups / Facebook Groups** | Unstructured. No governance. No accountability. No institutional memory. Quormet brings structure to everything those tools leave chaotic. |

---

## The Primary User

Quormet is for **anyone who belongs to a community or group.**

This means:
- The HOA board member trying to get a quorum
- The condo resident wondering if their renovation needs approval
- The sports club treasurer chasing unpaid dues
- The church committee planning the annual gala
- The tenant union organizer tracking a landlord dispute
- The co-working space member looking for a freelancer
- The university residence hall RA managing 200 students

There is no single primary user. The platform serves the whole community —
admins and members alike — because a community only works when everyone
is included.

---

## The Emotional Experience

How should using Quormet feel?

**For admins:**
Like having a co-pilot. The AI handles the repetitive work. The intelligence
surfaces what needs attention. The governance tools give every decision a
paper trail. Running a community should feel manageable, not overwhelming.

**For members:**
Like being genuinely included. Not just receiving announcements — actually
having a voice, seeing your issue get fixed, knowing where your dues went,
feeling like the community is being run well. Quormet should make members
feel like they live in a community that works.

**For everyone:**
Like the tools finally match the task. Every other platform makes community
management harder than it should be. Quormet should feel like the obvious
tool — the one that should have always existed.

---

## Voice & Tone

Every word in the product — buttons, empty states, error messages, onboarding
copy — should reflect this identity.

### Principles

**Civic, not corporate.**
This is a community platform, not enterprise software. The language should
feel like it was written by someone who cares about their neighborhood, not
by a product manager.

✅ "Your community, your rules"
❌ "Configure your organization's governance parameters"

**Confident, not jargon-heavy.**
Quormet is doing something real. Say it plainly.

✅ "Make a decision together"
❌ "Leverage collaborative decision-making workflows"

**Warm, not casual.**
This isn't a startup trying to be your friend. It's a serious tool for
serious community work. But it's human.

✅ "Looks like nothing needs your attention right now."
❌ "No pending action items in queue."
❌ "Hey! You're all good! 🎉"

**Active, not passive.**
Quormet helps communities act. The language should reflect that.

✅ "Start a vote" / "Fix this issue" / "Bring your community together"
❌ "A vote can be initiated" / "Issues may be submitted"

### Specific Word Choices

| Don't say | Say instead |
|-----------|-------------|
| Residents | Members |
| Neighbors | Members / Fellow members |
| Users | Members / Admins |
| HOA | Community (unless specifically an HOA) |
| Bylaws | Community rules / Guidelines |
| Dues | Membership fees (or "dues" if the community calls them that) |
| Dashboard | Home |
| Submit | Post / Share / Send |
| Administrator | Admin / Board member |
| Tenants | Members |

---

## Onboarding — The First Impression

Onboarding is where the identity is established. It should feel like founding
something, not filling out a form.

### What it should feel like

The moment an admin creates a community on Quormet, they should feel like
they just built something real. Not "you've set up your account" — more like
"your community now has a home."

### Copy direction

Current (wrong):
> "Enter your HOA name"
> "Set up your account"

Should be:
> "What are you building?"
> "Give your community a name"
> "Your community is ready."
> "Share this code with your members: **MAPLE1**"

### Community type selector

When creating a community, members choose what kind it is. This isn't just
for terminology — it shapes the entire onboarding experience and sets the
right context for the AI assistant's system prompt.

```
What kind of community is this?

🏘️  HOA / Condo Association
🏢  Apartment Building
⚽  Sports Club / Team
⛪  Religious Organization
🎓  Student / Campus Group
💼  Professional Association
✊  Tenant Union
🏡  Neighborhood Group
🔧  Co-working / Shared Space
🌍  Other
```

Each type gets slightly different default terminology throughout the app.
Implement this as a `communityType` field on the `communities` table and
a helper function that maps types to terminology:

```ts
// src/utils/communityTerms.ts
export function getTerms(communityType: string) {
  const terms: Record<string, Record<string, string>> = {
    hoa: {
      members: 'Residents',
      fees: 'Dues',
      rules: 'Bylaws',
      board: 'Board',
    },
    sports_club: {
      members: 'Members',
      fees: 'Membership fees',
      rules: 'Club rules',
      board: 'Committee',
    },
    religious: {
      members: 'Congregation',
      fees: 'Tithes / Contributions',
      rules: 'Guidelines',
      board: 'Leadership',
    },
    tenant_union: {
      members: 'Tenants',
      fees: 'Union dues',
      rules: 'Bylaws',
      board: 'Organizers',
    },
    default: {
      members: 'Members',
      fees: 'Membership fees',
      rules: 'Community rules',
      board: 'Admin',
    },
  }
  return terms[communityType] ?? terms.default
}
```

---

## The Dashboard — Command Center, Not Feed

The dashboard is the heart of Quormet. It should feel like mission control,
not a social media feed.

### What it communicates at a glance

In under 5 seconds, anyone landing on the dashboard should know:
1. What needs their attention right now
2. The current health of their community
3. What's happening soon

### Layout principles

**Hierarchy matters.** Personal to-dos come before community updates.
Action items come before passive information. Urgency is always visible.

**No empty space.** Every section either shows real data or a meaningful
empty state with a clear CTA. A blank dashboard is a broken dashboard.

**The AI is always present.** The assistant panel is never hidden or collapsed
by default. It's core to the identity — not an add-on.

### The community health bar (admin only)

A single visual at the top of the dashboard that communicates the overall
health of the community at a glance. Calculated from:

- % of members who voted in the last poll
- % of dues paid
- Issues resolved vs open
- Days since last announcement

```
Community Health
████████████░░░░  73%  Good
Dues collection is dragging your score down.  [View]
```

This is the number judges will screenshot. Make it real.

```ts
// src/utils/communityHealth.ts
export async function getCommunityHealth(communityId: string): Promise<{
  score: number
  label: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical'
  insight: string
  color: string
}> {
  // Each metric contributes 25 points max
  const [pollParticipation, duesRate, issueResolution, communicationFrequency] =
    await Promise.all([
      getPollParticipationRate(communityId),   // 0-25
      getDuesCollectionRate(communityId),       // 0-25
      getIssueResolutionRate(communityId),      // 0-25
      getCommunicationScore(communityId),       // 0-25
    ])

  const score = pollParticipation + duesRate + issueResolution + communicationFrequency

  if (score >= 85) return { score, label: 'Excellent', color: 'text-green-500',
    insight: 'Your community is thriving.' }
  if (score >= 65) return { score, label: 'Good', color: 'text-blue-500',
    insight: 'A few things could use attention.' }
  if (score >= 40) return { score, label: 'Needs Attention', color: 'text-yellow-500',
    insight: 'Several areas need improvement.' }
  return { score, label: 'Critical', color: 'text-red-500',
    insight: 'Your community needs immediate attention.' }
}
```

---

## The AI Assistant — The Soul of Quormet

The AI assistant is not a chatbot bolted onto a dashboard. It is the
expression of Quormet's core identity.

Every other community tool is dumb — it stores data and shows it back to you.
Quormet understands your community and helps you run it.

### How the AI should be introduced

Not as a feature. As a collaborator.

```
Meet your community assistant.

It knows your rules, your members, your history, and your
current state. Ask it anything. Tell it what to do.

[What are our quiet hours?]
[Schedule our next meeting]
[Who hasn't paid dues?]
[Draft an announcement about the parking situation]
```

### What the AI must always be able to do

These are non-negotiable for the demo:

1. Answer questions about community rules from uploaded documents
2. Create an announcement from a natural language description
3. Create a poll from a natural language description
4. Schedule an event from a natural language description
5. Report on community stats ("how many members have paid dues?")
6. Surface the right action at the right time ("your poll closes tomorrow,
   want me to send a reminder?")

### What the AI should never do

- Make up rules that aren't in the community's documents
- Take admin actions when the user is a member
- Be sycophantic ("Great question!")
- Give long-winded responses in a chat interface
- Say "As an AI language model..."

---

## Feature Identity — How Each Feature Reflects the Mission

Every feature should have a clear answer to "why does this exist?"

| Feature | Why it exists | What it replaces |
|---------|--------------|-----------------|
| **Announcements** | Institutional communication with a record | Email chains nobody reads |
| **Polls & Voting** | Collective decision-making with accountability | WhatsApp votes, show of hands |
| **Issues / Progress Tracker** | Transparent operations | Requests that disappear into inboxes |
| **Document Vault** | Institutional memory | PDFs nobody can find |
| **Events & RSVPs** | Community coordination | Eventbrite + a separate email |
| **Member Directory** | Trusted connections within the community | LinkedIn for strangers |
| **Community Board** | Internal economy and mutual aid | Facebook Marketplace without trust |
| **AI Assistant** | Institutional intelligence | Googling your own bylaws |
| **Intelligence Feed** | Proactive governance | Things falling through the cracks |
| **Dues & Payments** | Financial accountability | Venmo requests and spreadsheets |

---

## What "Done" Looks Like for Identity

The product has the right identity when:

- [ ] A judge can describe what Quormet is in one sentence after a 2-minute demo
- [ ] The word "neighbor" does not appear anywhere in the UI
- [ ] Onboarding includes a community type selector
- [ ] Community type changes terminology throughout the app
- [ ] The dashboard has a community health score
- [ ] The AI assistant is visible on the dashboard by default, not hidden
- [ ] Every empty state has a human, action-oriented message
- [ ] Every button uses active language ("Start a vote" not "Create poll")
- [ ] The product works equally well for an HOA and a sports club
- [ ] The pitch "Quormet is the community layer the internet is missing"
      makes sense after seeing the product

---

## The Demo Script

This is the exact flow to walk through for judges. Every step should
reinforce the identity.

**Opening line:**
> "Every community in the world — HOAs, clubs, unions, churches — is running
> on tools built for individuals, not groups. Quormet fixes that."

**Step 1 — Onboarding** (30 seconds)
Show the community type selector. Create a community. Show the join code.
Say: "Any community. Any kind. Set up in 60 seconds."

**Step 2 — Dashboard** (30 seconds)
Show the community health score. Show the personal to-do list. Show the
intelligence nudges. Say: "The dashboard tells you exactly what needs
attention — for the admin and for every member."

**Step 3 — AI Assistant** (60 seconds)
Type: "Are dogs allowed in the pool area?"
Show it cite the bylaws.
Type: "Schedule a community cleanup for March 20 at 9am"
Show the event appear instantly.
Say: "The AI doesn't just answer questions. It runs your community alongside you."

**Step 4 — Progress Tracker** (30 seconds)
Show an issue moving through stages. Show the timeline.
Say: "No more black holes. Every issue has a status. Every member can see it."

**Step 5 — Voting** (30 seconds)
Show a poll with a quorum progress bar.
Say: "Decisions are made transparently, with a record, and with accountability."

**Closing line:**
> "There are 400 million community organizations in the world. Every single
> one of them deserves tools this good."

---

## For the Business Innovator Award

If applying, the identity argument is your strongest asset:

**The market:** Every human institution that isn't a corporation is a community.
HOAs, clubs, unions, churches, student orgs, co-ops. Hundreds of millions of
organizations globally, almost none of them with purpose-built software.

**The moat:** Institutional memory. Once a community's bylaws, history,
decisions, and vendor relationships live in Quormet, switching costs are
enormous. The AI gets smarter about your community the longer you use it.

**The SDG argument:** Quormet directly addresses SDG 11 and 16 not as a
side effect but as its core value proposition. Transparent governance,
accountable institutions, inclusive participation — these aren't features,
they're what the product is.

**The business model:** SaaS with a free tier for small communities,
paid tiers for larger ones. Low CAC because admins self-serve. High
retention because the institutional memory is irreplaceable. Natural
expansion because communities grow.