-- Update content_type enum to include new values
ALTER TABLE `documents` 
MODIFY COLUMN `content_type` ENUM('web_page', 'markdown', 'pdf', 'text', 'code');