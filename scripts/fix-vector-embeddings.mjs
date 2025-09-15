import { config } from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
config({ path: '.env.local' });

async function fixVectorEmbeddings() {
  let connection;
  
  try {
    console.log('Fixing vector embeddings in the database...');
    
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
    
    // First, let's check how many vectors we have
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM vectors_new'
    );
    
    console.log(`Total vectors in database: ${countResult[0].total}`);
    
    if (countResult[0].total > 0) {
      console.log('\nIMPORTANT: Existing vectors were stored incorrectly and need to be reprocessed.');
      console.log('To fix this issue, you need to:');
      console.log('1. Delete all existing documents for your chatbots');
      console.log('2. Re-ingest all documents to generate correct vector embeddings');
      console.log('');
      console.log('You can do this through the web interface by:');
      console.log('- Going to your chatbot dashboard');
      console.log('- Deleting existing documents');
      console.log('- Re-uploading or re-crawling the content');
      console.log('');
      console.log('Alternatively, you can use the API endpoints to delete and re-ingest documents programmatically.');
    } else {
      console.log('No existing vectors found. The database is ready for correct vector storage.');
    }
    
    // Let's also check if there are any documents that need to be reprocessed
    const [docCountResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM documents'
    );
    
    console.log(`\nTotal documents in database: ${docCountResult[0].total}`);
    
    if (docCountResult[0].total > 0) {
      console.log('\nYou have existing documents that may need to be reprocessed.');
      console.log('Please delete and re-ingest these documents to ensure correct vector embeddings.');
    }
    
  } catch (error) {
    console.error('Error fixing vector embeddings:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixVectorEmbeddings();