import { defineConfig } from "drizzle-kit";

// Parse the DATABASE_URL
const url = new URL(process.env.DATABASE_URL!);

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: {
      rejectUnauthorized: true,
    },
  },
  verbose: true,
  strict: true,
});