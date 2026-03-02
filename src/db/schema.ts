/**
 * Defines the database schema using Drizzle ORM, including tables for communities, users, 
 * announcements, polls, votes, documents, events, RSVPs, and payments, along with their 
 * relational mappings.
 */
import { pgTable, serial, text, timestamp, boolean, integer, json, varchar, unique, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const communities = pgTable('communities', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    joinCode: varchar('join_code', { length: 50 }).notNull().unique(),
    communityType: varchar('community_type', { length: 50 }).notNull().default('default'),
    duesAmount: integer('dues_amount').notNull().default(0),
    duesPeriod: text('dues_period').notNull().default('monthly'),
    plan: text('plan').notNull().default('free'), // 'free' | 'community' | 'pro' | 'scale'
    planMemberLimit: integer('plan_member_limit').default(20),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    planExpiresAt: timestamp('plan_expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    supabaseId: text('supabase_id').notNull().unique(),
    // Legacy: kept for Stripe webhook compatibility; use community_members for active context
    communityId: integer('community_id').references(() => communities.id),
    role: text('role').notNull().default('member'),
    name: text('name').notNull(),
    email: text('email').notNull(),
    address: text('address'),
    phone: text('phone'),
    directoryOptIn: boolean('directory_opt_in').notNull().default(false),
    skills: text('skills').array(),
    individualPlan: text('individual_plan').default('free'), // 'free' | 'member_pro'
    individualPlanExpiresAt: timestamp('individual_plan_expires_at'),
    individualStripeSubscriptionId: text('individual_stripe_subscription_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Many-to-many: a user can belong to multiple communities with different roles
export const communityMembers = pgTable('community_members', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    communityId: integer('community_id').notNull().references(() => communities.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'), // 'admin' | 'member'
    duesPaid: boolean('dues_paid').notNull().default(false),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => ({
    uniq: unique().on(t.userId, t.communityId),
}));

export const announcements = pgTable('announcements', {
    id: serial('id').primaryKey(),
    communityId: integer('community_id').notNull().references(() => communities.id),
    authorId: integer('author_id').notNull().references(() => users.id),
    title: text('title').notNull(),
    body: text('body').notNull(),
    imageUrl: text('image_url'),
    isDraft: boolean('is_draft').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// simple direct messages between members. only the recipient should see each message.
export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    communityId: integer('community_id').notNull().references(() => communities.id),
    senderId: integer('sender_id').notNull().references(() => users.id),
    recipientId: integer('recipient_id').notNull().references(() => users.id),
    body: text('body').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const polls = pgTable('polls', {
    id: serial('id').primaryKey(),
    communityId: integer('community_id').notNull().references(() => communities.id),
    authorId: integer('author_id').notNull().references(() => users.id),
    question: text('question').notNull(),
    options: json('options').notNull(),
    endsAt: timestamp('ends_at'),
    announcementPosted: boolean('announcement_posted').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const votes = pgTable('votes', {
    id: serial('id').primaryKey(),
    pollId: integer('poll_id').notNull().references(() => polls.id),
    userId: integer('user_id').notNull().references(() => users.id),
    optionIndex: integer('option_index').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
    id: serial('id').primaryKey(),
    communityId: integer('community_id').notNull().references(() => communities.id),
    uploadedBy: integer('uploaded_by').notNull().references(() => users.id),
    name: text('name').notNull(),
    category: text('category').notNull().default('general'),
    fileUrl: text('file_url').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    communityId: integer('community_id').notNull().references(() => communities.id),
    name: text('name').notNull(),
    description: text('description'),
    location: text('location'),
    startsAt: timestamp('starts_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rsvps = pgTable('rsvps', {
    id: serial('id').primaryKey(),
    eventId: integer('event_id').notNull().references(() => events.id),
    userId: integer('user_id').notNull().references(() => users.id),
    response: text('response').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    communityId: integer('community_id').notNull().references(() => communities.id),
    amount: integer('amount').notNull(),
    stripeSessionId: text('stripe_session_id'),
    paidAt: timestamp('paid_at').defaultNow().notNull(),
});

export const communitiesRelations = relations(communities, ({ many }) => ({
    users: many(users),
    members: many(communityMembers),
    announcements: many(announcements),
    messages: many(messages),
    polls: many(polls),
    documents: many(documents),
    events: many(events),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    community: one(communities, {
        fields: [users.communityId],
        references: [communities.id],
    }),
    memberships: many(communityMembers),
    announcements: many(announcements),
    sentMessages: many(messages),
    receivedMessages: many(messages),
    votes: many(votes),
    uploadedDocuments: many(documents),
    rsvps: many(rsvps),
    payments: many(payments),
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
    user: one(users, {
        fields: [communityMembers.userId],
        references: [users.id],
    }),
    community: one(communities, {
        fields: [communityMembers.communityId],
        references: [communities.id],
    }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
    community: one(communities, {
        fields: [announcements.communityId],
        references: [communities.id],
    }),
    author: one(users, {
        fields: [announcements.authorId],
        references: [users.id],
    }),
}));

export const pollsRelations = relations(polls, ({ one, many }) => ({
    community: one(communities, {
        fields: [polls.communityId],
        references: [communities.id],
    }),
    author: one(users, {
        fields: [polls.authorId],
        references: [users.id],
    }),
    votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
    poll: one(polls, {
        fields: [votes.pollId],
        references: [polls.id],
    }),
    user: one(users, {
        fields: [votes.userId],
        references: [users.id],
    }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
    community: one(communities, {
        fields: [events.communityId],
        references: [communities.id],
    }),
    rsvps: many(rsvps),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
    event: one(events, {
        fields: [rsvps.eventId],
        references: [events.id],
    }),
    user: one(users, {
        fields: [rsvps.userId],
        references: [users.id],
    }),
}));

// Issues table
export const issues = pgTable('issues', {
    id: uuid('id').defaultRandom().primaryKey(),
    communityId: integer('community_id').references(() => communities.id).notNull(),
    reportedBy: integer('reported_by').references(() => users.id).notNull(),
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
    updatedBy: integer('updated_by').references(() => users.id).notNull(),
    previousStatus: text('previous_status'),
    newStatus: text('new_status').notNull(),
    note: text('note'), // optional admin note with each status change
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Vendors table
export const vendors = pgTable('vendors', {
    id: uuid('id').defaultRandom().primaryKey(),
    communityId: integer('community_id').references(() => communities.id).notNull(),
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
    ratedBy: integer('rated_by').references(() => users.id).notNull(),
    rating: integer('rating').notNull(), // 1-5
    comment: text('comment'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Notifications table
export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    type: text('type').notNull(), // 'welcome', etc.
    title: text('title').notNull(),
    body: text('body').notNull(),
    href: text('href'),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Help Board Requests
export const helpRequests = pgTable('help_requests', {
    id: uuid('id').defaultRandom().primaryKey(),
    communityId: integer('community_id').references(() => communities.id).notNull(),
    requestedBy: integer('requested_by').references(() => users.id).notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    tags: text('tags').array(),
    neededBy: timestamp('needed_by'),
    isResolved: boolean('is_resolved').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Help Board Offers
export const helpOffers = pgTable('help_offers', {
    id: uuid('id').defaultRandom().primaryKey(),
    requestId: uuid('request_id').references(() => helpRequests.id).notNull(),
    offeredBy: integer('offered_by').references(() => users.id).notNull(),
    message: text('message'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations for new tables
export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

export const helpRequestsRelations = relations(helpRequests, ({ one, many }) => ({
    community: one(communities, {
        fields: [helpRequests.communityId],
        references: [communities.id],
    }),
    requester: one(users, {
        fields: [helpRequests.requestedBy],
        references: [users.id],
    }),
    offers: many(helpOffers),
}));

export const helpOffersRelations = relations(helpOffers, ({ one }) => ({
    request: one(helpRequests, {
        fields: [helpOffers.requestId],
        references: [helpRequests.id],
    }),
    offerer: one(users, {
        fields: [helpOffers.offeredBy],
        references: [users.id],
    }),
}));


