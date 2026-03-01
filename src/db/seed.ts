import { config } from "dotenv";
config({ path: ".env" });
import { db } from "./index";
import { communities, users, announcements, events, documents, polls, payments, rsvps, votes } from "./schema";
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
            description: "Grab a burger and meet your neighbors!",
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

    console.log("Database seeded successfully!");
    process.exit(0);
}

main().catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
});
