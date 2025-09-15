import { db } from '../src/lib/db/index.ts';
import { chatbots, documents } from '../src/lib/db/schema.ts';
import { eq } from 'drizzle-orm';

async function checkChatbot() {
  try {
    console.log('Checking if chatbot with ID 30001 exists...');
    
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, 30001));
    
    if (!chatbot) {
      console.log('Chatbot with ID 30001 not found');
      return;
    }
    
    console.log('Chatbot found:');
    console.log('- ID:', chatbot.id);
    console.log('- Name:', chatbot.name);
    console.log('- User ID:', chatbot.userId);
    console.log('- Config:', chatbot.config);
    console.log('- Script Config:', chatbot.scriptConfig);
    
    // Check if the chatbot has documents
    const docs = await db.select().from(documents).where(eq(documents.chatbotId, chatbot.id));
    console.log(`\nChatbot has ${docs.length} documents`);
    
    if (docs.length > 0) {
      console.log('First document preview:');
      console.log('- URL:', docs[0].url);
      console.log('- Content length:', docs[0].content?.length || 0);
    }
  } catch (error) {
    console.error('Error checking chatbot:', error);
  }
}

checkChatbot();