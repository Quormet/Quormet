# Quorify - AI Context & Developer Handbook

This document provides a comprehensive overview of the Quorify application to assist AI agents in understanding the codebase, architecture, and feature set.

## Project Vision
Quorify is an all-in-one community management platform designed for neighborhood associations, HOAs, and community groups. It replaces fragmented email chains with a centralized hub for governance, communication, and operations.


## Technical Stack
- **Core**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Authentication**: Supabase Auth (Supporting Email/Password, Google, and GitHub)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS & Vanilla CSS
- **UI Components**: Shadcn UI (Radix UI based)
- **Icons**: Lucide React
- **Payments**: Stripe (Checkout & Webhooks)
- **Utilities**: `date-fns` for date manipulation

## Architecture & Conventions
### 1. Routing & Server Actions
- Routes are located in `src/app`.
- Data mutations are handled via **Next.js Server Actions**, usually located in `actions.ts` files within each route folder (e.g., `src/app/(dashboard)/announcements/actions.ts`).
- Route protection is managed via `src/middleware.ts`, which ensures Supabase sessions are refreshed and unauthorized users are redirected.

### 2. Database & Data Modeling
- Schema is defined in `src/db/schema.ts` using Drizzle ORM.
- **Key Tables**:
    - `users`: Stores user profile info. Linked via `supabaseId` to Supabase Auth. Includes roles (`admin`, `member`) and `communityId`.
    - `communities`: Represents a neighborhood group. Users belong to a community via `communityId`.
    - `announcements`: Community-wide news updates.
    - `polls` & `votes`: System for community decision-making.
    - `events` & `rsvps`: Management for community gatherings.
    - `documents`: Secure links to community files.
    - `payments`: Tracks Stripe payment statuses.

### 3. Authentication Flow
- Handled via helpers in `src/utils/supabase/`.
- `auth/actions.ts` contains the logic for sign-in, sign-up, and OAuth.
- Post-authentication flows (Onboarding) redirect users to either create or join a community based on their role selection.

## Core Features
### [Dashboard]
Centralized view showing recent activity across all modules (recent announcements, upcoming events, active polls).

### [Announcements]
Admins can post formatted text announcements. Members can view them in a reverse-chronological list.

### [Voting & Polls]
- Admins create polls with multiple options.
- Members vote once per poll.
- Live results are calculated server-side and rendered in client components.

### [Dues & Payments]
- Integrates with Stripe.
- Admins set dues; members trigger a Stripe Checkout session.
- Stripe Webhooks (`src/app/api/webhook/stripe/route.ts`) update payment status in the database.

### [Document Vault]
Secure storage for community documents (Bylaws, Meeting Minutes). Currently supports external URL links (Google Drive, etc.).

### [Events & RSVPs]
- Community-wide calendar of events.
- Users can RSVP "Yes" or "No".
- Admins can view attendee lists.

### [Member Directory]
- List of neighbors with visibility controls.
- Users can opt-in/out of sharing their contact details (phone/email) with other members.
- Admins have full visibility.

## Development Notes
- **Supabase**: Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Drizzle**: Use `npx drizzle-kit push` for schema updates.
- **UI**: Follow the design language in `src/app/globals.css` and use Shadcn components for consistency.
