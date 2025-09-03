// Example schema file - you can add your own tables here
import { mysqlTable, varchar, int, timestamp } from 'drizzle-orm/mysql-core';

// Example table - you can replace this with your actual tables
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});