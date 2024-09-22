import { sql } from '@vercel/postgres';
import * as schema from "./schema";
import * as relation from "./relations";
import { drizzle } from 'drizzle-orm/vercel-postgres';

export const db = drizzle(sql, { schema: { ...schema, ...relation } });