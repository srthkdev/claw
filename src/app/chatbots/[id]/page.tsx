import { db } from '@/lib/db';
import { chatbots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ChatbotPageClient from './page-client';

interface ChatbotPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatbotPage({ params }: ChatbotPageProps) {
  const { id } = await params;
  
  let chatbotId: number;
  
  // Check if this is a slug (name-id format) or just an ID
  if (id.includes('-')) {
    // Extract ID from slug format: name-ID
    const idMatch = id.match(/-(\d+)$/);
    if (!idMatch) {
      notFound();
    }
    chatbotId = parseInt(idMatch[1]);
  } else {
    // Just an ID
    chatbotId = parseInt(id);
  }
  
  if (isNaN(chatbotId)) {
    notFound();
  }
  
  // Fetch chatbot data
  const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
  
  if (!chatbot) {
    notFound();
  }
  
  // Extract customization settings
  const customization = chatbot.scriptConfig || {};
  
  return (
    <ChatbotPageClient 
      chatbotId={chatbotId}
      chatbotName={chatbot.name}
      customization={customization}
    />
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ChatbotPageProps) {
  const { id } = await params;
  
  let chatbotId: number;
  
  // Check if this is a slug (name-id format) or just an ID
  if (id.includes('-')) {
    // Extract ID from slug format: name-ID
    const idMatch = id.match(/-(\d+)$/);
    if (!idMatch) {
      return {
        title: 'Chatbot Not Found',
      };
    }
    chatbotId = parseInt(idMatch[1]);
  } else {
    // Just an ID
    chatbotId = parseInt(id);
  }
  
  if (isNaN(chatbotId)) {
    return {
      title: 'Chatbot Not Found',
    };
  }
  
  const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
  
  if (!chatbot) {
    return {
      title: 'Chatbot Not Found',
    };
  }
  
  return {
    title: `${chatbot.name} - AI Chatbot`,
    description: `Chat with the ${chatbot.name} AI assistant`,
  };
}