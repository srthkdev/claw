import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { documents, vectors } from '@/lib/db/schema';
import { generateEmbedding } from '@/lib/embeddings';

// Define types for our results
interface VectorResult {
  id: number;
  documentId: number;
  content: string;
  similarity: number;
}

interface DocumentWithSimilarity extends VectorResult {
  document: typeof documents.$inferSelect | undefined;
}

// Function to find similar documents using vector search
export async function findSimilarDocuments(
  query: string,
  chatbotId: number,
  limit: number = 5,
): Promise<DocumentWithSimilarity[]> {
  try {
    console.log(`Finding similar documents for query: "${query}" in chatbot ${chatbotId}`);
    
    // Generate embedding for the query using the fallback mechanism
    const queryEmbedding = await generateEmbedding(query);
    console.log(`Generated embedding with ${queryEmbedding.length} dimensions`);
    
    // Convert embedding to TiDB VECTOR format
    const embeddingString = `[${queryEmbedding.join(',')}]`;
    
    // Use TiDB's native vector search with HNSW index
    // This query leverages the HNSW index for efficient similarity search
    console.log(`Executing vector search query for chatbot ${chatbotId}`);
    const results = await db.execute<{
      id: number;
      documentId: number;
      content: string;
      similarity: number;
    }>(sql`
      SELECT 
        v.id,
        v.document_id as documentId,
        v.content,
        VEC_COSINE_DISTANCE(v.embedding, CAST(${embeddingString} AS VECTOR(768))) as similarity
      FROM vectors_new v
      INNER JOIN documents d ON v.document_id = d.id
      WHERE d.chatbot_id = ${chatbotId}
      ORDER BY similarity
      LIMIT ${limit}
    `);
    
    console.log(`Vector search returned ${results.rows?.length || 0} results`);
    
    // Check if results exist
    if (!results.rows) {
      return [];
    }
    
    // Fetch document details for the most similar vectors
    const documentIds = results.rows.map((result: any) => result.documentId);
    
    // Check if documentIds is empty to avoid query errors
    if (documentIds.length === 0) {
      return [];
    }
    
    console.log(`Fetching document details for ${documentIds.length} documents`);
    const docs = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.chatbotId, chatbotId),
          sql`${documents.id} in ${documentIds}`,
        ),
      );
    console.log(`Found ${docs.length} document details`);
    
    // Combine vector results with document details
    const combinedResults = results.rows.map((result: any) => {
      const doc = docs.find((d) => d.id === result.documentId);
      return {
        id: result.id,
        documentId: result.documentId,
        content: result.content,
        similarity: result.similarity,
        document: doc,
      };
    });
    
    return combinedResults;
  } catch (error) {
    console.error('Error finding similar documents:', error);
    throw new Error('Failed to find similar documents: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Function to store embedding in database
export async function storeEmbedding(
  documentId: number,
  content: string,
  embedding: number[],
) {
  try {
    // Convert embedding to TiDB VECTOR format
    const embeddingString = `[${embedding.join(',')}]`;
    
    // Insert the embedding using raw SQL to work with VECTOR type
    await db.execute(sql`
      INSERT INTO vectors_new (document_id, content, embedding, metadata, created_at)
      VALUES (${documentId}, ${content}, CAST(${embeddingString} AS VECTOR(768)), '{}', UTC_TIMESTAMP())
    `);
    
    // Select the newly created embedding by querying for the last inserted record
    const documentVectors = await db
      .select()
      .from(vectors)
      .where(eq(vectors.documentId, documentId));
    const storedEmbedding = documentVectors[documentVectors.length - 1];
    
    return storedEmbedding;
  } catch (error) {
    console.error('Error storing embedding:', error);
    throw new Error('Failed to store embedding');
  }
}