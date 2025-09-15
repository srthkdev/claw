#!/bin/bash

# Test script for document ingestion
echo "Testing document ingestion..."

# First, we need to create a chatbot to test with
echo "Creating a test chatbot..."
curl -X POST http://localhost:3000/api/chatbots \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Chatbot",
    "config": {}
  }' | tee chatbot_response.json

# Extract chatbot ID from response (this would need to be parsed in a real script)
echo "Chatbot created. Please check chatbot_response.json for the ID."

echo "To test document ingestion, use the following command with the chatbot ID:"
echo "curl -X POST http://localhost:3000/api/chatbots/[CHATBOT_ID]/ingest \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d @scripts/test-document.json"

echo "Cleaning up..."
rm -f chatbot_response.json