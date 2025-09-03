# AI Chatbot Maker

Create powerful AI chatbots for your business with ease.

## Features

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Clerk Authentication
- TiDB Serverless Database
- Drizzle ORM

## Getting Started

### Prerequisites

- Node.js 18+
- Bun package manager
- TiDB Cloud account (for database)

### Installation

1. Install dependencies:
```bash
bun install
```

### Setting up Clerk Authentication

1. Go to [Clerk.dev](https://clerk.dev) and create an account
2. Create a new application
3. Copy your publishable key and secret key
4. Add them to your `.env` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Setting up TiDB Serverless

1. Sign up for a [TiDB Cloud account](https://tidbcloud.com/)
2. Create a Serverless Tier cluster
3. Get your connection details:
   - Host
   - Port
   - Username
   - Password
   - Database name
4. Update your `.env` file with the database URL:
```env
DATABASE_URL=mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

### Database Setup with Drizzle ORM

1. Generate migrations:
```bash
bun run db:generate
```

2. Push schema to database:
```bash
bun run db:push
```

3. (Optional) Start Drizzle Studio to view your database:
```bash
bun run db:studio
```

### Running the Application

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # React components
├── lib/           # Utility functions and database setup
└── hooks/         # Custom React hooks
```

## Authentication

This project uses Clerk for authentication. The landing page has "Sign Up" and "Sign In" buttons that open modals. After signing in, users are redirected to the dashboard.

## Database

The project uses TiDB Serverless with Drizzle ORM for database operations. The database schema is defined in `src/lib/db/schema.ts`.

## Deployment

This project can be deployed to Vercel with minimal configuration. Make sure to set your environment variables in your deployment platform.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [TiDB Documentation](https://docs.pingcap.com/tidbcloud)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)