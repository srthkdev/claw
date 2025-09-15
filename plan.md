# AI Chatbot Maker with TiDB Vector Search - Hackathon Plan

Based on the hackathon requirements and your existing project, I'll outline a detailed plan for building an AI application that allows users to create chatbots from documentation sites or GitHub repositories using TiDB Vector Search.

## Core Features

### 1. Data Ingestion & Processing
- **Website Documentation Ingestion**: Users can input a documentation URL to crawl and process
- **GitHub Repository Integration**: Connect to GitHub repositories to extract documentation and code
- **Content Processing Pipeline**: 
  - Extract text content from web pages and markdown files
  - Chunk content into manageable pieces for vector embedding
  - Store processed content with metadata in TiDB

### 2. Vector Search Implementation
- **Embedding Generation**: Use OpenAI or other embedding models to convert text chunks to vectors
- **Vector Storage**: Store embeddings in TiDB with vector data type
- **Similarity Search**: Implement cosine similarity search for relevant content retrieval

### 3. Chatbot Engine
- **Conversational Interface**: Real-time chat interface for interacting with the AI assistant
- **Context Management**: Maintain conversation history for contextual responses
- **Hybrid Search**: Combine vector search with full-text search for better results

### 4. Script Tag Generator
- **Custom Widget**: Generate a script tag that users can embed on their websites
- **Customization Options**: Allow styling and positioning customization
- **Domain Restrictions**: Configure which domains can use the widget

## Technical Architecture

### Frontend (Next.js)
- Dashboard for managing chatbots
- Configuration interface for data sources
- Chat interface for testing
- Script tag generator UI

### Backend (Next.js API Routes)
- Data ingestion service
- Vector embedding processor
- Search API endpoints
- Chatbot response generator

### Database (TiDB Cloud)
- **Documents Table**: Store original content with metadata
- **Vectors Table**: Store embeddings with references to documents
- **Chat History**: Store conversation history
- **Chatbots Table**: Configuration for each chatbot instance

## Implementation Plan

### Phase 1: Data Ingestion System
1. Create data source connectors:
   - Web crawler for documentation sites
   - GitHub API integration for repositories
2. Implement content processing pipeline:
   - Text extraction from HTML/Markdown
   - Content chunking algorithm
   - Metadata extraction

### Phase 2: Vector Search Integration
1. Set up embedding service (OpenAI embeddings)
2. Create database schema for vector storage
3. Implement ingestion pipeline:
   - Generate embeddings for content chunks
   - Store in TiDB with vector data type
4. Build search functionality:
   - Vector similarity search
   - Hybrid search with full-text

### Phase 3: Chatbot Engine
1. Implement chat API endpoint
2. Create prompt engineering system
3. Add conversation memory management
4. Integrate with LLM (OpenAI, Claude, etc.)

### Phase 4: Script Tag Generator
1. Create widget UI component
2. Implement script tag generator
3. Add customization options
4. Create installation instructions

### Phase 5: Dashboard & UI
1. Chatbot management dashboard
2. Data source configuration
3. Analytics and usage metrics
4. Testing interface

## TiDB Cloud Features Integration

### Vector Search
- Use TiDB's native `VECTOR` data type for storing embeddings
- Implement HNSW (Hierarchical Navigable Small World) vector indexes for efficient similarity search
- Use `VEC_COSINE_DISTANCE` function for calculating similarity between query vectors and stored embeddings
- Leverage TiDB's Approximate Nearest Neighbor (ANN) search capabilities for fast retrieval

Example vector search query:
```sql
SELECT id, document, VEC_COSINE_DISTANCE(embedding, '[1,2,3]') AS distance
FROM embedded_documents
ORDER BY distance
LIMIT 3;
```

### Full-Text Search
- Combine with vector search for hybrid retrieval using TiDB's full-text search capabilities
- Implement weighted scoring between vector similarity and text relevance
- Use traditional SQL text search functions for keyword matching

### Multi-Cluster Placement
- Store frequently accessed data in performance-tier clusters
- Archive older data in cost-effective storage
- Implement data placement policies for disaster recovery and performance optimization

Example placement policy:
```sql
CREATE PLACEMENT POLICY primary_rule_for_region1 
PRIMARY_REGION="Region1" 
REGIONS="Region1,Region2,Region3";

ALTER TABLE chatbots PLACEMENT POLICY=primary_rule_for_region1;
```

### TiDB Vector Indexing
- Create HNSW vector indexes for efficient similarity search:
```sql
CREATE TABLE documents (
    id INT PRIMARY KEY,
    content TEXT,
    embedding VECTOR(768), -- For OpenAI embeddings
    VECTOR INDEX idx_embedding ((VEC_COSINE_DISTANCE(embedding)))
);
```

- Use post-filtering techniques to leverage vector indexes with additional filters:
```sql
SELECT * FROM (
  SELECT * FROM documents
  ORDER BY VEC_COSINE_DISTANCE(embedding, '[1, 2, 3]')
  LIMIT 10
) t
WHERE category = "documentation";
```

## API Integrations

1. **OpenAI API**: For embeddings and chat completions
2. **GitHub API**: For repository access
3. **Web Scraping Service**: For documentation site processing
4. **Authentication**: Clerk for user management

## Database Schema Design

```sql
-- Documents table
CREATE TABLE documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  chatbot_id BIGINT,
  url TEXT,
  content TEXT,
  content_type ENUM('web_page', 'markdown', 'pdf', 'code'),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vectors table with HNSW index
CREATE TABLE vectors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  document_id BIGINT,
  content TEXT,
  embedding VECTOR(768), -- For OpenAI embeddings
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  VECTOR INDEX idx_embedding ((VEC_COSINE_DISTANCE(embedding))) USING HNSW
);

-- Chatbots table
CREATE TABLE chatbots (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id TEXT,
  name VARCHAR(255),
  config JSON,
  script_config JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chat history table
CREATE TABLE chat_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  chatbot_id BIGINT,
  session_id VARCHAR(255),
  role ENUM('user', 'assistant'),
  content TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (extending existing schema)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Considerations

1. **Data Privacy**: Ensure user data is isolated and protected
2. **API Key Management**: Secure storage of third-party API keys
3. **Rate Limiting**: Prevent abuse of the chatbot service
4. **Domain Verification**: Verify ownership before widget deployment
5. **Vector Data Encryption**: Encrypt sensitive vector data at rest

## Performance Optimization

1. **Caching**: Cache frequently accessed embeddings and search results
2. **Batch Processing**: Process documents in batches for efficiency
3. **Indexing**: Proper database indexing for search performance
4. **CDN**: Serve widget assets through CDN
5. **Connection Pooling**: Use connection pooling for database connections
6. **Vector Index Maintenance**: Regularly compact TiFlash delta layers for optimal vector search performance

## TiDB-Specific Optimizations

1. **Vector Index Usage**: Ensure queries use `LIMIT` clause to leverage vector indexes
2. **Proper Filtering**: Use post-filtering techniques to maintain vector index usage
3. **Dimension Consistency**: Maintain consistent vector dimensions for all embeddings
4. **Placement Policies**: Use placement policies for data distribution across regions
5. **Monitoring**: Monitor vector index build progress using `INFORMATION_SCHEMA.TIFLASH_INDEXES`

This plan leverages your existing Next.js foundation with Clerk authentication and integrates TiDB Vector Search to create a powerful AI chatbot platform that meets all hackathon requirements. The implementation will showcase real-world problem solving by enabling businesses to create custom AI assistants from their existing documentation.