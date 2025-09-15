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
    
    // Try a different approach to check vector dimensions
    // First, let's see what the column type is
    const [schemaRows] = await connection.execute(
      'DESCRIBE vectors_new'
    );
    
    console.log('Table schema:');
    for (const row of schemaRows) {
      console.log(`  ${row.Field}: ${row.Type}`);
    }
    
    // Try to get vector info using TiDB specific functions
    try {
      const [vectorRows] = await connection.execute(
        'SELECT id, document_id, length(embedding) as dimensions FROM vectors_new LIMIT 5'
      );
      
      console.log('\nVector dimensions in database:');
      for (const row of vectorRows) {
        console.log(`  Vector ID ${row.id} (Document ${row.document_id}): ${row.dimensions} dimensions`);
      }
    } catch (queryError) {
      console.log('\nCould not query vector dimensions directly:', queryError.message);
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