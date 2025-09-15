import { config } from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
config({ path: '.env.local' });

async function testVectorSearch() {
  let connection;
  
  try {
    console.log('Testing vector search functionality...');
    
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
    
    // Create a simple test embedding with 768 dimensions (all zeros for testing)
    const testEmbedding = new Array(768).fill(0.1);
    console.log(`Created test embedding with ${testEmbedding.length} dimensions`);
    
    // Convert embedding to TiDB VECTOR format
    const embeddingString = `[${testEmbedding.join(',')}]`;
    console.log(`Embedding string length: ${embeddingString.length}`);
    
    // Test the vector search query with a sample chatbot ID
    const chatbotId = 30001;
    console.log(`Testing vector search for chatbot ${chatbotId}`);
    
    // Use a simple query to test if the vector search works
    const [results] = await connection.execute(
      `SELECT 
        v.id,
        v.document_id as documentId,
        v.content,
        VEC_COSINE_DISTANCE(v.embedding, CAST(? AS VECTOR(768))) as similarity
      FROM vectors_new v
      INNER JOIN documents d ON v.document_id = d.id
      WHERE d.chatbot_id = ?
      ORDER BY similarity
      LIMIT 3`,
      [embeddingString, chatbotId]
    );
    
    console.log(`Vector search returned ${results.length} results`);
    
    if (results.length > 0) {
      for (const result of results) {
        console.log(`  Document ${result.documentId}: similarity = ${result.similarity}`);
        // Show first 100 characters of content
        console.log(`    Content: ${result.content.substring(0, 100)}...`);
      }
    } else {
      console.log('No results found. This might be because there are no documents for this chatbot or the vectors were stored incorrectly.');
    }
    
  } catch (error) {
    console.error('Error testing vector search:', error);
    console.error('Error details:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testVectorSearch();