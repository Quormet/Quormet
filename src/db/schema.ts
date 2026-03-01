/**
 * Defines the database schema using Drizzle ORM, including tables for communities, users, 
 * announcements, polls, votes, documents, events, RSVPs, and payments, along with their 
 * relational mappings.
 */
import { pgTable, serial, text, timestamp, boolean, integer, json, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const communities = pgTable('communities', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    joinCode: varchar('join_code', { length: 50 }).notNull().unique(),
    duesAmount: integer('dues_amount').notNull().default(0), 
    duesPeriod: text('dues_period').notNull().default('monthly'), 
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    supabaseId: text('supabase_id').notNull().unique(),
    communityId: integer('community_id').references(() => communities.id),
    role: text('role').notNull().default('member'), 
    name: text('name').notNull(),
    email: text('email').notNull(),
    address: text('address'),
    phone: text('phone'),
    directoryOptIn: boolean('directory_opt_in').notNull().default(false),
    duesPaid: boolean('dues_paid').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const announcements = pgTable('announcements', {
    id: serial('id').primaryKey(),
    communityId: integer('community_id').notNull().references(() => communities.id),
    authorId: integer('author_id').notNull().references(() => users.id),
    title: text('title').notNull(),
    body: text('body').notNull(),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const polls = pgTable('polls', {
    id: serial('id').primaryKey(),
    communityId: integer('community_id').notNull().references(() => communities.id),
    authorId: integer('author_id').notNull().references(() => users.id),
    question: text('question').notNull(),
    options: json('options').notNull(), 
    endsAt: timestamp('ends_at'),
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
    announcements: many(announcements),
    polls: many(polls),
    documents: many(documents),
    events: many(events),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    community: one(communities, {
        fields: [users.communityId],
        references: [communities.id],
    }),
    announcements: many(announcements),
    votes: many(votes),
    uploadedDocuments: many(documents),
    rsvps: many(rsvps),
    payments: many(payments),
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
