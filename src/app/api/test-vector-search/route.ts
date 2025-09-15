import { NextResponse } from 'next/server';
import { findSimilarDocuments } from '@/lib/vector-search';

export async function GET(request: Request) {
  try {
    // Test with a sample query and chatbot ID
    const testQuery = "What is artificial intelligence?";
    const chatbotId = 30001; // Use an existing chatbot ID
    
    console.log(`Testing vector search with query: "${testQuery}" for chatbot ${chatbotId}`);
    
    const results = await findSimilarDocuments(testQuery, chatbotId, 3);
    
    return NextResponse.json({
      success: true,
      query: testQuery,
      results: results.map(result => ({
        id: result.id,
        documentId: result.documentId,
        content: result.content.substring(0, 100) + '...', // Truncate for readability
        similarity: result.similarity
      })),
      message: `Found ${results.length} similar documents`
    });
  } catch (error: any) {
    console.error('Error in test vector search:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}