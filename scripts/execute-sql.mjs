import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

export default async function executeSql() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Please provide a SQL file path');
    process.exit(1);
  }
  
  const sqlFilePath = resolve(process.cwd(), args[0]);
  
  try {
    // Read the SQL file
    const sql = readFileSync(sqlFilePath, 'utf8');
    
    // Parse the DATABASE_URL
    const url = new URL(process.env.DATABASE_URL);
    
    // Create database connection with SSL
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: {
        rejectUnauthorized: true,
      },
      multipleStatements: true, // Enable multi-statement execution
    });
    
    // Execute the SQL
    console.log('Executing SQL file:', sqlFilePath);
    const [results] = await connection.query(sql);
    console.log('SQL executed successfully');
    
    // Show results if any
    if (results) {
      console.log('Results:', results);
    }
    
    // Close connection
    await connection.end();
  } catch (error) {
    console.error('Error executing SQL:', error);
    process.exit(1);
  }
}

// If this file is being run directly, execute the function
if (import.meta.url === `file://${process.argv[1]}`) {
  executeSql();
}