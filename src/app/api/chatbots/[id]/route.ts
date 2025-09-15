import { db } from '@/lib/db';
import { chatbots } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Get a single chatbot by ID
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
    
    // Check if user owns this chatbot
    if (chatbot.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(chatbot);
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    return NextResponse.json({ error: 'Failed to fetch chatbot' }, { status: 500 });
  }
}

// Delete a chatbot by ID
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
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
    
    // Check if user owns this chatbot
    if (chatbot.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Delete the chatbot
    await db.delete(chatbots).where(eq(chatbots.id, chatbotId));
    
    return NextResponse.json({ message: 'Chatbot deleted successfully' });
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    return NextResponse.json({ error: 'Failed to delete chatbot' }, { status: 500 });
  }
}