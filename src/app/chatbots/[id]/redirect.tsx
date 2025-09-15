import { db } from '@/lib/db';
import { chatbots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface ChatbotRedirectProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatbotRedirect({ params }: ChatbotRedirectProps) {
  const { id } = await params;
  
  // Check if this is already in slug format
  if (id.includes('-')) {
    // Already in slug format, render the page directly
    return null;
  }
  
  // This is an ID, redirect to slug format
  const chatbotId = parseInt(id);
  
  if (isNaN(chatbotId)) {
    notFound();
  }
  
  // Fetch chatbot data
  const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
  
  if (!chatbot) {
    notFound();
  }
  
  // Generate slug format
  const slug = `${chatbot.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${chatbot.id}`;
  
  // Redirect to slug URL
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p>Redirecting to correct URL...</p>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.location.replace('/chatbots/${slug}');
            `,
          }}
        />
      </div>
    </div>
  );
}