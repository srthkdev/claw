import { generateEmbedding } from '@/lib/embeddings';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing embedding generation...');
    
    // Test with a simple query
    const text = "Test message for embedding generation";
    
    console.log(`Generating embedding for: "${text}"`);
    
    const embedding = await generateEmbedding(text);
    
    console.log(`Generated embedding with ${embedding.length} dimensions`);
    
    // Check environment variables
    const envCheck = {
      openaiKey: !!process.env.OPENAI_API_KEY,
      googleKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    };
    
    console.log('Environment variables:', envCheck);
    
    return NextResponse.json({
      success: true,
      text,
      embeddingDimensions: embedding.length,
      embeddingPreview: embedding.slice(0, 10), // First 10 values
      environment: envCheck
    });
  } catch (error) {
    console.error('Embedding test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}