import { db } from '@/lib/db';
import { chatbots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Add CORS headers to the response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Authentication middleware
async function authenticateRequest(request: Request) {
  // For MCP integration, we'll use API key authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header' };
  }
  
  const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // In a real implementation, you would validate the API key against a database
  // For this demo, we'll accept any non-empty API key
  if (!apiKey) {
    return { error: 'Invalid API key' };
  }
  
  // Return user context (in a real implementation, you would get this from the API key)
  return { userId: 'mcp-user' };
}

// Get a specific chatbot by ID
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const authResult = await authenticateRequest(request);
    if ('error' in authResult) {
      return addCorsHeaders(NextResponse.json({ error: authResult.error }, { status: 401 }));
    }
    
    const chatbotId = parseInt(params.id);
    
    if (isNaN(chatbotId)) {
      return addCorsHeaders(NextResponse.json({ error: 'Invalid chatbot ID' }, { status: 400 }));
    }
    
    // Fetch the chatbot
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
    
    if (!chatbot) {
      return addCorsHeaders(NextResponse.json({ error: 'Chatbot not found' }, { status: 404 }));
    }
    
    return addCorsHeaders(NextResponse.json(chatbot));
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    return addCorsHeaders(NextResponse.json({ error: 'Failed to fetch chatbot' }, { status: 500 }));
  }
}