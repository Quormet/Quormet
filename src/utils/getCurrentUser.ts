import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    try {
        const [dbUser] = await db.select().from(users).where(eq(users.supabaseId, user.id))
        return dbUser ?? null
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
