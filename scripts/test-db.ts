import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
console.log('Connecting to:', connectionString.replace(/:([^@:]+)@/, ':***@'))

const client = postgres(connectionString, { max: 1, prepare: false, connect_timeout: 10 })
const db = drizzle(client)

try {
    const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`)
    console.log('Tables in public schema:')
    for (const row of result) {
        console.log(' -', row.table_name)
    }

    // Try the exact query that's failing
    const userResult = await db.execute(sql`SELECT id, supabase_id FROM users LIMIT 3`)
    console.log('\nSample users:')
    console.log(JSON.stringify(userResult, null, 2))
} catch (err: any) {
    console.error('Error:', err.message)
    if (err.code) console.error('PG Code:', err.code)
    if (err.detail) console.error('Detail:', err.detail)
} finally {
    await client.end()
}
