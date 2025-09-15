import { db } from '@/lib/db';
import { chatbots, documents, chatHistory } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Get analytics data for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get total chatbots count
    const chatbotsCount = await db.select({ count: sql<number>`count(*)` })
      .from(chatbots)
      .where(eq(chatbots.userId, userId));
    
    // Get total documents count
    const documentsCount = await db.select({ count: sql<number>`count(*)` })
      .from(documents)
      .innerJoin(chatbots, eq(documents.chatbotId, chatbots.id))
      .where(eq(chatbots.userId, userId));
    
    // Get total chat messages count
    const messagesCount = await db.select({ count: sql<number>`count(*)` })
      .from(chatHistory)
      .innerJoin(chatbots, eq(chatHistory.chatbotId, chatbots.id))
      .where(eq(chatbots.userId, userId));
    
    // Get chatbot-specific analytics
    const chatbotAnalytics = await db.select({
      id: chatbots.id,
      name: chatbots.name,
      documentCount: sql<number>`count(distinct ${documents.id})`,
      messageCount: sql<number>`count(distinct ${chatHistory.id})`,
      lastActivity: sql<string>`max(${chatHistory.createdAt})`,
    })
    .from(chatbots)
    .leftJoin(documents, eq(chatbots.id, documents.chatbotId))
    .leftJoin(chatHistory, eq(chatbots.id, chatHistory.chatbotId))
    .where(eq(chatbots.userId, userId))
    .groupBy(chatbots.id, chatbots.name);
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = await db.select({
      date: sql<string>`DATE(${chatHistory.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(chatHistory)
    .innerJoin(chatbots, eq(chatHistory.chatbotId, chatbots.id))
    .where(and(
      eq(chatbots.userId, userId),
      sql`${chatHistory.createdAt} >= ${thirtyDaysAgo.toISOString()}`
    ))
    .groupBy(sql`DATE(${chatHistory.createdAt})`)
    .orderBy(sql`DATE(${chatHistory.createdAt})`);
    
    return NextResponse.json({
      overview: {
        totalChatbots: chatbotsCount[0].count,
        totalDocuments: documentsCount[0].count,
        totalMessages: messagesCount[0].count,
      },
      chatbots: chatbotAnalytics,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}