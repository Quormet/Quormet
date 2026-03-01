require('dotenv').config({ path: '.env' });
const postgres = require('postgres');

async function test() {
    console.log("URL:", process.env.DATABASE_URL);
    const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
    try {
        const result = await sql`select 1 as x`;
        console.log("Success:", result);
    } catch (e) {
        console.log("Error details:", JSON.stringify(e, null, 2));
        console.log("Error message:", e.message);
    } finally {
        await sql.end();
    }
}
test();
