# Quormet — Progress Tracker Spec
> "The Pizza Tracker for HOA Issues"
> Moves issue reporting from a black hole into a transparent, staged pipeline.

---

## Overview

Any resident can submit an issue — a broken gate, burnt-out streetlight, noise complaint, parking violation. The board manages it through 5 stages. The resident can see exactly where their issue is at any time. No more "did anyone read my email?"

This feature maps directly to **SDG 11** (safe, resilient communities) and **SDG 16** (accountable institutions).

---

## The 5 Stages

```
Submitted → Board Review → Vendor Assigned → In Progress → Resolved
```

| Stage | Who sets it | What it means |
|-------|-------------|---------------|
| `submitted` | Auto (on creation) | Issue received, not yet reviewed |
| `board_review` | Admin | Board has seen it, deciding what to do |
| `vendor_assigned` | Admin | A contractor or vendor has been assigned |
| `in_progress` | Admin | Work has started |
| `resolved` | Admin | Issue is fixed |

---

## UI — What It Looks Like

### Issue List Page (`/issues`)

**Member view** — their own issues only:
```
┌─────────────────────────────────────────────────────┐
│  My Issues                          [+ Report Issue] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔴 Broken gate latch — Building A entrance        │
│  Submitted Jan 15 · ●●○○○ Board Review             │
│                                                     │
│  🟡 Parking lot light out — Spot 24                │
│  Submitted Jan 8  · ●●●●○ In Progress              │
│                                                     │
│  🟢 Graffiti on east wall                          │
│  Submitted Dec 20 · ●●●●● Resolved ★★★★☆          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Admin view** — all community issues with filters:
```
┌─────────────────────────────────────────────────────┐
│  All Issues (12)        [Filter ▾]  [+ New Issue]  │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│Submitted │  Board   │ Vendor   │   In     │Resolved │
│    3     │  Review  │Assigned  │ Progress │    4    │
│          │    2     │    1     │    2     │         │
├─────────────────────────────────────────────────────┤
│  🔴 Broken gate latch          Sarah J.  Jan 15    │
│     ●●○○○ Board Review         [Update Status ▾]   │
│                                                     │
│  🔴 Pool pump noise            Mike C.   Jan 14    │
│     ●○○○○ Submitted            [Update Status ▾]   │
└─────────────────────────────────────────────────────┘
```

---

### Issue Detail Page (`/issues/[id]`)

This is the pizza tracker moment. Full page showing the issue and its live progress.

```
┌──────────────────────────────────────────────────────┐
│  ← Back to Issues                                    │
│                                                      │
│  Broken gate latch — Building A entrance             │
│  Reported by Sarah Johnson · January 15, 2026        │
│  Category: Maintenance                               │
│                                                      │
│  ────────────────── PROGRESS ──────────────────────  │
│                                                      │
│  ●────────●────────○────────○────────○              │
│  Submitted  Board             Vendor   In      Resolved
│  Jan 15     Review            Assigned Progress      │
│             Jan 16                                   │
│                                                      │
│  ──────────────── DESCRIPTION ─────────────────────  │
│                                                      │
│  The latch on the main entrance gate to Building A   │
│  is broken. The gate swings open freely and does     │
│  not lock. This is a security concern.               │
│                                                      │
│  📷 [photo attached]                                 │
│                                                      │
│  ─────────────────── UPDATES ──────────────────────  │
│                                                      │
│  Jan 16 — Board Review                              │
│  "We've reviewed this and are getting quotes from   │
│   two vendors."                                      │
│                                                      │
│  Jan 15 — Submitted                                  │
│  Issue received.                                     │
│                                                      │
│  ─────────── ADMIN CONTROLS (admin only) ──────────  │
│                                                      │
│  Status:    [Board Review          ▾]                │
│  Assigned:  [Select vendor...      ▾]                │
│  Note:      [Add an update note...   ]               │
│             [Save Update]                            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

### Submit Issue Form (Modal)

Triggered by "Report Issue" button. Available to all members.

```
Report an Issue
───────────────────────────────────
Title           [Short description of the issue  ]

Category        [Maintenance         ▾]
                Options: Maintenance / Safety /
                         Noise / Parking / Other

Location        [Where is this? Building, unit,  ]
                [area of the community            ]

Description     [                                ]
                [Describe the issue in detail... ]
                [                                ]

Photo           [📎 Attach a photo (optional)   ]
                Accepted: JPG, PNG — max 5MB

                [Cancel]    [Submit Issue →]
```

---

## Vendor Scorecard

When an issue moves to `resolved`, the reporting resident sees a rating prompt.

