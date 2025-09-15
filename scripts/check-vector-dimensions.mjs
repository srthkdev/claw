import { config } from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
config({ path: '.env.local' });

async function checkVectorDimensions() {
  let connection;
  
  try {
    console.log('Checking vector dimensions in the database...');
    
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
    
    // Get a sample of vectors and check their dimensions
    const [rows] = await connection.execute(
      'SELECT id, document_id, JSON_LENGTH(embedding) as dimensions FROM vectors_new LIMIT 5'
    );
    
    console.log('Vector dimensions in database:');
    for (const row of rows) {
      console.log(`  Vector ID ${row.id} (Document ${row.document_id}): ${row.dimensions} dimensions`);
    }
    
    // Also check the total count
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM vectors_new'
    );
    
    console.log(`\nTotal vectors in database: ${countResult[0].total}`);
    
  } catch (error) {
    console.error('Error checking vector dimensions:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkVectorDimensions();