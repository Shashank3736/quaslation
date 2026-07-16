import postgres from 'postgres';
import * as schema from "./schema";
import * as relation from "./relations";
import { drizzle } from 'drizzle-orm/postgres-js';

const connectionString = process.env.POSTGRES_URL || process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error('Missing database connection string. Set POSTGRES_URL or DIRECT_URL in your environment.');
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema: { ...schema, ...relation } });