-- Update vector dimensions from 1536 to 768 to match embedding model output
-- Drop the existing table and recreate with correct dimensions
DROP TABLE IF EXISTS `vectors_new`;

-- Create the table with correct vector dimensions (768)
CREATE TABLE `vectors_new` (
  `id` int AUTO_INCREMENT NOT NULL,
  `document_id` int NOT NULL,
  `content` text,
  `embedding` VECTOR<FLOAT>(768),
  `metadata` json,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `vectors_new_id` PRIMARY KEY(`id`)
);

-- Add foreign key constraint
ALTER TABLE `vectors_new` ADD FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE no action ON UPDATE no action;

-- Add TiFlash replica for vector index support
ALTER TABLE `vectors_new` SET TIFLASH REPLICA 1;

-- Add HNSW index for efficient similarity search
ALTER TABLE `vectors_new` 
ADD VECTOR INDEX `idx_embedding` ((VEC_COSINE_DISTANCE(`embedding`))) USING HNSW ADD_COLUMNAR_REPLICA_ON_DEMAND;

-- Add index on document_id for faster joins
ALTER TABLE `vectors_new` 
ADD INDEX `idx_document_id` (`document_id`);