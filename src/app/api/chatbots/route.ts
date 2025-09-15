import { db } from '@/lib/db';
import { chatbots, documents } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Create a new chatbot
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, config } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // Validate config if provided
    if (config && typeof config !== 'object') {
      return NextResponse.json({ error: 'Config must be an object' }, { status: 400 });
    }
    
    // Insert the new chatbot
    await db.insert(chatbots).values({
      userId,
      name,
      config: config || {},
      scriptConfig: {}
    });
    
    // Select the newly created chatbot by querying for the last inserted record
    const userChatbots = await db.select().from(chatbots).where(eq(chatbots.userId, userId));
    const newChatbot = userChatbots[userChatbots.length - 1];
    
    return NextResponse.json(newChatbot);
  } catch (error: any) {
    console.error('Error creating chatbot:', error);
    // Handle database-specific errors
    if (error?.code === '23505') { // Unique constraint violation
      return NextResponse.json({ error: 'A chatbot with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create chatbot' }, { status: 500 });
  }
}

// Get all chatbots for the user with document counts
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get chatbots with document counts using a join
    const userChatbots = await db.execute<{
      id: number;
      user_id: string;
      name: string;
      config: any;
      script_config: any;
      created_at: Date;
      updated_at: Date;
      document_count: number;
    }>(sql`
      SELECT 
        c.id,
        c.user_id,
        c.name,
        c.config,
        c.script_config,
        c.created_at,
        c.updated_at,
        COUNT(d.id) as document_count
      FROM chatbots c
      LEFT JOIN documents d ON c.id = d.chatbot_id
      WHERE c.user_id = ${userId}
      GROUP BY c.id, c.user_id, c.name, c.config, c.script_config, c.created_at, c.updated_at
    `);
    
    // Transform the results to match the expected format
    const chatbotsWithCounts = (userChatbots.rows || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      config: row.config,
      scriptConfig: row.script_config,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      documentCount: parseInt(row.document_count) || 0
    }));
    
    return NextResponse.json(chatbotsWithCounts);
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    return NextResponse.json({ error: 'Failed to fetch chatbots' }, { status: 500 });
  }
}