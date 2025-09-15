"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Copy, Check } from "lucide-react";
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
import { ChatbotPreview } from "@/components/chatbot-preview";

interface Chatbot {
  id: number;
  name: string;
  scriptConfig: {
    position?: string;
    theme?: string;
    allowedDomains?: string[];
    customTitle?: string;
    customPlaceholder?: string;
    customWelcomeMessage?: string;
    customButtonLabel?: string;
    showBranding?: boolean;
    headerColor?: string;
    botAvatar?: string;
    userAvatar?: string;
  };
}

export default function CustomizePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const chatbotId = params.id as string;
  
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [directUrl, setDirectUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Customization states
  const [customTitle, setCustomTitle] = useState("");
  const [customPlaceholder, setCustomPlaceholder] = useState("");
  const [customWelcomeMessage, setCustomWelcomeMessage] = useState("");
  const [showBranding, setShowBranding] = useState(true);
  const [headerColor, setHeaderColor] = useState("#3b82f6");
  const [botAvatar, setBotAvatar] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  // Fetch chatbot data
  useEffect(() => {
    const fetchChatbot = async () => {
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chatbot');
        }
        const data = await response.json();
        setChatbot(data);
        
        // Set initial config values
        setCustomTitle(data.scriptConfig?.customTitle || `${data.name} Assistant`);
        setCustomPlaceholder(data.scriptConfig?.customPlaceholder || "Type your message...");
        setCustomWelcomeMessage(data.scriptConfig?.customWelcomeMessage || `Hello! I'm your ${data.name} assistant. How can I help you today?`);
        setShowBranding(data.scriptConfig?.showBranding !== false);
        setHeaderColor(data.scriptConfig?.headerColor || "#3b82f6");
        setBotAvatar(data.scriptConfig?.botAvatar || "");
        setUserAvatar(data.scriptConfig?.userAvatar || "");
        
        // Set direct URL with slug format
        const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${data.id}`;
        setDirectUrl(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chatbots/${slug}`);
      } catch (err) {
        setError('Failed to load chatbot data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatbot();
  }, [chatbotId]);

  // Update customization configuration
  const handleUpdateConfig = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/script`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptConfig: {
            customTitle: customTitle.trim() || undefined,
            customPlaceholder: customPlaceholder.trim() || undefined,
            customWelcomeMessage: customWelcomeMessage.trim() || undefined,
            showBranding,
            headerColor: headerColor || undefined,
            botAvatar: botAvatar.trim() || undefined,
            userAvatar: userAvatar.trim() || undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update customization configuration');
      }

      // Fetch updated chatbot data to get the latest name
      const updatedResponse = await fetch(`/api/chatbots/${chatbotId}`);
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setChatbot(updatedData);
        
        // Update the direct URL with the latest chatbot name
        const slug = `${updatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${updatedData.id}`;
        setDirectUrl(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chatbots/${slug}`);
      }

      toast({
        title: "Configuration updated",
        description: "Your chatbot customization has been saved.",
      });
    } catch (err) {
      console.error('Error updating customization config:', err);
      toast({
        title: "Error",
        description: "Failed to update configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Copy direct URL to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(directUrl);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The direct URL has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      toast({
        title: "Error",
        description: "Failed to copy URL. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading chatbot...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Chatbot not found</div>
      </div>
    );
  }

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
                <BreadcrumbPage>Customize Chatbot</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customize Chatbot</h1>
            <p className="text-muted-foreground">Customize your direct access chatbot page</p>
          </div>
          <RainbowButton variant="outline" onClick={() => router.back()}>
            Back to Chatbots
          </RainbowButton>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customization Options</CardTitle>
              <CardDescription>
                Customize the appearance and behavior of your direct access chatbot page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  placeholder="Assistant"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="placeholder">Input Placeholder</Label>
                <Input
                  id="placeholder"
                  placeholder="Type your message..."
                  value={customPlaceholder}
                  onChange={(e) => setCustomPlaceholder(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcome">Welcome Message</Label>
                <Textarea
                  id="welcome"
                  placeholder="Hello! How can I help you today?"
                  value={customWelcomeMessage}
                  onChange={(e) => setCustomWelcomeMessage(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="header-color">Header Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="header-color"
                    type="color"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bot-avatar">Bot Avatar URL</Label>
                <Input
                  id="bot-avatar"
                  placeholder="https://example.com/bot-avatar.png"
                  value={botAvatar}
                  onChange={(e) => setBotAvatar(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user-avatar">User Avatar URL</Label>
                <Input
                  id="user-avatar"
                  placeholder="https://example.com/user-avatar.png"
                  value={userAvatar}
                  onChange={(e) => setUserAvatar(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="branding"
                  checked={showBranding}
                  onChange={(e) => setShowBranding(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="branding">Show branding</Label>
              </div>
              
              <RainbowButton onClick={handleUpdateConfig} className="w-full">
                Save Customization
              </RainbowButton>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Direct Access</CardTitle>
              <CardDescription>
                Share this URL to give users direct access to your chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  value={directUrl}
                  readOnly
                  className="pr-20"
                />
                <RainbowButton
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={handleCopyUrl}
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </RainbowButton>
              </div>
              
              <Alert>
                <AlertDescription>
                  Users can access your chatbot directly through this URL without needing to embed a script.
                  The URL uses a friendly format with the chatbot name and ID.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <a href={directUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Direct Page
                  </a>
                </Button>
              </div>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    How your chatbot will look with current settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ChatbotPreview
                    customTitle={customTitle}
                    customPlaceholder={customPlaceholder}
                    customWelcomeMessage={customWelcomeMessage}
                    showBranding={showBranding}
                    headerColor={headerColor}
                    botAvatar={botAvatar}
                    userAvatar={userAvatar}
                    chatbotName={chatbot.name}
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}