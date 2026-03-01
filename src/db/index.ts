/**
 * Initializes the Drizzle ORM client with a Postgres connection string, exporting 
 * the 'db' instance for application-wide database operations.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const getConnectionString = () => {
    return process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/quormet';
};

/**
 * Singleton database client to prevent connection exhaustion in serverless or dev environments.
 */
declare global {
    // eslint-disable-next-line no-var
    var dbInstance: ReturnType<typeof drizzle> | undefined;
    // eslint-disable-next-line no-var
    var pgClient: ReturnType<typeof postgres> | undefined;
}

if (!global.pgClient) {
    const url = getConnectionString();
    console.log('--- DB INIT ---');
    console.log('URL Host:', url.split('@')[1]?.split('/')[0]?.split('?')[0] || 'local');

    global.pgClient = postgres(url, {
        max: 1,
        prepare: false,
        idle_timeout: 20,
        connect_timeout: 10,
    });
}

export const db = global.dbInstance || drizzle(global.pgClient, { schema });

if (process.env.NODE_ENV !== 'production') {
    global.dbInstance = db;
}
