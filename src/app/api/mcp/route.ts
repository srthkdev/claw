import { db } from '@/lib/db';
import { chatbots, chatHistory } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { findSimilarDocuments } from '@/lib/vector-search';

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

// Get all chatbots
export async function GET(request: Request) {
  try {
    const authResult = await authenticateRequest(request);
    if ('error' in authResult) {
      return addCorsHeaders(NextResponse.json({ error: authResult.error }, { status: 401 }));
    }
    
    // Fetch all chatbots (in a real implementation, you would filter by user)
    const chatbotsList = await db.select().from(chatbots);
    
    // Return only the essential information
    const simplifiedChatbots = chatbotsList.map(chatbot => ({
      id: chatbot.id,
      name: chatbot.name,
      createdAt: chatbot.createdAt,
      updatedAt: chatbot.updatedAt
    }));
    
    return addCorsHeaders(NextResponse.json(simplifiedChatbots));
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return addCorsHeaders(NextResponse.json({ error: 'Failed to fetch chatbots' }, { status: 500 }));
  }
}

// Send message to chatbot
export async function POST(request: Request) {
  try {
    const authResult = await authenticateRequest(request);
    if ('error' in authResult) {
      return addCorsHeaders(NextResponse.json({ error: authResult.error }, { status: 401 }));
    }
    
    const { chatbotId, message, context } = await request.json();
    
    if (!chatbotId || !message) {
      return addCorsHeaders(NextResponse.json({ error: 'chatbotId and message are required' }, { status: 400 }));
    }
    
    const chatbotIdNum = parseInt(chatbotId);
    if (isNaN(chatbotIdNum)) {
      return addCorsHeaders(NextResponse.json({ error: 'Invalid chatbot ID' }, { status: 400 }));
    }
    
    // Fetch the chatbot
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotIdNum));
    
    if (!chatbot) {
      return addCorsHeaders(NextResponse.json({ error: 'Chatbot not found' }, { status: 404 }));
    }
    
    // Store user message in chat history
    const sessionId = context?.sessionId || `mcp-session-${Date.now()}`;
    
    await db.insert(chatHistory).values({
      chatbotId: chatbotIdNum,
      sessionId,
      role: 'user',
      content: message,
      metadata: {
        source: 'mcp',
        context: context || {}
      }
    });
    
    // Find similar documents using vector search
    const similarDocuments = await findSimilarDocuments(message, chatbotIdNum, 3);
    
    // Create context from similar documents
    const documentContext = similarDocuments.map(doc => doc.content).join('\n\n');
    
    // Create prompt with context
    const prompt = `
You are an AI assistant for ${chatbot.name}. Answer the user's question based on the provided context.

Context:
${documentContext}

User Question:
${message}

Please provide a helpful and accurate response based on the context provided. Format your response using code blocks, and lists where appropriate.

Your response should be informative, well-structured, and easy to read.
`;

    // Try to get API keys from environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    let assistantResponse = "";
    
    // Try OpenAI first if API key is available
    if (openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: `You are a helpful assistant for ${chatbot.name}. Always format your responses using code blocks with proper headers, code blocks with language specification, and lists where appropriate. Include code examples when discussing technical topics.` 
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          })
        });
        
        if (response.ok) {
          const completion = await response.json();
          assistantResponse = completion.choices[0].message.content || "I couldn't generate a response.";
        } else {
          const errorText = await response.text();
          console.error('OpenAI API error:', response.status, errorText);
          throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
        }
      } catch (openAIError) {
        console.warn('OpenAI API failed, trying Gemini as fallback:', openAIError);
        
        // If OpenAI fails, try Google Gemini if API key is available
        if (googleApiKey) {
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleApiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  role: "user",
                  parts: [{
                    text: prompt
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1000,
                },
                systemInstruction: {
                  parts: [{
                    text: `You are a helpful assistant for ${chatbot.name}. Always format your responses using code blocks with proper headers, code blocks with language specification, and lists where appropriate. Include code examples when discussing technical topics.`
                  }]
                }
              })
            });
            
            if (response.ok) {
              const completion = await response.json();
              assistantResponse = completion.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
            } else {
              const errorText = await response.text();
              console.error('Gemini API error:', response.status, errorText);
              throw new Error(`Gemini API error: ${response.status} ${errorText}`);
            }
          } catch (geminiError) {
            console.error('Both OpenAI and Gemini APIs failed:', geminiError);
            throw new Error('Failed to generate response with both OpenAI and Google Gemini');
          }
        } else {
          throw new Error('OpenAI API failed and Google API key not available');
        }
      }
    } else if (googleApiKey) {
      // If only Google API key is available, use it directly
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
            systemInstruction: {
              parts: [{
                text: `You are a helpful assistant for ${chatbot.name}. Always format your responses using code blocks with proper headers, code blocks with language specification, and lists where appropriate. Include code examples when discussing technical topics.`
              }]
            }
          })
        });
        
        if (response.ok) {
          const completion = await response.json();
          assistantResponse = completion.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
        } else {
          const errorText = await response.text();
          console.error('Google Gemini API error:', response.status, errorText);
          throw new Error(`Gemini API error: ${response.status} ${errorText}`);
        }
      } catch (geminiError) {
        console.error('Google Gemini API failed:', geminiError);
        throw new Error('Failed to generate response with Google Gemini');
      }
    } else {
      throw new Error('No API keys available for either OpenAI or Google Gemini');
    }
    
    // Store assistant message in chat history
    await db.insert(chatHistory).values({
      chatbotId: chatbotIdNum,
      sessionId,
      role: 'assistant',
      content: assistantResponse,
      metadata: {
        source: 'mcp',
        sourceDocuments: similarDocuments.map(doc => ({
          id: doc.documentId,
          similarity: doc.similarity
        }))
      }
    });
    
    return addCorsHeaders(NextResponse.json({ 
      response: assistantResponse,
      sessionId
    }));
  } catch (error: any) {
    console.error('Error chatting with bot:', error);
    return addCorsHeaders(NextResponse.json({ error: 'Failed to chat with bot: ' + (error.message || 'Unknown error') }, { status: 500 }));
  }
}