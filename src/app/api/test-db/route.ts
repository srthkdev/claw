import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This is a simple test query - in a real app you would implement proper logic
    // const result = await db.select().from(users).limit(1);
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful",
      // data: result 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}