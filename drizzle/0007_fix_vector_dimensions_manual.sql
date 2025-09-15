-- Manual migration to fix vector dimensions from 1536 to 768
-- First drop the existing vector index
ALTER TABLE `vectors_new` DROP INDEX `idx_embedding`;

-- Then modify the embedding column to use 768 dimensions
ALTER TABLE `vectors_new` MODIFY COLUMN `embedding` VECTOR<FLOAT>(768);

-- Recreate the vector index
ALTER TABLE `vectors_new` ADD VECTOR INDEX `idx_embedding` ((VEC_COSINE_DISTANCE(`embedding`))) USING HNSW ADD_COLUMNAR_REPLICA_ON_DEMAND;