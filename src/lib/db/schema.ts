import { mysqlTable, varchar, text, int, timestamp, json, primaryKey, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

// Users table (extending existing schema)
export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Chatbots table
export const chatbots = mysqlTable('chatbots', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  config: json('config'),
  scriptConfig: json('script_config'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().onUpdateNow(),
});

// Documents table
export const documents = mysqlTable('documents', {
  id: int('id').primaryKey().autoincrement(),
  chatbotId: int('chatbot_id').notNull().references(() => chatbots.id),
  url: text('url'),
  content: text('content'),
  contentType: varchar('content_type', { length: 50 }).$type<'web_page' | 'markdown' | 'pdf' | 'text' | 'code'>(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().onUpdateNow(),
});

// Vectors table with proper VECTOR type and HNSW index
export const vectors = mysqlTable('vectors_new', {
  id: int('id').primaryKey().autoincrement(),
  documentId: int('document_id').notNull().references(() => documents.id),
  content: text('content'),
  // Using JSON for VECTOR type for now, will use raw SQL for vector operations
  embedding: json('embedding'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Chat history table
export const chatHistory = mysqlTable('chat_history', {
  id: int('id').primaryKey().autoincrement(),
  chatbotId: int('chatbot_id').notNull().references(() => chatbots.id),
  sessionId: varchar('session_id', { length: 255 }),
  role: varchar('role', { length: 20 }).$type<'user' | 'assistant'>().notNull(),
  content: text('content'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});