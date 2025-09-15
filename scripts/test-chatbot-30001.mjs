import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq, sql } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

async function testChatbot() {
  let connection;
  
  try {
    console.log('Testing chatbot with ID 30001...');
    
    // Parse the DATABASE_URL
    const url = new URL(process.env.DATABASE_URL);
    
    // Create database connection
    connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: {
        rejectUnauthorized: true,
      },
    });
    
    // Create a simple schema for our tables
    const chatbots = {
      tableName: 'chatbots',
    };
    
    const documents = {
      tableName: 'documents',
    };
    
    const vectors = {
      tableName: 'vectors_new',
    };
    
    // Check if chatbot exists
    const [chatbotsResult] = await connection.execute(
      'SELECT * FROM chatbots WHERE id = ?',
      [30001]
    );
    
    const chatbot = chatbotsResult[0];
    
    if (!chatbot) {
      console.log('❌ Chatbot with ID 30001 not found');
      return;
    }
    
    console.log('✅ Chatbot found:');
    console.log('  ID:', chatbot.id);
    console.log('  Name:', chatbot.name);
    console.log('  User ID:', chatbot.user_id);
    
    // Check documents
    const [docsResult] = await connection.execute(
      'SELECT * FROM documents WHERE chatbot_id = ?',
      [chatbot.id]
    );
    
    const docs = docsResult;
    console.log(`\n📄 Documents: ${docs.length}`);
    
    if (docs.length > 0) {
      console.log('  First document:');
      console.log('    URL:', docs[0].url);
      console.log('    Content length:', docs[0].content?.length || 0);
      
      // Check vectors for first document
      const [vectorsResult] = await connection.execute(
        'SELECT * FROM vectors_new WHERE document_id = ?',
        [docs[0].id]
      );
      
      const docVectors = vectorsResult;
      console.log(`  Vectors for first document: ${docVectors.length}`);
      
      if (docVectors.length > 0) {
        console.log('  First vector content preview:', docVectors[0].content?.substring(0, 100) + '...');
        console.log('  First vector embedding type:', typeof docVectors[0].embedding);
        // Check if embedding is an array or string
        if (Array.isArray(docVectors[0].embedding)) {
          console.log('  First vector embedding length:', docVectors[0].embedding.length);
        } else if (typeof docVectors[0].embedding === 'string') {
          try {
            const parsed = JSON.parse(docVectors[0].embedding);
            console.log('  First vector embedding parsed length:', Array.isArray(parsed) ? parsed.length : 'Not an array');
          } catch (e) {
            console.log('  First vector embedding could not be parsed as JSON');
          }
        }
      }
    }
    
    // Count total vectors for this chatbot
    const [vectorCountResult] = await connection.execute(
      `SELECT COUNT(*) as count FROM vectors_new v 
       INNER JOIN documents d ON v.document_id = d.id 
       WHERE d.chatbot_id = ?`,
      [chatbot.id]
    );
    
    console.log(`\n📊 Total vectors for chatbot: ${vectorCountResult[0].count}`);
    
  } catch (error) {
    console.error('❌ Error testing chatbot:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testChatbot();