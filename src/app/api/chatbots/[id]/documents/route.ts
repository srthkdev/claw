import { db } from '@/lib/db';
import { chatbots, documents, vectors } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, count, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Get document statistics for a chatbot
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const chatbotId = parseInt(params.id);
    
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: 'Invalid chatbot ID' }, { status: 400 });
    }
    
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
    
    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }
    
    if (chatbot.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get document statistics
    const documentStats = await db.execute<{
      total_documents: number;
      total_embeddings: number;
      content_types: string;
      latest_document: Date;
    }>(sql`
      SELECT 
        COUNT(DISTINCT d.id) as total_documents,
        COUNT(v.id) as total_embeddings,
        GROUP_CONCAT(DISTINCT d.content_type) as content_types,
        MAX(d.created_at) as latest_document
      FROM documents d
      LEFT JOIN vectors_new v ON d.id = v.document_id
      WHERE d.chatbot_id = ${chatbotId}
    `);
    
    // Get individual documents with their embedding counts
    const documentsWithEmbeddings = await db.execute<{
      id: number;
      url: string;
      content_type: string;
      created_at: Date;
      embedding_count: number;
    }>(sql`
      SELECT 
        d.id,
        d.url,
        d.content_type,
        d.created_at,
        COUNT(v.id) as embedding_count
      FROM documents d
      LEFT JOIN vectors_new v ON d.id = v.document_id
      WHERE d.chatbot_id = ${chatbotId}
      GROUP BY d.id, d.url, d.content_type, d.created_at
      ORDER BY d.created_at DESC
    `);
    
    const stats = documentStats.rows?.[0] || {};
    
    return NextResponse.json({
      statistics: {
        totalDocuments: parseInt((stats as any).total_documents) || 0,
        totalEmbeddings: parseInt((stats as any).total_embeddings) || 0,
        contentTypes: (stats as any).content_types ? (stats as any).content_types.split(',') : [],
        latestDocument: (stats as any).latest_document
      },
      documents: (documentsWithEmbeddings.rows || []).map((row: any) => ({
        id: row.id,
        url: row.url,
        contentType: row.content_type,
        createdAt: row.created_at,
        embeddingCount: parseInt(row.embedding_count) || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching document statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch document statistics' }, { status: 500 });
  }
}