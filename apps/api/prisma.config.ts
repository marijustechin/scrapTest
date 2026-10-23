import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // process.env (not env()) so `prisma generate` still works without a database,
    // e.g. in CI where only type-checking runs.
    url: process.env.DATABASE_URL ?? '',
  },
});
