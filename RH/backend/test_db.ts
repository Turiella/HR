import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT 1 as result');
    console.log('DB connection successful:', res.rows[0]);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
};

testConnection();
