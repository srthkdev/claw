"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Conversation, 
  ConversationContent, 
  ConversationEmptyState
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageAvatar } from "@/components/ai-elements/message";
import { 
  PromptInput, 
  PromptInputBody, 
  PromptInputTextarea, 
  PromptInputToolbar, 
  PromptInputSubmit 
} from "@/components/ai-elements/prompt-input";
import { Loader2, SendIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { MarkdownViewer } from "@/components/markdown-viewer";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotPreviewProps {
  customTitle?: string;
  customPlaceholder?: string;
  customWelcomeMessage?: string;
  showBranding?: boolean;
  headerColor?: string;
  botAvatar?: string;
  userAvatar?: string;
  chatbotName: string;
}

export function ChatbotPreview({ 
  customTitle, 
  customPlaceholder, 
  customWelcomeMessage, 
  showBranding = true,
  headerColor = "#3b82f6",
  botAvatar,
  userAvatar,
  chatbotName
}: ChatbotPreviewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: customWelcomeMessage || `Hello! I'm your ${chatbotName} assistant. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { resolvedTheme } = useTheme();

  // Determine header text color based on background
  const getHeaderTextColor = () => {
    if (headerColor.startsWith('#')) {
      const hex = headerColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? 'text-gray-900' : 'text-white';
    }
    return 'text-white';
  };

  // Get bot avatar with fallback
  const getBotAvatar = () => {
    return botAvatar || "/bot-avatar.svg";
  };

  // Get user avatar with fallback
  const getUserAvatar = () => {
    return userAvatar || "/user-avatar.svg";
  };

  return (
    <div className="flex flex-col h-[500px] max-w-md mx-auto w-full border rounded-lg overflow-hidden">
      {/* Header */}
      <header 
        className={`p-3 ${getHeaderTextColor()}`}
        style={{ backgroundColor: headerColor }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold">
            {customTitle || `${chatbotName} Assistant`}
          </h3>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <Conversation className="flex-1 bg-background">
          <ConversationContent>
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageAvatar 
                  src={message.role === "user" 
                    ? getUserAvatar() 
                    : getBotAvatar()}
                  name={message.role === "user" ? "You" : chatbotName}
                />
                <MessageContent variant="contained">
                  <MarkdownViewer content={message.content} />
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>

        {/* Input Area */}
        <div className="border-t p-3 bg-background">
          <PromptInput onSubmit={() => {}}>
            <PromptInputBody>
              <PromptInputTextarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={customPlaceholder || "Type your message..."}
                disabled={isLoading}
                className="min-h-12 text-sm"
              />
              <PromptInputToolbar>
                <PromptInputSubmit 
                  status={isLoading ? "submitted" : undefined}
                  disabled={isLoading || !inputValue.trim()}
                  className="ml-auto h-8 w-8"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <SendIcon className="h-3 w-3" />
                  )}
                </PromptInputSubmit>
              </PromptInputToolbar>
            </PromptInputBody>
          </PromptInput>
        </div>
      </div>

      {/* Branding */}
      {showBranding && (
        <footer className="p-2 text-center text-xs text-muted-foreground border-t bg-background">
          Powered by TiDB & AI
        </footer>
      )}
    </div>
  );
}