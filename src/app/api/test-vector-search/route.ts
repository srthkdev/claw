import { findSimilarDocuments } from '@/lib/vector-search';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing vector search with a sample query...');
    
    // Test with a simple query
    const query = "What is this chatbot about?";
    const chatbotId = 30001; // The chatbot ID from the error
    
    console.log(`Searching for similar documents to: "${query}" in chatbot ${chatbotId}`);
    
    const results = await findSimilarDocuments(query, chatbotId, 3);
    
    console.log(`Found ${results.length} similar documents`);
    
    return NextResponse.json({
      success: true,
      query,
      results: results.map(result => ({
        id: result.id,
        documentId: result.documentId,
        contentPreview: result.content?.substring(0, 100) + '...',
        similarity: result.similarity,
        hasDocument: !!result.document
      }))
    });
  } catch (error) {
    console.error('Vector search test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}