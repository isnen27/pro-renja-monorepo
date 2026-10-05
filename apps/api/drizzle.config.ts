// drizzle.config.ts
// Drizzle ORM Configuration for PostgreSQL

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pro_renja_db',
  },
  verbose: true,
  strict: true,
});
