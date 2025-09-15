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

// Chat with a chatbot
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    // Note: Chat endpoint might not require authentication if it's for the public chat widget
    // But we'll keep it for now to manage chat history
    // const { userId } = auth();
    
    const chatbotId = parseInt(params.id);
    
    if (isNaN(chatbotId)) {
      return addCorsHeaders(NextResponse.json({ error: 'Invalid chatbot ID' }, { status: 400 }));
    }
    
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
    
    if (!chatbot) {
      return addCorsHeaders(NextResponse.json({ error: 'Chatbot not found' }, { status: 404 }));
    }
    
    // If user is authenticated, verify they own the chatbot
    // if (userId && chatbot.userId !== userId) {
    //   return addCorsHeaders(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    // }
    
    const { message, sessionId } = await request.json();
    
    if (!message) {
      return addCorsHeaders(NextResponse.json({ error: 'Message is required' }, { status: 400 }));
    }
    
    // Store user message in chat history
    await db.insert(chatHistory).values({
      chatbotId,
      sessionId: sessionId || null,
      role: 'user',
      content: message,
      metadata: {}
    });
    
    // Check if this is a simple greeting and adjust response accordingly
    const isGreeting = message.trim().toLowerCase().match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/);
    
    let assistantResponse = "";
    let similarDocuments: { documentId: number; similarity: number; content: string }[] | undefined;
    
    if (isGreeting) {
      // For greetings, provide a short, friendly response
      assistantResponse = `Hello there! I'm your ${chatbot.name} assistant. How can I help you today?`;
    } else {
      // Find similar documents using vector search
      similarDocuments = await findSimilarDocuments(message, chatbotId, 3);
      
      // Create context from similar documents
      const context = similarDocuments.map(doc => doc.content).join('\n\n');
      
      // Create prompt with context
      const prompt = `
You are an AI assistant for ${chatbot.name}. Answer the user's question based on the provided context.

Context:
${context}

User Question:
${message}

Please provide a helpful and accurate response based on the context provided. Format your response using the following guidelines:
1. Use markdown headers (#, ##, ###) for section headings
2. Use code blocks with language specification for code snippets (e.g. \`\`\`javascript ... \`\`\`)
3. Use bullet points or numbered lists for itemized information
4. Use bold or italic text for emphasis where appropriate
5. Include relevant code examples when discussing technical topics
6. Keep explanations clear and concise

Your response should be informative, well-structured, and easy to read.
`;

      // Try to get API keys from environment variables first, then fallback to localStorage keys
      const openaiApiKey = process.env.OPENAI_API_KEY;
      const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      
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
                  content: `You are a helpful assistant for ${chatbot.name}. Always format your responses using markdown with proper headers, code blocks with language specification, and lists where appropriate. Include code examples when discussing technical topics.` 
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
            
            // Check for rate limit errors
            if (response.status === 429 || errorText.includes('insufficient_quota')) {
              throw new Error('OpenAI API quota exceeded or rate limited');
            }
            
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
                      text: `You are a helpful assistant for ${chatbot.name}. Always format your responses using markdown with proper headers, code blocks with language specification, and lists where appropriate. Include code examples when discussing technical topics.`
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
                  text: `You are a helpful assistant for ${chatbot.name}. Always format your responses using markdown with proper headers, code blocks with language specification, and lists where appropriate. Include code examples when discussing technical topics.`
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
    }
    
    // Store assistant message in chat history
    await db.insert(chatHistory).values({
      chatbotId,
      sessionId: sessionId || null,
      role: 'assistant',
      content: assistantResponse,
      metadata: {
        sourceDocuments: similarDocuments?.map((doc: { documentId: number; similarity: number }) => ({
          id: doc.documentId,
          similarity: doc.similarity
        })) || []
      }
    });
    
    return addCorsHeaders(NextResponse.json({ 
      response: assistantResponse,
      sessionId: sessionId || Math.random().toString(36).substring(2, 15)
    }));
  } catch (error: any) {
    console.error('Error chatting with bot:', error);
    // Handle rate limit errors
    if (error?.message?.includes('quota exceeded') || error?.message?.includes('rate limited')) {
      return addCorsHeaders(NextResponse.json({ error: 'AI service quota exceeded. Please try again later.' }, { status: 429 }));
    }
    if (error?.message?.includes('Authentication error')) {
      return addCorsHeaders(NextResponse.json({ error: 'Authentication error with AI service.' }, { status: 401 }));
    }
    return addCorsHeaders(NextResponse.json({ error: 'Failed to chat with bot: ' + (error.message || 'Unknown error') }, { status: 500 }));
  }
}

// Get chat history
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    // Note: Chat history endpoint might not require authentication if it's for the public chat widget
    // But we'll keep it for now
    // const { userId } = auth();
    
    const chatbotId = parseInt(params.id);
    
    if (isNaN(chatbotId)) {
      return addCorsHeaders(NextResponse.json({ error: 'Invalid chatbot ID' }, { status: 400 }));
    }
    
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
    
    if (!chatbot) {
      return addCorsHeaders(NextResponse.json({ error: 'Chatbot not found' }, { status: 404 }));
    }
    
    // If user is authenticated, verify they own the chatbot
    // if (userId && chatbot.userId !== userId) {
    //   return addCorsHeaders(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    // }
    
    // Extract session ID from query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return addCorsHeaders(NextResponse.json({ error: 'Session ID is required' }, { status: 400 }));
    }
    
    const history = await db.select().from(chatHistory)
      .where(and(
        eq(chatHistory.chatbotId, chatbotId),
        eq(chatHistory.sessionId, sessionId)
      ))
      .orderBy(chatHistory.createdAt);
    
    return addCorsHeaders(NextResponse.json(history));
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return addCorsHeaders(NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 }));
  }
}