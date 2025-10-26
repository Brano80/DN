// test-db.ts
import pkg from 'pg';
const { Pool } = pkg;
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, './.env') }); // Load .env from current dir

const testConnection = async () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env file!');
    return;
  }

  console.log('Attempting to connect with URL:', connectionString);

  const pool = new Pool({ connectionString });

  try {
    // Try to connect and run a simple query
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    const res = await client.query('SELECT NOW()');
    console.log('🕒 Current database time:', res.rows[0].now);
    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error('❌ Database connection error:', err);
  } finally {
    await pool.end(); // Close all connections in the pool
    console.log('Connection pool closed.');
  }
};

testConnection();