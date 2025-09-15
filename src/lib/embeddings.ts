import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to generate embeddings for text using OpenAI with Gemini fallback
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // First try OpenAI
    return await generateEmbeddingWithOpenAI(text);
  } catch (openAIError) {
    console.warn('OpenAI embedding failed, trying Gemini as fallback:', openAIError);
    
    // If OpenAI fails, try Gemini
    try {
      return await generateEmbeddingWithGemini(text);
    } catch (geminiError) {
      console.error('Both OpenAI and Gemini embedding failed:', geminiError);
      throw new Error('Failed to generate embedding with both OpenAI and Gemini');
    }
  }
}

// Function to generate embeddings for multiple texts using OpenAI with Gemini fallback
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    // First try OpenAI
    return await generateEmbeddingsWithOpenAI(texts);
  } catch (openAIError) {
    console.warn('OpenAI embeddings failed, trying Gemini as fallback:', openAIError);
    
    // If OpenAI fails, try Gemini
    try {
      // Note: Gemini doesn't have a batch embedding API, so we process each text individually
      const embeddings: number[][] = [];
      for (const text of texts) {
        const embedding = await generateEmbeddingWithGemini(text);
        embeddings.push(embedding);
      }
      return embeddings;
    } catch (geminiError) {
      console.error('Both OpenAI and Gemini embeddings failed:', geminiError);
      throw new Error('Failed to generate embeddings with both OpenAI and Gemini');
    }
  }
}

// Original OpenAI embedding function
async function generateEmbeddingWithOpenAI(text: string): Promise<number[]> {
  try {
    // Check if OPENAI_API_KEY is defined
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 768  // Match the database schema
      })
    });
    
    const responseText = await response.text();
    
    // Check if we got HTML instead of JSON
    if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
      console.error('Received HTML instead of JSON:', responseText.substring(0, 200) + '...');
      throw new Error('Received HTML response instead of JSON - API endpoint may be incorrect');
    }
    
    if (!response.ok) {
      console.error('OpenAI Embedding API error:', responseText);
      // Check for quota exceeded error
      if (responseText.includes('insufficient_quota')) {
        throw new Error('OpenAI API quota exceeded');
      }
      throw new Error(`OpenAI Embedding API error: ${response.status} ${response.statusText}`);
    }
    
    const data = JSON.parse(responseText);
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding with OpenAI:', error);
    throw error;
  }
}

// Original OpenAI embeddings function for multiple texts
async function generateEmbeddingsWithOpenAI(texts: string[]): Promise<number[][]> {
  try {
    // Check if OPENAI_API_KEY is defined
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts,
        dimensions: 768  // Match the database schema
      })
    });
    
    const responseText = await response.text();
    
    // Check if we got HTML instead of JSON
    if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
      console.error('Received HTML instead of JSON:', responseText.substring(0, 200) + '...');
      throw new Error('Received HTML response instead of JSON - API endpoint may be incorrect');
    }
    
    if (!response.ok) {
      console.error('OpenAI Embedding API error:', responseText);
      // Check for quota exceeded error
      if (responseText.includes('insufficient_quota')) {
        throw new Error('OpenAI API quota exceeded');
      }
      throw new Error(`OpenAI Embedding API error: ${response.status} ${response.statusText}`);
    }
    
    const data = JSON.parse(responseText);
    return data.data.map((item: any) => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings with OpenAI:', error);
    throw error;
  }
}

// New Gemini embedding function
async function generateEmbeddingWithGemini(text: string): Promise<number[]> {
  try {
    // Check if GOOGLE_GENERATIVE_AI_API_KEY is defined
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not defined in environment variables');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    
    // Use the correct embedding method from the models interface
    const result = await genAI.getGenerativeModel({ model: "text-embedding-004" }).embedContent(text);
    
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding with Gemini:', error);
    throw error;
  }
}

// Function to split text into chunks with improved context handling
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  
  // If text is smaller than chunk size, return as is
  if (text.length <= chunkSize) {
    return [text];
  }
  
  // Split text into sentences (basic sentence splitting)
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  let currentChunk = '';
  let currentChunkSentences: string[] = [];
  
  for (const sentence of sentences) {
    // Check if adding this sentence would exceed chunk size
    const testChunk = currentChunkSentences.length > 0 
      ? currentChunkSentences.join(' ') + ' ' + sentence 
      : sentence;
    
    if (testChunk.length > chunkSize && currentChunkSentences.length > 0) {
      // Finalize current chunk
      chunks.push(currentChunkSentences.join(' '));
      
      // Start new chunk with overlap
      if (overlap > 0 && currentChunkSentences.length > 1) {
        // Calculate how many sentences to include for overlap
        const overlapChars = Math.min(overlap, currentChunkSentences.join(' ').length);
        let overlapSentences: string[] = [];
        let overlapLength = 0;
        
        // Go backwards through sentences to build overlap
        for (let i = currentChunkSentences.length - 1; i >= 0; i--) {
          const sentenceLength = currentChunkSentences[i].length + 1; // +1 for space
          if (overlapLength + sentenceLength <= overlapChars) {
            overlapSentences.unshift(currentChunkSentences[i]);
            overlapLength += sentenceLength;
          } else {
            break;
          }
        }
        
        currentChunkSentences = overlapSentences;
        currentChunkSentences.push(sentence);
      } else {
        currentChunkSentences = [sentence];
      }
    } else {
      currentChunkSentences.push(sentence);
    }
  }
  
  // Don't forget the last chunk
  if (currentChunkSentences.length > 0) {
    chunks.push(currentChunkSentences.join(' '));
  }
  
  return chunks;
}

// Alternative chunking method using a sliding window approach
export function chunkTextSlidingWindow(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.slice(startIndex, endIndex);
    chunks.push(chunk);
    
    // Move start index by chunk size minus overlap
    startIndex = endIndex - overlap;
    
    // If we're at the end, break
    if (endIndex === text.length) {
      break;
    }
  }
  
  return chunks;
}

// Semantic chunking method that tries to keep related content together
export function chunkTextSemantic(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  // For now, we'll use the sentence-based approach as it provides better context
  return chunkText(text, chunkSize, overlap);
}