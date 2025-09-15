import { db } from '@/lib/db';
import { chatbots, documents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Checking if chatbot with ID 30001 exists...');
    
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, 30001));
    
    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot with ID 30001 not found' }, { status: 404 });
    }
    
    // Check if the chatbot has documents
    const docs = await db.select().from(documents).where(eq(documents.chatbotId, chatbot.id));
    
    return NextResponse.json({
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        userId: chatbot.userId,
        config: chatbot.config,
        scriptConfig: chatbot.scriptConfig
      },
      documentCount: docs.length
    });
  } catch (error) {
    console.error('Error checking chatbot:', error);
    return NextResponse.json({ error: 'Failed to check chatbot' }, { status: 500 });
  }
}