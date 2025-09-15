"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { RainbowButton } from "@/components/magicui/rainbow-button";

export default function MCPIntegrationPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChatbot, setSelectedChatbot] = useState<number | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Fetch chatbots
  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const response = await fetch('/api/chatbots');
        if (response.ok) {
          const data = await response.json();
          setChatbots(data);
          if (data.length > 0) {
            setSelectedChatbot(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch chatbots:', error);
        toast({
          title: "Error",
          description: "Failed to load chatbots",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChatbots();
  }, [toast]);

  // Generate API key
  const generateApiKey = async () => {
    try {
      // In a real implementation, this would call an API to generate a key
      // For demo purposes, we'll generate a mock key
      const mockKey = `mcp_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(mockKey);
      
      toast({
        title: "API Key Generated",
        description: "Your MCP API key has been generated",
      });
    } catch (error) {
      console.error('Failed to generate API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      });
    }
  };

  // Copy API key to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "API key copied to clipboard",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Error",
        description: "Failed to copy API key",
        variant: "destructive",
      });
    }
  };

  // Test MCP integration
  const testIntegration = async () => {
    if (!selectedChatbot || !testMessage.trim()) return;
    
    setIsTesting(true);
    setTestResponse('');
    
    try {
      // In a real implementation, this would call the MCP endpoint
      // For demo purposes, we'll simulate a response
      const response = await fetch(`/api/chatbots/${selectedChatbot}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          sessionId: 'mcp-test-' + Date.now()
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResponse(data.response);
        
        toast({
          title: "Test Successful",
          description: "MCP integration is working correctly",
        });
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Test failed:', error);
      setTestResponse('Error: Failed to get response from chatbot');
      toast({
        title: "Test Failed",
        description: "Failed to test MCP integration",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // MCP integration code
  const mcpCode = `// MCP Integration Example
import { MCPClient } from '@claw/mcp-client';

const client = new MCPClient({
  apiKey: '${apiKey || 'YOUR_API_KEY_HERE'}',
  baseUrl: 'http://localhost:3000'
});

// Get list of all chatbots
const chatbots = await client.listChatbots();

// Send message to a specific chatbot
const response = await client.sendMessage({
  chatbotId: ${selectedChatbot || 1},
  message: "Hello, how can you help me today?",
  context: {
    // Add any additional context here
    userId: "user_123",
    sessionId: "session_456"
  }
});

console.log(response);`;

  // Python MCP integration example
  const pythonCode = `# MCP Integration Example (Python)
import requests

API_KEY = "${apiKey || 'YOUR_API_KEY_HERE'}"
BASE_URL = "http://localhost:3000"

# Get list of all chatbots
def list_chatbots():
    headers = {"Authorization": f"Bearer {API_KEY}"}
    response = requests.get(f"{BASE_URL}/api/mcp", headers=headers)
    return response.json()

# Send message to a specific chatbot
def send_message(chatbot_id, message, context=None):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "chatbotId": chatbot_id,
        "message": message,
        "context": context or {}
    }
    response = requests.post(f"{BASE_URL}/api/mcp", headers=headers, json=data)
    return response.json()

# Example usage
chatbots = list_chatbots()
response = send_message(${selectedChatbot || 1}, "Hello, how can you help me today?", {
    "userId": "user_123",
    "sessionId": "session_456"
})
print(response)`;

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>MCP Integration</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-6 p-4 pt-0">
        <div>
          <h1 className="text-3xl font-bold">MCP Integration</h1>
          <p className="text-muted-foreground">Integrate your chatbots with Model Context Protocol tools like Claude, Cursor, and more</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* API Key Generation */}
          <Card>
            <CardHeader>
              <CardTitle>API Key Setup</CardTitle>
              <CardDescription>Generate an API key for MCP integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={apiKey}
                  readOnly
                  placeholder="Click 'Generate API Key' to create a key"
                />
                <Button
                  onClick={copyToClipboard}
                  disabled={!apiKey}
                  variant="outline"
                  size="icon"
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <RainbowButton onClick={generateApiKey} className="w-full">
                Generate API Key
              </RainbowButton>
              <p className="text-sm text-muted-foreground">
                This API key allows external tools to access your chatbots via the MCP protocol.
              </p>
            </CardContent>
          </Card>

          {/* Integration Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>How to integrate with MCP-compatible tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Supported Tools</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Claude (Anthropic)</li>
                  <li>Cursor IDE</li>
                  <li>Continue.dev</li>
                  <li>Any MCP-compatible tool</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Setup Steps</h3>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>Generate an API key above</li>
                  <li>Configure your MCP tool with the API key</li>
                  <li>Use the provided SDK or REST API</li>
                  <li>Test the integration using the panel on the right</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>Sample code for integrating with MCP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* JavaScript/TypeScript Example */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">JavaScript/TypeScript</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(mcpCode);
                      toast({
                        title: "Copied to clipboard",
                        description: "JavaScript code copied to clipboard",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-60">
                  <code>{mcpCode}</code>
                </pre>
              </div>
              
              {/* Python Example */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Python</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(pythonCode);
                      toast({
                        title: "Copied to clipboard",
                        description: "Python code copied to clipboard",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-60">
                  <code>{pythonCode}</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Integration</CardTitle>
            <CardDescription>Test your MCP integration with a sample message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chatbot">Select Chatbot</Label>
                <select
                  id="chatbot"
                  value={selectedChatbot || ''}
                  onChange={(e) => setSelectedChatbot(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                >
                  {chatbots.map((chatbot) => (
                    <option key={chatbot.id} value={chatbot.id}>
                      {chatbot.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Test Message</Label>
                <Input
                  id="message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a test message"
                  disabled={isTesting}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={testIntegration}
                disabled={!selectedChatbot || !testMessage.trim() || isTesting}
              >
                {isTesting ? "Testing..." : "Test Integration"}
              </Button>
            </div>
            
            {testResponse && (
              <div className="space-y-2">
                <Label>Response</Label>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{testResponse}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Learn more about MCP integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">API Endpoints</h3>
                <ul className="text-sm space-y-1">
                  <li><code>GET /api/mcp/chatbots</code> - List all chatbots</li>
                  <li><code>POST /api/mcp/chat</code> - Send message to chatbot</li>
                  <li><code>GET /api/mcp/chatbots/{'{id}'}</code> - Get chatbot details</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Authentication</h3>
                <p className="text-sm">
                  All requests must include the <code>Authorization: Bearer YOUR_API_KEY</code> header.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Rate Limits</h3>
                <p className="text-sm">
                  100 requests per minute per API key. Exceeding this limit will result in 429 errors.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}