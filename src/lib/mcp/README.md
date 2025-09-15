# Claw MCP Client SDK

This SDK allows you to integrate Claw Chatbot Maker with MCP-compatible tools like Claude, Cursor, and Continue.dev.

## Installation

```bash
npm install @claw/mcp-client
```

## Usage

```javascript
import { MCPClient } from '@claw/mcp-client';

const client = new MCPClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000' // or your deployed URL
});

// List all chatbots
const chatbots = await client.listChatbots();

// Send a message to a specific chatbot
const response = await client.sendMessage({
  chatbotId: 1,
  message: "Hello, how can you help me today?",
  context: {
    userId: "user_123",
    sessionId: "session_456"
  }
});

console.log(response.response);
```

## API Reference

### `MCPClient(options)`

Creates a new MCP client instance.

**Options:**
- `apiKey` (string): Your MCP API key
- `baseUrl` (string): The base URL of your Claw instance

### `listChatbots()`

Returns a list of all chatbots available to your account.

### `getChatbot(id)`

Returns details about a specific chatbot.

**Parameters:**
- `id` (number): The ID of the chatbot

### `sendMessage(options)`

Sends a message to a chatbot and returns the response.

**Options:**
- `chatbotId` (number): The ID of the chatbot to send the message to
- `message` (string): The message to send
- `context` (object, optional): Additional context to pass to the chatbot

## Integration with MCP Tools

### Claude (Anthropic)

To integrate with Claude, you'll need to configure the MCP connection in your Claude settings.

### Cursor IDE

In Cursor, you can configure the MCP connection in the settings under "Model Context Protocol".

### Continue.dev

For Continue.dev, add the following to your `config.json`:

```json
{
  "mcpServers": {
    "claw": {
      "command": "node",
      "args": ["-e", "console.log('MCP connection established')"],
      "env": {
        "CLAW_API_KEY": "your-api-key",
        "CLAW_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Authentication

All requests require an API key which can be generated in the Claw dashboard under the MCP Integration section.

## Rate Limits

The API is rate-limited to 100 requests per minute per API key. Exceeding this limit will result in 429 errors.

## Support

For support, please contact the Claw team or open an issue on our GitHub repository.