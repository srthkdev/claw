-- Fix the vectors table to use proper VECTOR type with correct dimensions
-- First, create a new table with the correct schema
CREATE TABLE IF NOT EXISTS `vectors_new` (
  `id` int AUTO_INCREMENT NOT NULL,
  `document_id` int NOT NULL,
  `content` text,
  `embedding` VECTOR<FLOAT>(768),
  `metadata` json,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `vectors_new_id` PRIMARY KEY(`id`)
);

-- Add foreign key constraint (without explicit name to avoid conflicts)
ALTER TABLE `vectors_new` ADD FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE no action ON UPDATE no action;

-- Add TiFlash replica for vector index support
ALTER TABLE `vectors_new` SET TIFLASH REPLICA 1;

-- Add HNSW index for efficient similarity search (with columnar replica on demand)
ALTER TABLE `vectors_new` 
ADD VECTOR INDEX `idx_embedding` ((VEC_COSINE_DISTANCE(`embedding`))) USING HNSW ADD_COLUMNAR_REPLICA_ON_DEMAND;

-- Add index on document_id for faster joins
ALTER TABLE `vectors_new` 
ADD INDEX `idx_document_id` (`document_id`);

-- Note: Data migration would need to be done separately as it requires converting JSON to VECTOR format
-- For now, we'll just create the new table structure