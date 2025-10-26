// server/migrate.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg'; // Fix 1: Default import for pg
const { Pool } = pkg; // Fix 1: Extract Pool
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; // Fix 2: Import for ES Module path

// Fix 2: Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file located in the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Fix 2: Use correct path

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set in .env file.');
  }

  console.log('Connecting to database for migration...');
  // --- ADD THIS DEBUG LINE ---
  console.log('DEBUG: Using DATABASE_URL:', process.env.DATABASE_URL);
  // --- END DEBUG LINE ---

  // Use Pool for migrations, Client might cause issues
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Applying migrations from ./migrations folder...');
  try {
    // Path to the folder where drizzle-kit saves migrations (from drizzle.config.ts)
    await migrate(db, { migrationsFolder: path.resolve(__dirname, '../migrations') }); // Fix 2: Use correct path
    console.log('Migrations applied successfully! ✅');
  } catch (error) {
    console.error('❌ Error applying migrations:', error);
    process.exit(1); // Exit with error code
  } finally {
    console.log('Closing database connection...');
    await pool.end(); // Important to close the pool
  }
};

runMigrations();