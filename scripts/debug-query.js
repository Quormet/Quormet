const { config } = require("dotenv");
config({ path: ".env" });
const postgres = require('postgres');

async function debug() {
    const url = process.env.DATABASE_URL;
    console.log('Connecting to:', url);

    // Test with the same settings as the app
    const sql = postgres(url, { max: 1, prepare: false });

    try {
        console.log('Running query...');
        // Match the user's failed query exactly
        // We'll use a dummy ID just to see if the query structure works
        const result = await sql`
            select "id", "supabase_id", "community_id", "role", "name", "email", "address", "phone", "directory_opt_in", "dues_paid", "created_at" 
            from "users" 
            where "users"."supabase_id" = ${'0f563231-3f03-47f8-97c4-b24c77eef478'} 
            limit 1
        `;
        console.log('Success!', result);
    } catch (err) {
        console.error('FULL ERROR REPORT:');
        console.error('Message:', err.message);
        console.error('Detail:', err.detail);
        console.error('Hint:', err.hint);
        console.error('Code:', err.code);
        console.error('Entire error:', err);
    } finally {
        await sql.end();
    }
}

debug();
