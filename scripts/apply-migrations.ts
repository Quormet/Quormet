import 'dotenv/config';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function migrate() {
    const drizzleDir = path.join(process.cwd(), 'drizzle');
    const files = fs.readdirSync(drizzleDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    console.log(`Found ${files.length} migration files.`);

    for (const file of files) {
        console.log(`Applying ${file}...`);
        const content = fs.readFileSync(path.join(drizzleDir, file), 'utf8');
        try {
            // Split content into individual statements if necessary, 
            // but postgres-js can handle multiple statements if they are separated by semicolons.
            await sql.unsafe(content);
            console.log(`✅ Applied ${file}`);
        } catch (err: any) {
            console.error(`❌ Failed to apply ${file}:`, err.message);
        }
    }

    await sql.end();
}

migrate();
