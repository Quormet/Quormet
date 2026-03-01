import { getCurrentUser } from '@/utils/getCurrentUser'
import { db } from '@/db'
import { communities } from '@/db/schema'
import { eq } from 'drizzle-orm'

export type Plan = 'free' | 'community' | 'pro' | 'scale'
export type IndividualPlan = 'free' | 'member_pro'

const PLAN_RANK: Record<Plan, number> = {
    free: 0,
    community: 1,
    pro: 2,
    scale: 3,
}

export async function getPlanAccess() {
    const user = await getCurrentUser()
    if (!user || user.communityId == null) return null

    const [community] = await db.select().from(communities)
        .where(eq(communities.id, user.communityId))

    const communityPlan = (community?.plan as Plan) ?? 'free'
    const individualPlan = (user.individualPlan as IndividualPlan) ?? 'free'
    const hasMemberPro = individualPlan === 'member_pro'
    const isAdmin = user.role === 'admin'

    function communityAtLeast(plan: Plan): boolean {
        return PLAN_RANK[communityPlan] >= PLAN_RANK[plan]
    }

    return {
        // Community plan checks
        isFree: communityPlan === 'free',
        isCommunity: communityAtLeast('community'),
        isPro: communityAtLeast('pro'),
        isScale: communityAtLeast('scale'),

        // Individual plan
        hasMemberPro,

        // Feature access — combine community + individual plans
        canUseAI: communityAtLeast('community') || hasMemberPro,
        canSearchDocuments: communityAtLeast('community') || hasMemberPro,
        canSeeQuorumBar: communityAtLeast('community') || hasMemberPro,
        canSeePersonalTodos: communityAtLeast('community') || hasMemberPro,
        canPostPaidGigs: communityAtLeast('community') || hasMemberPro,
        canSeeSkillMatching: communityAtLeast('pro') || hasMemberPro,
        canSeeHealthScore: communityAtLeast('pro') && isAdmin,
        canSeeIntelligenceFeed: communityAtLeast('pro') && isAdmin,
        canUseAutomation: communityAtLeast('pro') && isAdmin,
        canManageDues: communityAtLeast('community') && isAdmin,
        canManageDocuments: communityAtLeast('community') && isAdmin,
        canAssignVendors: communityAtLeast('community') && isAdmin,

        // Raw values for UI
        communityPlan,
        individualPlan,
        isAdmin,
        communityMemberLimit: community?.planMemberLimit ?? 20,
    }
}
