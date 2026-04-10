import pkg from 'pg'
const { Pool } = pkg

// Pool is only created when DATABASE_URL is present.
// barcode.js uses pool.query(...).catch(() => {}) so missing DB is fire-and-forget safe.
export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : { query: () => Promise.reject(new Error('DATABASE_URL not configured')) }
