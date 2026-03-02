/**
 * Initializes the Drizzle ORM client with a Postgres connection string, exporting
 * the 'db' instance for application-wide database operations.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Cache the database connection in development. This avoids creating a new connection on every HMR update.
const globalForDb = globalThis as unknown as {
    conn: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.conn ?? postgres(connectionString, {
    max: 5,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: 'require',
});

if (process.env.NODE_ENV !== 'production') globalForDb.conn = client;

export const db = drizzle(client, { schema });
