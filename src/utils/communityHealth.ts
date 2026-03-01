import { db } from "@/db";
import { polls, votes, payments, issues, announcements, users, communityMembers } from "@/db/schema";
import { eq, count, and, desc, sql, gte } from "drizzle-orm";

async function getPollParticipationRate(communityId: number): Promise<number> {
    // Get the most recent poll for the community
    const [recentPoll] = await db.select()
        .from(polls)
        .where(eq(polls.communityId, communityId))
        .orderBy(desc(polls.createdAt))
        .limit(1);

    if (!recentPoll) return 15; // default if no polls exist

    // Get total members in the community
    const members = await db.select({ count: count() }).from(communityMembers).where(eq(communityMembers.communityId, communityId));
    const totalMembers = members[0]?.count || 1;

    // Get votes for this poll
    const pollVotes = await db.select({ count: count() }).from(votes).where(eq(votes.pollId, recentPoll.id));
    const totalVotes = pollVotes[0]?.count || 0;

    const rate = totalVotes / totalMembers;

    // Scale to 25 points based on 50%+ participation being ideal
    if (rate >= 0.5) return 25;
    if (rate >= 0.25) return 15;
    if (rate > 0) return 10;
    return 5;
}

async function getDuesCollectionRate(communityId: number): Promise<number> {
    const members = await db.select({ count: count() }).from(communityMembers).where(eq(communityMembers.communityId, communityId));
    const totalMembers = members[0]?.count || 1;

    const paidMembers = await db.select({ count: count() }).from(communityMembers).where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.duesPaid, true)));
    const totalPaid = paidMembers[0]?.count || 0;

    const rate = totalPaid / totalMembers;

    // Scale to 25 points
    if (rate >= 0.9) return 25;
    if (rate >= 0.7) return 15;
    if (rate >= 0.5) return 10;
    return 5;
}

async function getIssueResolutionRate(communityId: number): Promise<number> {
    const communityIssues = await db.select({ count: count() }).from(issues).where(eq(issues.communityId, communityId));
    const totalIssues = communityIssues[0]?.count || 0;

    if (totalIssues === 0) return 25; // Good standing if no issues

    const resolvedIssuesQuery = await db.select({ count: count() }).from(issues).where(and(eq(issues.communityId, communityId), eq(issues.status, 'resolved')));
    const resolvedIssues = resolvedIssuesQuery[0]?.count || 0;

    const rate = resolvedIssues / totalIssues;

    // Scale to 25 points
    if (rate >= 0.8) return 25;
    if (rate >= 0.5) return 15;
    if (rate > 0.2) return 10;
    return 5;
}

async function getCommunicationScore(communityId: number): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAnnouncements = await db.select({ count: count() })
        .from(announcements)
        .where(and(
            eq(announcements.communityId, communityId),
            gte(announcements.createdAt, thirtyDaysAgo)
        ));

    const totalRecent = recentAnnouncements[0]?.count || 0;

    // Scale to 25 points
    if (totalRecent >= 2) return 25;
    if (totalRecent === 1) return 15;
    return 5;
}

export async function getCommunityHealth(communityId: number): Promise<{
    score: number;
    label: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
    insight: string;
    color: string;
}> {
    const [pollParticipation, duesRate, issueResolution, communicationFrequency] =
        await Promise.all([
            getPollParticipationRate(communityId),   // 0-25
            getDuesCollectionRate(communityId),       // 0-25
            getIssueResolutionRate(communityId),      // 0-25
            getCommunicationScore(communityId),       // 0-25
        ]);

    const score = pollParticipation + duesRate + issueResolution + communicationFrequency;

    if (score >= 85) {
        return {
            score, label: 'Excellent', color: 'text-green-500',
            insight: 'Your community is thriving.'
        };
    }
    if (score >= 65) {
        return {
            score, label: 'Good', color: 'text-blue-500',
            insight: 'A few things could use attention.'
        };
    }
    if (score >= 40) {
        return {
            score, label: 'Needs Attention', color: 'text-yellow-500',
            insight: 'Several areas need improvement.'
        };
    }
    return {
        score, label: 'Critical', color: 'text-red-500',
        insight: 'Your community needs immediate attention.'
    };
}
