import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function audit() {
    const tablesToCheck = [
        'vendors',
        'issues',
        'issue_updates',
        'vendor_ratings',
        'notifications',
        'help_requests',
        'help_offers'
    ];

    const columnChecks = [
        { table: 'announcements', column: 'is_draft' },
        { table: 'messages', column: 'is_read' },
        { table: 'communities', column: 'community_type' },
        { table: 'communities', column: 'plan' },
        { table: 'users', column: 'individual_plan' }
    ];

    const typeChecks = [
        { table: 'users', column: 'id' },
        { table: 'users', column: 'supabase_id' },
        { table: 'community_members', column: 'user_id' },
        { table: 'community_members', column: 'community_id' }
    ];

    try {
        console.log('--- Table Check ---');
        const dbTables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        const tableNames = dbTables.map(t => t.table_name);

        for (const table of tablesToCheck) {
            if (tableNames.includes(table)) {
                console.log(`✅ Table "${table}" exists.`);
            } else {
                console.log(`❌ Table "${table}" is MISSING.`);
            }
        }

        console.log('\n--- Column Check ---');
        for (const check of columnChecks) {
            const columns = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = ${check.table} AND column_name = ${check.column}
            `;
            if (columns.length > 0) {
                console.log(`✅ Column "${check.table}.${check.column}" exists.`);
            } else {
                console.log(`❌ Column "${check.table}.${check.column}" is MISSING.`);
            }
        }

        console.log('\n--- Data Type Check ---');
        for (const check of typeChecks) {
            const dtype = await sql`
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = ${check.table} AND column_name = ${check.column}
            `;
            if (dtype.length > 0) {
                console.log(`✅ Column "${check.table}.${check.column}" is of type "${dtype[0].data_type}".`);
            } else {
                console.log(`❌ Column "${check.table}.${check.column}" NOT FOUND.`);
            }
        }

    } catch (err: any) {
        console.error('Audit failed:', err.message);
    } finally {
        await sql.end();
    }
}

audit();
