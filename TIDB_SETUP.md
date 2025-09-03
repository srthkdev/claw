# TiDB Setup Guide

This guide will help you set up TiDB Serverless for use with this application.

## What is TiDB?

TiDB is an open-source, distributed SQL database that supports Hybrid Transactional and Analytical Processing (HTAP) workloads. TiDB Serverless provides a fully managed database service that's perfect for modern applications.

## Prerequisites

1. A TiDB Cloud account (sign up at https://tidbcloud.com/)
2. Basic understanding of SQL and database concepts

## Setting up TiDB Serverless

### 1. Create a TiDB Cloud Account

1. Visit [https://tidbcloud.com/](https://tidbcloud.com/)
2. Click "Sign Up" and follow the registration process
3. Verify your email address

### 2. Create a Serverless Cluster

1. Log in to your TiDB Cloud account
2. Click "Create Cluster"
3. Select "Serverless Tier" (free tier available)
4. Choose a cloud provider and region
5. Give your cluster a name
6. Click "Create"

### 3. Configure Your Cluster

1. Wait for your cluster to be provisioned (usually takes 2-3 minutes)
2. Once ready, click "Connect" on your cluster
3. Note down the following connection details:
   - Host
   - Port
   - Username
   - Password
   - Database name

### 4. Update Environment Variables

Add the following to your `.env` file:

```env
DATABASE_URL=mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

Replace the placeholders with your actual connection details.

### 5. Test the Connection

You can test your database connection by visiting the API route:

```
http://localhost:3000/api/test-db
```

When running the development server, this should return a success message if the connection is working properly.

## Using Drizzle ORM with TiDB

This project uses Drizzle ORM to interact with the database. Here are the key commands:

### Generate Migrations

```bash
bun run db:generate
```

### Push Schema to Database

```bash
bun run db:push
```

### Start Drizzle Studio

```bash
bun run db:studio
```

This will start a web interface where you can view and manage your database schema.

## Schema Management

Database schemas are defined in `src/lib/db/schema.ts`. You can add new tables and modify existing ones in this file.

Example table definition:

```typescript
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## Best Practices

1. Always use environment variables for database credentials
2. Regularly backup your database
3. Monitor your database performance
4. Use connection pooling for production applications
5. Follow security best practices for database access

## Troubleshooting

### Connection Issues

1. Verify your connection string is correct
2. Ensure your IP address is allowed in TiDB Cloud (for non-serverless tiers)
3. Check that your cluster is running
4. Verify your credentials are correct

### Schema Issues

1. Make sure to run `bun run db:push` after schema changes
2. Check the Drizzle Studio for schema visualization
3. Review error messages for specific issues

## Additional Resources

- [TiDB Documentation](https://docs.pingcap.com/tidbcloud)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [TiDB Cloud Console](https://tidbcloud.com/console/clusters)