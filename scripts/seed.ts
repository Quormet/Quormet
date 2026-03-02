/**
 * Clean seed script — Maplewood HOA
 * Run with: npx tsx scripts/seed.ts
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import { eq } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const db = drizzle(client, { schema });

async function main() {
    console.log('🌱 Seeding Maplewood HOA data...');

    // Clear existing data (be careful in prod!)
    await db.delete(schema.payments);
    await db.delete(schema.rsvps);
    await db.delete(schema.votes);
    await db.delete(schema.announcements);
    await db.delete(schema.documents);
    await db.delete(schema.events);
    await db.delete(schema.polls);
    await db.delete(schema.helpOffers);
    await db.delete(schema.helpRequests);
    await db.delete(schema.notifications);
    await db.delete(schema.vendorRatings);
    await db.delete(schema.issueUpdates);
    await db.delete(schema.issues);
    await db.delete(schema.vendors);
    await db.delete(schema.messages);
    await db.delete(schema.communityMembers);
    await db.delete(schema.users);
    await db.delete(schema.communities);

    console.log('✅ Cleared old data');

    // Create community
    const [community] = await db.insert(schema.communities).values({
        name: 'Maplewood HOA',
        joinCode: 'MAPLE1',
        communityType: 'hoa',
        duesAmount: 15000, // $150.00 in cents
        duesPeriod: 'monthly',
        plan: 'pro',
        planMemberLimit: 150,
    }).returning();

    console.log('✅ Community created:', community.id);

    // Create users (supabase_id is a placeholder for seeding — link to real accounts in Supabase)
    const userSeed = [
        { name: 'Sarah Johnson', email: 'sarah@maplewood.com', role: 'admin', supabaseId: 'seed-admin-001' },
        { name: 'Mike Chen', email: 'mike@maplewood.com', role: 'member', supabaseId: 'seed-member-001' },
        { name: 'Tom Williams', email: 'tom@maplewood.com', role: 'member', supabaseId: 'seed-member-002' },
        { name: 'Anna Lee', email: 'anna@maplewood.com', role: 'member', supabaseId: 'seed-member-003' },
        { name: 'James Park', email: 'james@maplewood.com', role: 'member', supabaseId: 'seed-member-004' },
    ];

    const createdUsers = await db.insert(schema.users).values(
        userSeed.map(u => ({
            name: u.name,
            email: u.email,
            role: u.role,
            supabaseId: u.supabaseId,
            communityId: community.id,
        }))
    ).returning();

    // Create community memberships
    const [sarah, mike, tom, anna, james] = createdUsers;
    await db.insert(schema.communityMembers).values([
        { userId: sarah.id, communityId: community.id, role: 'admin', duesPaid: true },
        { userId: mike.id, communityId: community.id, role: 'member', duesPaid: true },
        { userId: tom.id, communityId: community.id, role: 'member', duesPaid: false },
        { userId: anna.id, communityId: community.id, role: 'member', duesPaid: true },
        { userId: james.id, communityId: community.id, role: 'member', duesPaid: false },
    ]);

    console.log('✅ Users created');

    // Create announcements
    const now = new Date();
    await db.insert(schema.announcements).values([
        {
            communityId: community.id,
            authorId: sarah.id,
            title: 'Annual Meeting Scheduled — February 28, 7pm at the Clubhouse',
            body: 'Please join us for the annual HOA meeting at the Maplewood Clubhouse. We\'ll review the 2026 budget, vote on landscaping proposals, and discuss the new gate system. All homeowners are encouraged to attend.',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            communityId: community.id,
            authorId: sarah.id,
            title: 'Water Shutoff Notice — Maintenance on Jan 20, 9am–12pm',
            body: 'The city has scheduled water maintenance in our area. Water service will be interrupted from 9am to noon on January 20th. Please plan accordingly and have water stored in advance.',
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
            communityId: community.id,
            authorId: sarah.id,
            title: 'Welcome to Quorify — Your community now has a home.',
            body: 'We\'re excited to announce that Maplewood HOA is now on Quorify. Use this platform to stay informed about announcements, vote on community decisions, and report issues. Your board is committed to making our community better together.',
            createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
        },
    ]);
    console.log('✅ Announcements created');

    // Create polls
    const closedDeadline = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const [activePoll, closedPoll] = await db.insert(schema.polls).values([
        {
            communityId: community.id,
            authorId: sarah.id,
            question: 'What color should we paint the clubhouse?',
            options: JSON.stringify(['Keep it white', 'Light grey', 'Warm beige']),
            endsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        {
            communityId: community.id,
            authorId: sarah.id,
            question: 'Should we add a second parking permit?',
            options: JSON.stringify(['Yes', 'No']),
            endsAt: closedDeadline,
        },
    ]).returning();

    // Add votes on active poll (6 votes, but not from sarah)
    await db.insert(schema.votes).values([
        { pollId: activePoll.id, userId: mike.id, optionIndex: 0 },
        { pollId: activePoll.id, userId: tom.id, optionIndex: 1 },
        { pollId: activePoll.id, userId: anna.id, optionIndex: 2 },
        { pollId: activePoll.id, userId: james.id, optionIndex: 0 },
    ]);

    // Add votes on closed poll (Yes won 8-3)
    await db.insert(schema.votes).values([
        { pollId: closedPoll.id, userId: sarah.id, optionIndex: 0 },
        { pollId: closedPoll.id, userId: mike.id, optionIndex: 0 },
        { pollId: closedPoll.id, userId: tom.id, optionIndex: 1 },
        { pollId: closedPoll.id, userId: anna.id, optionIndex: 0 },
        { pollId: closedPoll.id, userId: james.id, optionIndex: 0 },
    ]);
    console.log('✅ Polls and votes created');

    // Create events
    const [, blockParty] = await db.insert(schema.events).values([
        {
            communityId: community.id,
            name: 'HOA Monthly Meeting',
            description: 'Monthly board meeting covering budget, landscaping, and community updates.',
            location: 'Maplewood Clubhouse',
            startsAt: new Date('2026-02-28T19:00:00'),
        },
        {
            communityId: community.id,
            name: 'Spring Block Party',
            description: 'Join your neighbors for food, games, and community fun! Bring a dish to share.',
            location: 'Community Park',
            startsAt: new Date('2026-03-15T14:00:00'),
        },
    ]).returning();

    // Add 4 RSVPs to the monthly meeting (sarah, mike, anna, tom)
    await db.insert(schema.rsvps).values([
        { eventId: blockParty.id, userId: sarah.id, response: 'yes' },
    ]);
    console.log('✅ Events created');

    // Create documents
    await db.insert(schema.documents).values([
        {
            communityId: community.id,
            uploadedBy: sarah.id,
            name: 'Maplewood HOA Bylaws v2.1',
            category: 'bylaws',
            fileUrl: 'https://drive.google.com/file/d/example-bylaws',
        },
        {
            communityId: community.id,
            uploadedBy: sarah.id,
            name: 'January 2026 Meeting Minutes',
            category: 'minutes',
            fileUrl: 'https://drive.google.com/file/d/example-minutes',
        },
        {
            communityId: community.id,
            uploadedBy: sarah.id,
            name: '2026 Annual Budget',
            category: 'financial',
            fileUrl: 'https://drive.google.com/file/d/example-budget',
        },
    ]);
    console.log('✅ Documents created');

    // Create issues
    const [brokenGate, parkingLight] = await db.insert(schema.issues).values([
        {
            communityId: community.id,
            reportedBy: mike.id,
            title: 'Broken gate latch — Building A entrance',
            description: 'The gate latch on the Building A entrance has been broken for a week. It won\'t lock properly, leaving the building unsecured at night.',
            category: 'maintenance',
            location: 'Building A entrance gate',
            status: 'board_review',
        },
        {
            communityId: community.id,
            reportedBy: anna.id,
            title: 'Parking lot light out — Spot 24',
            description: 'The overhead light near parking spot 24 has been out for 3 days. That area of the lot is completely dark at night.',
            category: 'safety',
            location: 'Parking lot, spot 24',
            status: 'in_progress',
        },
        {
            communityId: community.id,
            reportedBy: tom.id,
            title: 'Graffiti on east wall',
            description: 'There is graffiti on the east-facing perimeter wall near the main entrance. Approximately 4 feet wide.',
            category: 'maintenance',
            location: 'East perimeter wall, main entrance',
            status: 'resolved',
        },
    ]).returning();
    console.log('✅ Issues created');

    // Create Vendors
    const [landscaper, electrician] = await db.insert(schema.vendors).values([
        {
            communityId: community.id,
            name: 'Green Thumb Landscaping',
            categories: ['maintenance', 'landscaping'],
            phone: '555-0101',
            email: 'contact@greenthumb.com',
        },
        {
            communityId: community.id,
            name: 'Bright Spark Electric',
            categories: ['electrical', 'safety'],
            phone: '555-0102',
            email: 'service@brightspark.com',
        },
    ]).returning();
    console.log('✅ Vendors created');

    // Create Help Board Requests
    const [dogWalking, ladderHelp] = await db.insert(schema.helpRequests).values([
        {
            communityId: community.id,
            requestedBy: mike.id,
            title: 'Dog walking help',
            description: 'Looking for someone to walk my dog this Tuesday while I\'m at work.',
            tags: ['pets', 'outdoor'],
            neededBy: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        },
        {
            communityId: community.id,
            requestedBy: anna.id,
            title: 'Need a tall ladder',
            description: 'Can I borrow a tall ladder to clean my gutters this weekend?',
            tags: ['tools', 'maintenance'],
            neededBy: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        },
    ]).returning();
    console.log('✅ Help requests created');

    // Create Help Board Offers
    await db.insert(schema.helpOffers).values([
        {
            requestId: dogWalking.id,
            offeredBy: tom.id,
            message: 'I can help with that! I already walk mine around noon.',
        },
    ]);
    console.log('✅ Help offers created');

    // Create Messages (unread test)
    await db.insert(schema.messages).values([
        {
            communityId: community.id,
            senderId: mike.id,
            recipientId: sarah.id,
            body: 'Hi Sarah, can we talk about the Building A gate?',
            isRead: false,
        },
        {
            communityId: community.id,
            senderId: anna.id,
            recipientId: sarah.id,
            body: 'Hey, I reported the parking light issue.',
            isRead: false,
        },
        {
            communityId: community.id,
            senderId: sarah.id,
            recipientId: mike.id,
            body: 'Sure Mike, I saw your report. Let\'s discuss.',
            isRead: true,
        },
    ]);
    console.log('✅ Messages created');

    // Create payments (Mike and Anna paid, Tom and James didn't)
    const janPaid = new Date('2026-01-15T10:00:00');
    const janPaid2 = new Date('2026-01-08T09:00:00');
    await db.insert(schema.payments).values([
        {
            userId: mike.id,
            communityId: community.id,
            amount: 15000,
            stripeSessionId: 'stripe_session_mike',
            paidAt: janPaid,
        },
        {
            userId: anna.id,
            communityId: community.id,
            amount: 15000,
            stripeSessionId: 'stripe_session_anna',
            paidAt: janPaid2,
        },
    ]);
    console.log('✅ Payments created');

    console.log('\n🎉 Seed complete! Initial credentials:');
    console.log('   Admin:   sarah@maplewood.com (supabaseId: seed-admin-001)');
    console.log('   Members: mike, tom, anna, james @maplewood.com');
    console.log('   Join code: MAPLE1');
    await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
