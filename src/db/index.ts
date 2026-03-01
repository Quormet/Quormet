/**
 * Initializes the Drizzle ORM client with a Postgres connection string, exporting 
 * the 'db' instance for application-wide database operations.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/quormet';

/**
 * Singleton database client to prevent connection exhaustion in serverless or dev environments.
 */
declare global {
    // eslint-disable-next-line no-var
    var db: ReturnType<typeof drizzle> | undefined;
    // eslint-disable-next-line no-var
    var postgresClient: ReturnType<typeof postgres> | undefined;
}

const client = global.postgresClient || postgres(connectionString, { max: 1 });

if (process.env.NODE_ENV !== 'production') {
    global.postgresClient = client;
}

export const db = global.db || drizzle(client, { schema });

if (process.env.NODE_ENV !== 'production') {
    global.db = db;
}
