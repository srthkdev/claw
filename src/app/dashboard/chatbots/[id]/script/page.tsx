"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  };
}

export default function ScriptPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const chatbotId = params.id as string;
  
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [scriptTag, setScriptTag] = useState("");
  const [position, setPosition] = useState("bottom-right");
  const [theme, setTheme] = useState("light");
  const [allowedDomains, setAllowedDomains] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customPlaceholder, setCustomPlaceholder] = useState("");
  const [customWelcomeMessage, setCustomWelcomeMessage] = useState("");
  const [customButtonLabel, setCustomButtonLabel] = useState("");
  const [showBranding, setShowBranding] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setPosition(data.scriptConfig?.position || "bottom-right");
        setTheme(data.scriptConfig?.theme || "light");
        setAllowedDomains(data.scriptConfig?.allowedDomains?.join(', ') || "");
        setCustomTitle(data.scriptConfig?.customTitle || `${data.name} Assistant`);
        setCustomPlaceholder(data.scriptConfig?.customPlaceholder || "Type your message...");
        setCustomWelcomeMessage(data.scriptConfig?.customWelcomeMessage || `Hello! I'm your ${data.name} assistant. How can I help you today?`);
        setCustomButtonLabel(data.scriptConfig?.customButtonLabel || "Chat with us");
        setShowBranding(data.scriptConfig?.showBranding !== false);
      } catch (err) {
        setError('Failed to load chatbot data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatbot();
  }, [chatbotId]);

  // Generate script tag
  useEffect(() => {
    if (chatbot) {
      const config = {
        position,
        theme,
        customTitle,
        customPlaceholder,
        customWelcomeMessage,
        customButtonLabel,
        showBranding,
      };
      
      const script = `<!-- ${chatbot.name} Chatbot Widget -->
<script>
  window.chatbotConfig = {
    chatbotId: ${chatbot.id},
    position: '${position}',
    theme: '${theme}',
    baseUrl: '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}',
    customTitle: '${customTitle}',
    customPlaceholder: '${customPlaceholder}',
    customWelcomeMessage: \`${customWelcomeMessage}\`,
    customButtonLabel: '${customButtonLabel}',
    showBranding: ${showBranding},
  };
</script>
<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chatbot-widget.js" defer></script>
<!-- End ${chatbot.name} Chatbot Widget -->`;
      
      setScriptTag(script);
    }
  }, [chatbot, position, theme, customTitle, customPlaceholder, customWelcomeMessage, customButtonLabel, showBranding]);

  // Update script configuration
  const handleUpdateConfig = async () => {
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/script`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptConfig: {
            position,
            theme,
            allowedDomains: allowedDomains.trim() ? allowedDomains.split(',').map(d => d.trim()) : undefined,
            customTitle: customTitle.trim() || undefined,
            customPlaceholder: customPlaceholder.trim() || undefined,
            customWelcomeMessage: customWelcomeMessage.trim() || undefined,
            customButtonLabel: customButtonLabel.trim() || undefined,
            showBranding,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update script configuration');
      }

      toast({
        title: "Configuration updated",
        description: "Your chatbot widget configuration has been saved.",
      });
    } catch (err) {
      console.error('Error updating script config:', err);
      toast({
        title: "Error",
        description: "Failed to update configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Copy script to clipboard
  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(scriptTag);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The script tag has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy script:', err);
      toast({
        title: "Error",
        description: "Failed to copy script. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Copy code snippets to clipboard
  const handleCopyCode = async (code: string, message: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied to clipboard",
        description: message,
      });
    } catch (err) {
      console.error('Failed to copy code:', err);
      toast({
        title: "Error",
        description: "Failed to copy code. Please try again.",
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

  // HTML Integration Guide
  const htmlGuide = `<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- ${chatbot.name} Chatbot Widget -->
    <script>
      window.chatbotConfig = {
        chatbotId: ${chatbot.id},
        position: '${position}',
        theme: '${theme}',
        baseUrl: '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}',
        customTitle: '${customTitle}',
        customPlaceholder: '${customPlaceholder}',
        customWelcomeMessage: \`${customWelcomeMessage}\`,
        customButtonLabel: '${customButtonLabel}',
        showBranding: ${showBranding},
      };
    </script>
    <script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chatbot-widget.js" defer></script>
    <!-- End ${chatbot.name} Chatbot Widget -->
    
    <!-- 
      Widget Features:
      - Positioning options (bottom-right, bottom-left, top-right, top-left)
      - Light and dark theme support
      - Markdown rendering for rich text formatting
      - Maximize/Minimize functionality (click the square icon in the header)
      - Fully responsive design
    -->
</body>
</html>`;

  // Next.js Integration Guide
  const nextjsGuide = `// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* ${chatbot.name} Chatbot Widget */}
        <Script id="chatbot-config">
          {${"`"}
            window.chatbotConfig = {
              chatbotId: ${chatbot.id},
              position: '${position}',
              theme: '${theme}',
              baseUrl: '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}',
              customTitle: '${customTitle}',
              customPlaceholder: '${customPlaceholder}',
              customWelcomeMessage: \`${customWelcomeMessage}\`,
              customButtonLabel: '${customButtonLabel}',
              showBranding: ${showBranding},
            };
          ${"`"}}
        </Script>
        <Script 
          src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chatbot-widget.js" 
          strategy="lazyOnload"
        />
        
        {/* 
          Widget Features:
          - Positioning options (bottom-right, bottom-left, top-right, top-left)
          - Light and dark theme support
          - Markdown rendering for rich text formatting
          - Maximize/Minimize functionality (click the square icon in the header)
          - Fully responsive design
        */}
      </body>
    </html>
  )
}`;

  // React Component Integration Guide
  const reactGuide = `// components/ChatbotWidget.tsx
import { useEffect } from 'react'

export default function ChatbotWidget() {
  useEffect(() => {
    // Configure the chatbot
    window.chatbotConfig = {
      chatbotId: ${chatbot.id},
      position: '${position}',
      theme: '${theme}',
      baseUrl: '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}',
      customTitle: '${customTitle}',
      customPlaceholder: '${customPlaceholder}',
      customWelcomeMessage: \`${customWelcomeMessage}\`,
      customButtonLabel: '${customButtonLabel}',
      showBranding: ${showBranding},
    }

    // Load the widget script
    const script = document.createElement('script')
    script.src = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chatbot-widget.js'
    script.async = true
    document.body.appendChild(script)

    // Cleanup function
    return () => {
      document.body.removeChild(script)
      const widget = document.querySelector('.chat-widget')
      if (widget) {
        document.body.removeChild(widget)
      }
    }
  }, [])

  return null
}

// Usage in your app
// import ChatbotWidget from '@/components/ChatbotWidget'
// <ChatbotWidget />

/*
  Widget Features:
  - Positioning options (bottom-right, bottom-left, top-right, top-left)
  - Light and dark theme support
  - Markdown rendering for rich text formatting
  - Maximize/Minimize functionality (click the square icon in the header)
  - Fully responsive design
*/`;

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
                <BreadcrumbPage>Chatbot Script</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chatbot Script</h1>
            <p className="text-muted-foreground">Embed your chatbot on your website</p>
          </div>
          <RainbowButton variant="outline" onClick={() => router.back()}>
            Back to Chatbots
          </RainbowButton>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Widget Configuration</CardTitle>
              <CardDescription>
                Customize the appearance and behavior of your chatbot widget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Widget Title</Label>
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
                <Label htmlFor="button">Button Label</Label>
                <Input
                  id="button"
                  placeholder="Chat with us"
                  value={customButtonLabel}
                  onChange={(e) => setCustomButtonLabel(e.target.value)}
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
              
              <div className="space-y-2">
                <Label htmlFor="domains">Allowed Domains</Label>
                <Input
                  id="domains"
                  placeholder="example.com, *.example.com"
                  value={allowedDomains}
                  onChange={(e) => setAllowedDomains(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Restrict which domains can use this widget (comma separated, wildcards supported)
                </p>
              </div>
              
              <RainbowButton onClick={handleUpdateConfig} className="w-full">
                Save Configuration
              </RainbowButton>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Embed Script</CardTitle>
                <CardDescription>
                  Copy and paste this code into your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={scriptTag}
                    readOnly
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <RainbowButton
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleCopyScript}
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
                    Paste this script tag just before the closing {'</body>'} tag on your website.
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href="/chatbot-widget.js" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Widget Script
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Integration Guides</CardTitle>
                <CardDescription>
                  Learn how to integrate the chatbot widget with different frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="html">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="nextjs">Next.js</TabsTrigger>
                    <TabsTrigger value="react">React</TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" className="space-y-4 mt-4">
                    <div className="relative">
                      <Textarea
                        value={htmlGuide}
                        readOnly
                        rows={12}
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopyCode(htmlGuide, "HTML integration guide copied to clipboard")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      For static HTML websites, paste the script tag just before the closing {'</body>'} tag.
                    </p>
                  </TabsContent>
                  <TabsContent value="nextjs" className="space-y-4 mt-4">
                    <div className="relative">
                      <Textarea
                        value={nextjsGuide}
                        readOnly
                        rows={15}
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopyCode(nextjsGuide, "Next.js integration guide copied to clipboard")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      For Next.js applications, use the Script component to load the widget asynchronously.
                    </p>
                  </TabsContent>
                  <TabsContent value="react" className="space-y-4 mt-4">
                    <div className="relative">
                      <Textarea
                        value={reactGuide}
                        readOnly
                        rows={20}
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopyCode(reactGuide, "React integration guide copied to clipboard")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      For React applications, create a component that dynamically loads the widget script.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}