**On the issue detail page (resolved state):**
```
┌──────────────────────────────────────────────────────┐
│  ✅ This issue has been resolved.                    │
│                                                      │
│  How was the work done by [vendor name]?             │
│                                                      │
│  ☆ ☆ ☆ ☆ ☆   (tap to rate)                         │
│                                                      │
│  Leave a comment (optional):                         │
│  [                                              ]    │
│                                                      │
│  [Submit Rating]                                     │
└──────────────────────────────────────────────────────┘
```

**Vendor Directory (admin only) — `/settings/vendors`:**
```
┌──────────────────────────────────────────────────────┐
│  Vendor Directory                    [+ Add Vendor]  │
├──────────────────────────────────────────────────────┤
│  ABC Gate Repair                                     │
│  ★★★★☆  4.2 avg · 5 jobs completed                  │
│  Last used: Jan 16, 2026                             │
│  Categories: Maintenance, Security                   │
│                                                      │
│  Bob's Electric                                      │
│  ★★★★★  4.8 avg · 12 jobs completed                 │
│  Last used: Dec 10, 2025                             │
│  Categories: Electrical                              │
└──────────────────────────────────────────────────────┘
```

---

## Database Schema

Add these tables to `src/db/schema.ts`:

```ts
// Issues table
export const issues = pgTable('issues', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),
  reportedBy: uuid('reported_by').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // maintenance | safety | noise | parking | other
  location: text('location').notNull(),
  photoUrl: text('photo_url'),
  status: text('status').notNull().default('submitted'),
  // submitted | board_review | vendor_assigned | in_progress | resolved
  assignedVendorId: uuid('assigned_vendor_id').references(() => vendors.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Issue updates / activity log
export const issueUpdates = pgTable('issue_updates', {
  id: uuid('id').defaultRandom().primaryKey(),
  issueId: uuid('issue_id').references(() => issues.id).notNull(),
  updatedBy: uuid('updated_by').references(() => users.id).notNull(),
  previousStatus: text('previous_status'),
  newStatus: text('new_status').notNull(),
  note: text('note'), // optional admin note with each status change
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Vendors table
export const vendors = pgTable('vendors', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),
  name: text('name').notNull(),
  categories: text('categories').array(), // ['maintenance', 'electrical', etc]
  phone: text('phone'),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Vendor ratings
export const vendorRatings = pgTable('vendor_ratings', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: uuid('vendor_id').references(() => vendors.id).notNull(),
  issueId: uuid('issue_id').references(() => issues.id).notNull(),
  ratedBy: uuid('rated_by').references(() => users.id).notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

After adding these, run:
```bash
npx drizzle-kit push
```

---

## Server Actions

`src/app/(dashboard)/issues/actions.ts`

```ts
'use server'
import { db } from '@/db'
import { issues, issueUpdates, vendorRatings } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/utils/getCurrentUser'
import { revalidatePath } from 'next/cache'

// Submit a new issue (any member)
export async function submitIssue(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const [created] = await db.insert(issues).values({
    communityId: user.communityId!,
    reportedBy: user.id,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    location: formData.get('location') as string,
    photoUrl: formData.get('photoUrl') as string | null,
    status: 'submitted',
  }).returning()

  // Log the initial status
  await db.insert(issueUpdates).values({
    issueId: created.id,
    updatedBy: user.id,
    previousStatus: null,
    newStatus: 'submitted',
    note: 'Issue received.',
  })

  revalidatePath('/issues')
  return created
}

// Update issue status (admin only)
export async function updateIssueStatus(
  issueId: string,
  newStatus: string,
  note?: string,
  vendorId?: string
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') throw new Error('Forbidden')

  const [current] = await db.select().from(issues).where(eq(issues.id, issueId))
  if (!current) throw new Error('Issue not found')

  await db.update(issues)
    .set({
      status: newStatus,
      assignedVendorId: vendorId ?? current.assignedVendorId,
      updatedAt: new Date(),
    })
    .where(eq(issues.id, issueId))

  await db.insert(issueUpdates).values({
    issueId,
    updatedBy: user.id,
    previousStatus: current.status,
    newStatus,
    note: note ?? null,
  })

  revalidatePath(`/issues/${issueId}`)
  revalidatePath('/issues')
}

// Get all issues (admin) or own issues (member)
export async function getIssues() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  if (user.role === 'admin') {
    return db.select().from(issues)
      .where(eq(issues.communityId, user.communityId!))
      .orderBy(issues.createdAt)
  }

  return db.select().from(issues)
    .where(and(
      eq(issues.communityId, user.communityId!),
      eq(issues.reportedBy, user.id)
    ))
    .orderBy(issues.createdAt)
}

