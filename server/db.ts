import pg from "pg"; // Importuj celý 'pg' modul
const { Pool } = pg; // Potom extrahuj 'Pool' z neho
import { drizzle } from "drizzle-orm/node-postgres"; // Adapter for 'node-postgres'
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Use standard Pool from 'pg'
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Use drizzle adapter for node-postgres
export const db = drizzle(pool, { schema });
