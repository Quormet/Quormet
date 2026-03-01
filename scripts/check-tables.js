require('dotenv').config({ path: '.env' });
const postgres = require('postgres');

async function check() {
    const url = process.env.DATABASE_URL;
    console.log('Connecting to:', url);
    const sql = postgres(url, { max: 1, prepare: false });

    try {
        const result = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `;
        console.log('Tables in public schema:', result.map(r => r.table_name));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sql.end();
    }
}

check();