// Get single issue with updates
export async function getIssue(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const [issue] = await db.select().from(issues).where(eq(issues.id, id))
  const updates = await db.select().from(issueUpdates)
    .where(eq(issueUpdates.issueId, id))
    .orderBy(issueUpdates.createdAt)

  return { issue, updates }
}

// Submit vendor rating (member, resolved issues only)
export async function submitVendorRating(
  issueId: string,
  vendorId: string,
  rating: number,
  comment?: string
) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  await db.insert(vendorRatings).values({
    vendorId,
    issueId,
    ratedBy: user.id,
    rating,
    comment: comment ?? null,
  })

  revalidatePath(`/issues/${issueId}`)
}
```

---

## The Progress Stepper Component

`src/components/issues/ProgressStepper.tsx`

```tsx
import { Check } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const STAGES = [
  { key: 'submitted',        label: 'Submitted' },
  { key: 'board_review',     label: 'Board Review' },
  { key: 'vendor_assigned',  label: 'Vendor Assigned' },
  { key: 'in_progress',      label: 'In Progress' },
  { key: 'resolved',         label: 'Resolved' },
]

type Update = {
  newStatus: string
  createdAt: Date
}

export default function ProgressStepper({
  currentStatus,
  updates,
}: {
  currentStatus: string
  updates: Update[]
}) {
  const currentIndex = STAGES.findIndex(s => s.key === currentStatus)

  const getDateForStage = (stageKey: string) =>
    updates.find(u => u.newStatus === stageKey)?.createdAt

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isPending = index > currentIndex
          const date = getDateForStage(stage.key)

          return (
            <div key={stage.key} className="flex flex-col items-center gap-2 z-10">
              {/* Circle */}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                isCompleted && 'bg-primary border-primary text-primary-foreground',
                isCurrent && 'bg-background border-primary text-primary ring-4 ring-primary/20',
                isPending && 'bg-background border-muted text-muted-foreground'
              )}>
                {isCompleted
                  ? <Check className="w-4 h-4" />
                  : <span className="text-xs font-bold">{index + 1}</span>
                }
              </div>

              {/* Label */}
              <div className="text-center">
                <p className={cn(
                  'text-xs font-medium',
                  (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {stage.label}
                </p>
                {date && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(date), 'MMM d')}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## Status Badge Component

`src/components/issues/StatusBadge.tsx`

```tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  submitted:       { label: 'Submitted',       color: 'bg-slate-100 text-slate-700' },
  board_review:    { label: 'Board Review',     color: 'bg-yellow-100 text-yellow-700' },
  vendor_assigned: { label: 'Vendor Assigned',  color: 'bg-blue-100 text-blue-700' },
  in_progress:     { label: 'In Progress',      color: 'bg-orange-100 text-orange-700' },
  resolved:        { label: 'Resolved',         color: 'bg-green-100 text-green-700' },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
  if (!config) return null

  return (
    <Badge className={cn('font-medium border-0', config.color)}>
      {config.label}
    </Badge>
  )
}
```

---

## Admin Status Update UI

The dropdown + note field shown on the issue detail page for admins.

`src/components/issues/AdminStatusPanel.tsx`

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateIssueStatus } from '@/app/(dashboard)/issues/actions'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const STATUSES = [
  { value: 'submitted',        label: 'Submitted' },
  { value: 'board_review',     label: 'Board Review' },
  { value: 'vendor_assigned',  label: 'Vendor Assigned' },
  { value: 'in_progress',      label: 'In Progress' },
  { value: 'resolved',         label: 'Resolved' },
]

export default function AdminStatusPanel({
  issueId,
  currentStatus,
}: {
  issueId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSave() {
    setLoading(true)
    try {
      await updateIssueStatus(issueId, status, note)
      setNote('')
      toast({ title: 'Status updated', description: `Issue moved to ${status.replace('_', ' ')}` })
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <p className="text-sm font-semibold">Admin Controls</p>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Update Note (optional)</label>
        <Textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note for the resident..."
          className="resize-none"
          rows={3}
        />
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save Update
      </Button>
    </div>
  )
}
```

---

## Vendor Star Rating Component

`src/components/issues/StarRating.tsx`

```tsx
'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitVendorRating } from '@/app/(dashboard)/issues/actions'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export default function StarRating({
  issueId,
  vendorId,
  vendorName,
}: {
  issueId: string
  vendorId: string
  vendorName: string
}) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit() {
    if (!selected) return
    setLoading(true)
    try {
      await submitVendorRating(issueId, vendorId, selected, comment)
      setSubmitted(true)
      toast({ title: 'Rating submitted', description: 'Thank you for your feedback!' })
    } catch {
      toast({ title: 'Error', description: 'Failed to submit rating', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
      ✅ Thanks for rating {vendorName}!
    </div>
  )

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
      <p className="text-sm font-medium">How was the work by {vendorName}?</p>

      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(star)}
          >
            <Star className={cn(
              'w-7 h-7 transition-colors',
              star <= (hovered || selected)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            )} />
          </button>
        ))}
      </div>

      <Textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Leave a comment (optional)..."
        className="resize-none"
        rows={2}
      />

      <Button
        onClick={handleSubmit}
        disabled={!selected || loading}
        size="sm"
        className="w-full"
      >
        Submit Rating
      </Button>
    </div>
  )
}
```

---

## Navigation

Add Issues to the sidebar nav in your layout:

```tsx
{ href: '/issues', icon: ClipboardList, label: 'Issues' }
```

Import `ClipboardList` from `lucide-react`.

---

## Seed Data

Add to `src/db/seed.ts`:

```ts
// Vendors
const [vendor1] = await db.insert(vendors).values({
  communityId: community.id,
  name: 'ABC Gate Repair',
  categories: ['maintenance', 'security'],
  phone: '(303) 555-0120',
  email: 'contact@abcgate.com',
}).returning()

