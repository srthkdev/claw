import { db } from '@/lib/db';
import { chatbots, documents, vectors } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { chunkTextSemantic, generateEmbeddings } from '@/lib/embeddings';
import { storeEmbedding } from '@/lib/vector-search';
import { extractDocumentationFiles } from '@/lib/github';
import { crawlDocumentationSite } from '@/lib/web-crawler';

// Ingest a document for a chatbot
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const chatbotId = parseInt(params.id);
    
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: 'Invalid chatbot ID' }, { status: 400 });
    }
    
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
    
    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }
    
    if (chatbot.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { url, content, contentType, metadata, sourceType, githubRepo } = await request.json();
    
    let documentsToProcess = [];
    
    // Handle different source types
    if (sourceType === 'github' && githubRepo) {
      // Check if GITHUB_TOKEN is configured
      if (!process.env.GITHUB_TOKEN) {
        return NextResponse.json({ 
          error: 'GitHub integration is not configured. Please set the GITHUB_TOKEN environment variable to enable GitHub repository ingestion.' 
        }, { status: 500 });
      }
      
      // Extract owner and repo from githubRepo (format: owner/repo)
      const [owner, repo] = githubRepo.split('/');
      if (!owner || !repo || owner.trim() === '' || repo.trim() === '') {
        return NextResponse.json({ error: 'Invalid GitHub repository format. Please use the format: owner/repository (e.g., microsoft/TypeScript)' }, { status: 400 });
      }
      
      try {
        // Extract documentation files from GitHub repository
        const githubFiles = await extractDocumentationFiles(owner, repo);
        
        documentsToProcess = githubFiles.map(file => ({
          url: `https://github.com/${owner}/${repo}/blob/main/${file.path}`,
          content: file.content,
          contentType: getFileContentType(file.type),
          metadata: {
            source: 'github',
            owner,
            repo,
            path: file.path,
            ...metadata
          }
        }));
      } catch (error: any) {
        console.error('Error extracting GitHub documentation files:', error);
        return NextResponse.json({ 
          error: `Failed to extract documentation files from GitHub repository: ${error.message || 'Unknown error'}`
        }, { status: 500 });
      }
    } else if (sourceType === 'website' && url) {
      // Crawl documentation site
      const crawledDocuments = await crawlDocumentationSite(url);
      
      documentsToProcess = crawledDocuments.map(doc => ({
        url: doc.url,
        content: doc.content,
        contentType: 'web_page',
        metadata: {
          source: 'website',
          title: doc.title,
          ...metadata
        }
      }));
    } else if (content) {
      // Manual content ingestion (existing functionality)
      documentsToProcess = [{
        url: url || null,
        content,
        contentType: contentType || 'web_page',
        metadata: metadata || {}
      }];
    } else {
      return NextResponse.json({ error: 'Content, URL, or GitHub repository is required' }, { status: 400 });
    }
    
    // Process all documents
    const processedDocuments = [];
    let totalEmbeddings = 0;
    
    for (const docData of documentsToProcess) {
      // Insert document
      await db.insert(documents).values({
        chatbotId,
        url: docData.url,
        content: docData.content,
        contentType: docData.contentType,
        metadata: docData.metadata
      });
      
      // Get the inserted document by selecting the last inserted document for this chatbot
      const [newDocument] = await db.select().from(documents)
        .where(eq(documents.chatbotId, chatbotId))
        .orderBy(desc(documents.id))
        .limit(1);
      
      // Chunk the content using improved semantic chunking
      const chunks = chunkTextSemantic(docData.content, 1000, 200);
      
      // Generate embeddings for chunks
      const embeddings = await generateEmbeddings(chunks);
      
      // Store embeddings in the database
      for (let i = 0; i < chunks.length; i++) {
        await storeEmbedding(
          newDocument.id,
          chunks[i],
          embeddings[i]
        );
      }
      
      processedDocuments.push(newDocument);
      totalEmbeddings += chunks.length;
    }
    
    return NextResponse.json({
      message: 'Documents ingested successfully',
      documents: processedDocuments,
      totalDocuments: processedDocuments.length,
      totalEmbeddings
    });
  } catch (error: any) {
    console.error('Error ingesting document:', error);
    // Handle Kimi AI specific errors
    if (error?.response?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded on embedding service. Please try again later.' }, { status: 429 });
    }
    if (error?.response?.status === 401) {
      return NextResponse.json({ error: 'Authentication error with embedding service.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to ingest document: ' + error.message }, { status: 500 });
  }
}

// Get all documents for a chatbot
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const chatbotId = parseInt(params.id);
    
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: 'Invalid chatbot ID' }, { status: 400 });
    }
    
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
    
    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }
    
    if (chatbot.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const chatbotDocuments = await db.select().from(documents).where(eq(documents.chatbotId, chatbotId));
    
    return NextResponse.json(chatbotDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// Helper function to determine content type from file extension
function getFileContentType(fileType: string): string {
  const typeMap: { [key: string]: string } = {
    'md': 'markdown',
    'mdx': 'markdown',
    'txt': 'text',
    'html': 'web_page',
    'htm': 'web_page',
    'rst': 'text',
    'adoc': 'text',
    'asciidoc': 'text',
    'wiki': 'text',
    'mediawiki': 'text',
    'tex': 'text',
    'latex': 'text',
    'pdf': 'pdf',
  };
  
  return typeMap[fileType] || 'text';
}