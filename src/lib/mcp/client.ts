// MCP Client SDK for interacting with the chatbot API
export class MCPClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(options: { baseUrl: string; apiKey: string }) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all chatbots
  async listChatbots(): Promise<any[]> {
    return this.request('/api/mcp');
  }

  // Get a specific chatbot by ID
  async getChatbot(id: number): Promise<any> {
    return this.request(`/api/mcp/chatbots/${id}`);
  }

  // Send a message to a chatbot
  async sendMessage(options: {
    chatbotId: number;
    message: string;
    context?: Record<string, any>;
  }): Promise<{ response: string; sessionId: string }> {
    return this.request('/api/mcp', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }
}

// Default export
export default MCPClient;