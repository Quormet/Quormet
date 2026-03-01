import { config } from "dotenv";
config({ path: ".env" });
import { db } from "./index";
import { communities, users, announcements, events, documents, polls, payments, rsvps, votes, vendors, issues, issueUpdates, helpRequests } from "./schema";
import { addDays, subDays } from "date-fns";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Seeding database...");

    // Clear existing data
    console.log("Clearing existing data...");
    await db.execute("TRUNCATE TABLE communities CASCADE;");

    // 1. Create a Community
    console.log("Creating community...");
    const [community] = await db.insert(communities).values({
        name: "Maplewood HOA",
        joinCode: "MAPLE123",
        duesAmount: 5000, // $50.00
        duesPeriod: "monthly"
    }).returning();

    // 2. Create Users
    console.log("Creating users...");
    const [adminUser] = await db.insert(users).values({
        supabaseId: "mock-supabase-id-admin", // Replace with actual if needed
        email: "admin@maplewood.com",
        name: "Sarah Admin",
        role: "admin",
        communityId: community.id,
        phone: "555-0100",
        address: "100 Maplewood Dr",
        directoryOptIn: true,
    }).returning();

    const [member1] = await db.insert(users).values({
        supabaseId: "mock-supabase-id-member-1",
        email: "john@example.com",
        name: "John Member",
        role: "member",
        communityId: community.id,
        phone: "555-0101",
        address: "101 Maplewood Dr",
        directoryOptIn: true,
    }).returning();

    const [member2] = await db.insert(users).values({
        supabaseId: "mock-supabase-id-member-2",
        email: "jane@example.com",
        name: "Jane Doe",
        role: "member",
        communityId: community.id,
        phone: null,
        address: "102 Maplewood Dr",
        directoryOptIn: false,
    }).returning();


    // 3. Create Announcements
    console.log("Creating announcements...");
    await db.insert(announcements).values([
        {
            communityId: community.id,
            authorId: adminUser.id,
            title: "Annual Block Party!",
            body: "Join us this Saturday for the annual block party. Food, drinks, and games for everyone!",
        },
        {
            communityId: community.id,
            authorId: adminUser.id,
            title: "Pool Maintenance Notice",
            body: "The community pool will be closed on Tuesday for regular maintenance.",
        }
    ]);

    // 4. Create Events
    console.log("Creating events...");
    await db.insert(events).values([
        {
            communityId: community.id,
            name: "HOA Board Meeting",
            description: "Monthly board meeting to discuss budget and upcoming projects.",
            startsAt: addDays(new Date(), 5),
            location: "Community Center",
        },
        {
            communityId: community.id,
            name: "Summer BBQ",
            description: "Grab a burger and meet your fellow members!",
            startsAt: addDays(new Date(), 14),
            location: "Main Park",
        }
    ]);

    // 5. Create Documents
    console.log("Creating documents...");
    await db.insert(documents).values([
        {
            communityId: community.id,
            uploadedBy: adminUser.id,
            name: "Community Guidelines 2024",
            fileUrl: "https://example.com/guidelines.pdf",
            category: "Guidelines",
        },
        {
            communityId: community.id,
            uploadedBy: adminUser.id,
            name: "Q1 Financial Report",
            fileUrl: "https://example.com/financials.pdf",
            category: "Financials",
        },
        {
            communityId: community.id,
            uploadedBy: adminUser.id,
            name: "Meeting Minutes - Jan",
            fileUrl: "https://example.com/minutes.pdf",
            category: "Meeting Minutes",
        }
    ]);

    // 6. Create Polls
    console.log("Creating polls...");
    await db.insert(polls).values({
        communityId: community.id,
        authorId: adminUser.id,
        question: "Should we hire a new landscaping company?",
        endsAt: addDays(new Date(), 3),
        options: [
            { id: "1", text: "Yes, the current one is bad" },
            { id: "2", text: "No, they're affordable" },
            { id: "3", text: "Need more information" }
        ],
    });

    await db.insert(polls).values({
        communityId: community.id,
        authorId: adminUser.id,
        question: "What color should we paint the clubhouse?",
        endsAt: subDays(new Date(), 1), // Completed poll
        options: [
            { id: "1", text: "Blue" },
            { id: "2", text: "Green" },
            { id: "3", text: "White" }
        ]
    });

    // 7. Create Vendors
    console.log("Creating vendors...");
    const [vendor1] = await db.insert(vendors).values({
        communityId: community.id,
        name: 'ABC Gate Repair',
        categories: ['maintenance', 'security'],
        phone: '(303) 555-0120',
        email: 'contact@abcgate.com',
    }).returning();

    const [vendor2] = await db.insert(vendors).values({
        communityId: community.id,
        name: "Bob's Electric",
        categories: ['electrical'],
        phone: '(303) 555-0145',
    }).returning();

    // 8. Create Issues
    console.log("Creating issues...");
    const [issue1] = await db.insert(issues).values({
        communityId: community.id,
        reportedBy: member1.id,
        title: 'Broken gate latch — Building A entrance',
        description: 'The latch on the main entrance gate is broken. The gate swings open freely.',
        category: 'maintenance',
        location: 'Building A main entrance',
        status: 'board_review',
    }).returning();

    const [issue2] = await db.insert(issues).values({
        communityId: community.id,
        reportedBy: member2.id,
        title: 'Parking lot light out — Spot 24',
        description: 'The overhead light near spot 24 has been out for a week. Safety concern at night.',
        category: 'safety',
        location: 'Parking lot, spot 24',
        status: 'in_progress',
        assignedVendorId: vendor2.id,
    }).returning();

    const [issue3] = await db.insert(issues).values({
        communityId: community.id,
        reportedBy: member1.id,
        title: 'Graffiti on east wall',
        description: 'Graffiti appeared overnight on the east perimeter wall near the mailboxes.',
        category: 'maintenance',
        location: 'East perimeter wall',
        status: 'resolved',
        assignedVendorId: vendor1.id,
    }).returning();

    // 9. Create Issue Updates
    console.log("Creating issue updates...");
    await db.insert(issueUpdates).values([
        { issueId: issue1.id, updatedBy: adminUser.id, previousStatus: null, newStatus: 'submitted', note: 'Issue received.' },
        { issueId: issue1.id, updatedBy: adminUser.id, previousStatus: 'submitted', newStatus: 'board_review', note: 'Getting quotes from vendors.' },
        { issueId: issue2.id, updatedBy: adminUser.id, previousStatus: null, newStatus: 'submitted', note: 'Issue received.' },
        { issueId: issue2.id, updatedBy: adminUser.id, previousStatus: 'submitted', newStatus: 'board_review', note: null },
        { issueId: issue2.id, updatedBy: adminUser.id, previousStatus: 'board_review', newStatus: 'vendor_assigned', note: "Bob's Electric assigned." },
        { issueId: issue2.id, updatedBy: adminUser.id, previousStatus: 'vendor_assigned', newStatus: 'in_progress', note: 'Electrician on site today.' },
        { issueId: issue3.id, updatedBy: adminUser.id, previousStatus: null, newStatus: 'submitted', note: 'Issue received.' },
        { issueId: issue3.id, updatedBy: adminUser.id, previousStatus: 'submitted', newStatus: 'resolved', note: 'Wall cleaned and repainted.' },
    ]);

    // 10. Create Help Requests
    console.log("Creating help requests...");
    await db.insert(helpRequests).values([
        {
            communityId: community.id,
            requestedBy: member1.id,
            title: 'Need help moving furniture',
            description: 'Looking for 2-3 people to help move a couch upstairs. Will provide pizza!',
            tags: ['moving', 'furniture'],
            neededBy: new Date('2026-03-15T14:00:00'),
        },
        {
            communityId: community.id,
            requestedBy: member2.id,
            title: 'Anyone have a ladder I can borrow?',
            description: 'Need a 6ft ladder for a weekend project.',
            tags: ['tools', 'borrow'],
        },
        {
            communityId: community.id,
            requestedBy: adminUser.id,
            title: 'Dog sitter needed March 10-12',
            description: 'Need someone to watch my golden retriever for a long weekend.',
            tags: ['dog sitter', 'pets'],
            neededBy: new Date('2026-03-10T00:00:00'),
        },
    ]);

    console.log("Database seeded successfully!");
    process.exit(0);
}

main().catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
});
