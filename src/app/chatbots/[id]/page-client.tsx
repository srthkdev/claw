"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Conversation, 
  ConversationContent, 
  ConversationEmptyState,
  ConversationScrollButton
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageAvatar } from "@/components/ai-elements/message";
import { 
  PromptInput, 
  PromptInputBody, 
  PromptInputTextarea, 
  PromptInputToolbar, 
  PromptInputSubmit 
} from "@/components/ai-elements/prompt-input";
import { Loader2, SendIcon, Share2 } from "lucide-react";
import { useTheme } from "next-themes";
import { FormEvent } from 'react';
import { useUser } from '@clerk/nextjs';
import { MarkdownViewer } from "@/components/markdown-viewer";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CustomizationConfig {
  customTitle?: string;
  customPlaceholder?: string;
  customWelcomeMessage?: string;
  showBranding?: boolean;
  headerColor?: string;
  botAvatar?: string;
  userAvatar?: string;
}

interface PromptInputMessage {
  text?: string;
  files?: any[];
}

export default function ChatbotPageClient({ 
  chatbotId, 
  chatbotName,
  customization 
}: { 
  chatbotId: number; 
  chatbotName: string;
  customization: CustomizationConfig;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome-" + Date.now(),
      role: "assistant",
      content: customization.customWelcomeMessage || `Hello! I'm your ${chatbotName} assistant. How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [chatbotName, customization.customWelcomeMessage]);

  const handleSubmit = async (message: PromptInputMessage, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const messageText = message.text;
    
    if (!messageText || !messageText.trim() || isLoading) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Send to chatbot API
      const response = await fetch(`/api/chatbots/${chatbotId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          sessionId: 'direct-chat-' + chatbotId // Unique session for direct chat
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle share functionality
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Show a toast notification or some feedback
      alert('Chat URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL. Please copy it manually: ' + window.location.href);
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Determine header text color based on background
  const getHeaderTextColor = () => {
    const bgColor = customization.headerColor || (resolvedTheme === "dark" ? "#1f2937" : "#f9fafb");
    // Simple heuristic: if the color is dark, use light text, otherwise use dark text
    if (bgColor.startsWith('#')) {
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? 'text-gray-900' : 'text-white';
    }
    return resolvedTheme === "dark" ? 'text-white' : 'text-gray-900';
  };

  // Get bot avatar with fallback
  const getBotAvatar = () => {
    return customization.botAvatar || "/bot-avatar.svg";
  };

  // Get user avatar with fallback
  const getUserAvatar = () => {
    return user?.imageUrl || customization.userAvatar || "/user-avatar.svg";
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto w-full bg-background relative">
      {/* Flickering Grid Background */}
      <FlickeringGrid
        squareSize={4}
        gridGap={6}
        flickerChance={0.1}
        color={resolvedTheme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
        maxOpacity={0.05}
        className="fixed inset-0 z-[-1]"
      />
      
      {/* Header with user chosen color */}
      <header 
        className={`p-4 border-b rounded-t-xl relative ${getHeaderTextColor()}`}
        style={{ backgroundColor: customization.headerColor || (resolvedTheme === "dark" ? "#1f2937" : "#f9fafb") }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {customization.customTitle || `${chatbotName} Assistant`}
          </h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className={getHeaderTextColor().includes('white') ? 'text-white hover:bg-white/20' : 'text-gray-900 hover:bg-gray-900/10'}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Conversation className="flex-1 bg-background/90 backdrop-blur-sm rounded-b-xl">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState 
                title="No messages yet" 
                description="Start a conversation to see messages here" 
              />
            ) : (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageAvatar 
                    src={message.role === "user" 
                      ? getUserAvatar() 
                      : getBotAvatar()}
                    name={message.role === "user" ? (user?.fullName || user?.username || "You") : chatbotName}
                  />
                  <MessageContent variant="contained">
                    <MarkdownViewer content={message.content} />
                  </MessageContent>
                </Message>
              ))
            )}
            <div ref={messagesEndRef} />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Area */}
        <div className="border-t p-4 bg-background/90 backdrop-blur-sm rounded-b-xl">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={customization.customPlaceholder || "Type your message..."}
                disabled={isLoading}
                className="min-h-16"
              />
              <PromptInputToolbar>
                <PromptInputSubmit 
                  status={isLoading ? "submitted" : undefined}
                  disabled={isLoading || !inputValue.trim()}
                  className="ml-auto"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendIcon className="h-4 w-4" />
                  )}
                </PromptInputSubmit>
              </PromptInputToolbar>
            </PromptInputBody>
          </PromptInput>
        </div>
      </div>

      {/* Branding */}
      {customization.showBranding !== false && (
        <footer className="p-2 text-center text-xs text-muted-foreground border-t bg-background/90 backdrop-blur-sm rounded-b-xl">
          Powered by TiDB & AI
        </footer>
      )}
    </div>
  );
}