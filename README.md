# Quorify

**The platform for running any community.**

Quorify is the community layer the internet is missing — an all-in-one platform for governance, communication, and operations. Built for HOAs, apartment buildings, sports clubs, tenant unions, churches, and any group of people who share a space or a responsibility.

🌐 **Live app:** [quorify.vercel.app](https://quorify.vercel.app)

---

## The Problem

400 million community organizations worldwide are making collective decisions over WhatsApp. Managing shared money in spreadsheets. Losing institutional knowledge every time leadership changes.

The tools exist for everything else — project management, CRM, finance. Nobody built them for communities. Until now.

---

## What Quorify Does

| Feature | What it replaces |
|---------|-----------------|
| **Announcements** | Email chains nobody reads |
| **Polls & Voting** | WhatsApp votes and show of hands |
| **Progress Tracker** | Maintenance requests that disappear |
| **Document Vault** | PDFs nobody can find |
| **Events & RSVPs** | Eventbrite + a separate email |
| **Member Directory** | Spreadsheets and group texts |
| **Community Board** | Facebook Marketplace without trust |
| **Dues & Payments** | Venmo requests and manual tracking |
| **AI Assistant** | Googling your own bylaws |
| **Intelligence Feed** | Things falling through the cracks |

---

## The AI Assistant

The Quorify Assistant is powered by Google Gemini via Vertex AI. It understands your community's specific rules, schedules, and history.

**Members can ask:**
- "What are the quiet hours?"
- "Can I install a fence?"
- "Have I paid my dues?"
- "What events are coming up?"

**Admins can say:**
- "Post an announcement about the water shutoff tomorrow at 9am"
- "Create a poll: should we repaint the clubhouse? Yes / No / Maybe"
- "Schedule a block party March 15 at 2pm at the community park"
- "Who hasn't paid dues?"

The AI doesn't just answer questions — it takes action.

---

## SDG Alignment

**SDG 11 — Sustainable Cities & Communities**
Issue tracking connects residents to the infrastructure that keeps communities safe. Events and the member directory build social cohesion and resilience.

**SDG 16 — Peace, Justice & Strong Institutions**
Every vote is recorded. Every decision has a trail. Every member has equal access to their community's rules. The AI bylaw bot democratizes access to legal information — a first-generation homeowner can ask "can I paint my door?" and get a cited answer in plain English.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Shadcn UI |
| Backend | Next.js Server Actions, Drizzle ORM |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email, Google, GitHub OAuth) |
| AI | Google Gemini via Google Cloud Vertex AI |
| Payments | Stripe Checkout + Webhooks |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Google Cloud project with Vertex AI enabled
- A Stripe account (for payments)

### Environment Variables

Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=true
# Local dev: path to service account JSON
GOOGLE_APPLICATION_CREDENTIALS=
# Vercel: full JSON contents of service account key
GOOGLE_SERVICE_ACCOUNT_JSON=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repo
git clone https://github.com/Quorify/Quorify.git
cd Quorify

# Install dependencies
npm install

# Push the database schema
npx drizzle-kit push

# Seed initial data
npx tsx scripts/seed.ts

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
  app/
    (auth)/              # Sign in, sign up, onboarding
    (dashboard)/         # Protected app routes
      home/              # Dashboard
      announcements/
      polls/
      events/
      documents/
      issues/
      payments/
      directory/
      board/             # Community board
      settings/          # Admin only
    api/
      assistant/         # Gemini AI chat endpoint
      checkout/          # Stripe checkout sessions
      webhook/           # Stripe webhooks
  components/
    assistant/           # AI chat panel components
    issues/              # Progress tracker components
    intelligence/        # Nudges and to-do components
    ui/                  # Shadcn UI components
  db/
    schema.ts            # Drizzle schema
    index.ts             # DB client
  utils/
    supabase/            # Supabase client helpers
    assistant/           # Gemini tools and system prompt
    intelligence/        # Nudge generation and personal to-dos
    getCurrentUser.ts    # Auth helper
    planAccess.ts        # Feature gating by plan
```

---

## Pricing

| Plan | Price | Members |
|------|-------|---------|
| Free | $0/mo | Up to 20 |
| Community | $29/mo | Up to 50 |
| Pro | $49/mo | Up to 150 |
| Scale | $49 + $8/50 members | Unlimited |
| Member Pro | $3/mo | Individual upgrade |

Member Pro lets individual members unlock AI and pro features even if their board hasn't upgraded — creating natural bottom-up pressure for community plan adoption.

---

## Built

Built in March 2026 for the Google x Forbes $1M Pitch Competition.

---

## License

MIT