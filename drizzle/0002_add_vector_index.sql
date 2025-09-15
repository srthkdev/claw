-- Add HNSW vector index to vectors table
ALTER TABLE `vectors` 
MODIFY COLUMN `embedding` VECTOR(FLOAT, 768);

-- Add HNSW index for efficient similarity search
ALTER TABLE `vectors` 
ADD VECTOR INDEX `idx_embedding` ((VEC_COSINE_DISTANCE(`embedding`))) USING HNSW;

-- Add index on document_id for faster joins
ALTER TABLE `vectors` 
ADD INDEX `idx_document_id` (`document_id`);