const [vendor2] = await db.insert(vendors).values({
  communityId: community.id,
  name: "Bob's Electric",
  categories: ['electrical'],
  phone: '(303) 555-0145',
}).returning()

// Issues — mix of statuses for a good demo
const [issue1] = await db.insert(issues).values({
  communityId: community.id,
  reportedBy: memberUser.id,
  title: 'Broken gate latch — Building A entrance',
  description: 'The latch on the main entrance gate is broken. The gate swings open freely.',
  category: 'maintenance',
  location: 'Building A main entrance',
  status: 'board_review',
}).returning()

const [issue2] = await db.insert(issues).values({
  communityId: community.id,
  reportedBy: memberUser2.id,
  title: 'Parking lot light out — Spot 24',
  description: 'The overhead light near spot 24 has been out for a week. Safety concern at night.',
  category: 'safety',
  location: 'Parking lot, spot 24',
  status: 'in_progress',
  assignedVendorId: vendor2.id,
}).returning()

const [issue3] = await db.insert(issues).values({
  communityId: community.id,
  reportedBy: memberUser.id,
  title: 'Graffiti on east wall',
  description: 'Graffiti appeared overnight on the east perimeter wall near the mailboxes.',
  category: 'maintenance',
  location: 'East perimeter wall',
  status: 'resolved',
  assignedVendorId: vendor1.id,
}).returning()

// Issue updates (activity log)
await db.insert(issueUpdates).values([
  { issueId: issue1.id, updatedBy: adminUser.id, previousStatus: null,
    newStatus: 'submitted', note: 'Issue received.' },
  { issueId: issue1.id, updatedBy: adminUser.id, previousStatus: 'submitted',
    newStatus: 'board_review', note: 'Getting quotes from vendors.' },
  { issueId: issue2.id, updatedBy: adminUser.id, previousStatus: null,
    newStatus: 'submitted', note: 'Issue received.' },
  { issueId: issue2.id, updatedBy: adminUser.id, previousStatus: 'submitted',
    newStatus: 'board_review', note: null },
  { issueId: issue2.id, updatedBy: adminUser.id, previousStatus: 'board_review',
    newStatus: 'vendor_assigned', note: "Bob's Electric assigned." },
  { issueId: issue2.id, updatedBy: adminUser.id, previousStatus: 'vendor_assigned',
    newStatus: 'in_progress', note: 'Electrician on site today.' },
  { issueId: issue3.id, updatedBy: adminUser.id, previousStatus: null,
    newStatus: 'submitted', note: 'Issue received.' },
  { issueId: issue3.id, updatedBy: adminUser.id, previousStatus: 'submitted',
    newStatus: 'resolved', note: 'Wall cleaned and repainted.' },
])
```

---

## ✅ Done When

- [ ] `npx drizzle-kit push` runs without errors with new tables
- [ ] Any member can submit an issue via the modal form
- [ ] Issue list shows member's own issues (member) or all issues (admin)
- [ ] Issue detail page shows the 5-stage progress stepper with correct current stage
- [ ] Progress stepper fills in with dates from the issue updates log
- [ ] Admin can change status via dropdown + optional note
- [ ] Status change appears immediately in the updates timeline on the detail page
- [ ] Resolved issues show the star rating prompt to the reporting resident
- [ ] Star rating saves to DB and shows "Thanks for rating" on resubmit
- [ ] Vendor directory page shows all vendors with average rating
- [ ] Issues page is in the sidebar nav
- [ ] Seed data creates 3 issues at different stages for demo