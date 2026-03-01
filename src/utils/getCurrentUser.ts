import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { users, communityMembers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    try {
        const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id))
        if (!dbUser) return null

        // Determine the active community from cookie or first membership
        const cookieStore = await cookies()
        const activeCommunityIdCookie = cookieStore.get('quormet_active_community')?.value

        // Fetch all memberships for this user
        const memberships = await db
            .select()
            .from(communityMembers)
            .where(eq(communityMembers.userId, dbUser.id))

        if (memberships.length === 0) {
            // Fall back to legacy communityId if no memberships yet (migration edge case)
            return {
                ...dbUser,
                duesPaid: false,
                memberships: [],
            }
        }

        // Determine activeCommunityId: prefer cookie, else first membership
        let activeMembership = memberships.find(
            m => m.communityId === parseInt(activeCommunityIdCookie || '')
        ) ?? memberships[0]

        return {
            ...dbUser,
            communityId: activeMembership.communityId,
            role: activeMembership.role,
            duesPaid: activeMembership.duesPaid,
            memberships,
        }
    } catch (err: any) {
        console.error('=== DB QUERY ERROR in getCurrentUser ===')
        console.error('Message:', err.message)
        console.error('Code:', err.code)
        console.error('Detail:', err.detail)
        console.error('Hint:', err.hint)
        console.error('Schema:', err.schema)
        console.error('Table:', err.table)
        console.error('========================================')
        throw err
    }
}
