import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Offline fallback: if no DATABASE_URL, export undefined placeholders.
// This allows the server to run in offline mode without DB access.
let pool: any = undefined;
let db: any = undefined;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  // eslint-disable-next-line no-console
  console.warn("Running in offline mode: DATABASE_URL is not set.");
}

export { pool, db };
