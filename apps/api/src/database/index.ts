// src/database/index.ts
// PostgreSQL Database Connection Configuration using Drizzle ORM

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

// Environment-based configuration
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pro_renja_db';

const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export schema for use in migrations and queries
export * from './schema.js';

// Database connection info
export const dbInfo = {
  url: databaseUrl,
  status: 'connected' as const,
};
