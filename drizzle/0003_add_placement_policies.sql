-- Create placement policies for data distribution
-- Primary policy for main region
CREATE PLACEMENT POLICY primary_rule_for_region1 
PRIMARY_REGION="Region1" 
REGIONS="Region1,Region2,Region3";

-- Archive policy for cost-effective storage
CREATE PLACEMENT POLICY archive_policy 
PRIMARY_REGION="Region1" 
REGIONS="Region1" 
SCHEDULE="EVEN";

-- Apply placement policies to tables
-- Chatbots table - use primary policy for active data
ALTER TABLE chatbots PLACEMENT POLICY=primary_rule_for_region1;

-- Documents table - use primary policy for active data
ALTER TABLE documents PLACEMENT POLICY=primary_rule_for_region1;

-- Vectors table - use primary policy for active data
ALTER TABLE vectors PLACEMENT POLICY=primary_rule_for_region1;

-- Chat history table - use archive policy for older data
-- Note: This would typically be implemented with partitioning based on date
-- ALTER TABLE chat_history PLACEMENT POLICY=archive_policy;