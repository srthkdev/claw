import { db } from '@/lib/db';
import { chatbots, vectors, documents } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';

// Add CORS headers to the response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: Request) {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response);
}

// Debug endpoint to check chatbot and vector status
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const chatbotId = parseInt(params.id);
    
    if (isNaN(chatbotId)) {
      return addCorsHeaders(NextResponse.json({ error: 'Invalid chatbot ID' }, { status: 400 }));
    }
    
    // Check if chatbot exists
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
    
    if (!chatbot) {
      return addCorsHeaders(NextResponse.json({ error: 'Chatbot not found' }, { status: 404 }));
    }
    
    // Check if there are vectors for this chatbot
    const vectorCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(vectors)
      .innerJoin(documents, eq(vectors.documentId, documents.id))
      .where(eq(documents.chatbotId, chatbotId));
    
    const vectorCount = vectorCountResult[0].count;
    
    // Test embedding generation
    let embeddingTest = null;
    let embeddingError = null;
    
    try {
      embeddingTest = await generateEmbedding("Test message for debugging");
    } catch (error) {
      embeddingError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Check environment variables
    const envCheck = {
      openaiKey: !!process.env.OPENAI_API_KEY,
      googleKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      databaseUrl: !!process.env.DATABASE_URL,
      clerkSecret: !!process.env.CLERK_SECRET_KEY,
    };
    
    // Test database connection
    let dbTest = null;
    let dbError = null;
    
    try {
      await db.execute(sql`SELECT 1`);
      dbTest = "Database connection successful";
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return addCorsHeaders(NextResponse.json({
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        userId: chatbot.userId,
      },
      vectorCount: vectorCount,
      embeddingTest: {
        success: !!embeddingTest,
        error: embeddingError,
        dimensions: embeddingTest ? embeddingTest.length : null,
      },
      environment: envCheck,
      database: {
        connection: dbTest,
        error: dbError,
      },
    }));
  } catch (error) {
    console.error('Debug error:', error);
    return addCorsHeaders(NextResponse.json({ error: 'Debug failed: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 }));
  }
}