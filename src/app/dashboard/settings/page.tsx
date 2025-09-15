"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from 'next-themes';
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
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleAIKey, setGoogleAIKey] = useState("");
  const [openaiKeyVisible, setOpenaiKeyVisible] = useState(false);
  const [googleAIKeyVisible, setGoogleAIKeyVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false);
  const [isTestingGoogleAI, setIsTestingGoogleAI] = useState(false);

  // Load saved settings on component mount
  useEffect(() => {
    const savedOpenaiKey = localStorage.getItem('openai_api_key') || "";
    const savedGoogleAIKey = localStorage.getItem('google_generative_ai_key') || "";
    setOpenaiKey(savedOpenaiKey);
    setGoogleAIKey(savedGoogleAIKey);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage
      if (openaiKey) {
        localStorage.setItem('openai_api_key', openaiKey);
      } else {
        localStorage.removeItem('openai_api_key');
      }
      
      if (googleAIKey) {
        localStorage.setItem('google_generative_ai_key', googleAIKey);
      } else {
        localStorage.removeItem('google_generative_ai_key');
      }
      
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnectionOpenAI = async () => {
    if (!openaiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingOpenAI(true);
    try {
      // Test with a simple embedding request to validate the key
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: 'test',
        })
      });

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Your OpenAI API key is valid and working.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Invalid API key');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Invalid API key or network error.",
        variant: "destructive",
      });
    } finally {
      setIsTestingOpenAI(false);
    }
  };

  const handleTestConnectionGoogleAI = async () => {
    if (!googleAIKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google Generative AI API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingGoogleAI(true);
    try {
      // Test Google AI key by making a simple embedding request
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${googleAIKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: {
            parts: [{
              text: "test"
            }]
          }
        })
      });

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Your Google Generative AI API key is valid and working.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Invalid API key');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Invalid API key or network error.",
        variant: "destructive",
      });
    } finally {
      setIsTestingGoogleAI(false);
    }
  };

  const handleReset = () => {
    setOpenaiKey("");
    setGoogleAIKey("");
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('google_generative_ai_key');
    toast({
      title: "Settings reset",
      description: "Your API keys have been removed.",
    });
  };

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
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-6 p-4 pt-0">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences</p>
        </div>

        <div className="grid gap-6">
          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure your API keys for chatbot functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OpenAI Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">OpenAI</h3>
                <div className="space-y-2">
                  <Label htmlFor="openaiKey">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openaiKey"
                      type={openaiKeyVisible ? "text" : "password"}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-...your key..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setOpenaiKeyVisible(!openaiKeyVisible)}
                    >
                      {openaiKeyVisible ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your API key is stored locally in your browser and never sent to our servers.
                    You can get your API key from the {" "}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      OpenAI dashboard
                    </a>.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <RainbowButton 
                    onClick={handleTestConnectionOpenAI} 
                    disabled={isTestingOpenAI}
                    className="flex-1"
                  >
                    {isTestingOpenAI ? "Testing..." : "Test Connection"}
                  </RainbowButton>
                </div>
              </div>

              {/* Google AI Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Google Generative AI</h3>
                <div className="space-y-2">
                  <Label htmlFor="googleAIKey">Google Generative AI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="googleAIKey"
                      type={googleAIKeyVisible ? "text" : "password"}
                      value={googleAIKey}
                      onChange={(e) => setGoogleAIKey(e.target.value)}
                      placeholder="AIza...your key..."
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setGoogleAIKeyVisible(!googleAIKeyVisible)}
                    >
                      {googleAIKeyVisible ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your API key is stored locally in your browser and never sent to our servers.
                    You can get your API key from the {" "}
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Google AI Studio
                    </a>.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <RainbowButton 
                    onClick={handleTestConnectionGoogleAI} 
                    disabled={isTestingGoogleAI}
                    className="flex-1"
                  >
                    {isTestingGoogleAI ? "Testing..." : "Test Connection"}
                  </RainbowButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <Switch
                    checked={theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex-1"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex-1"
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="flex-1"
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
            <CardDescription>Configure the AI models used by your chatbots</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chatModel">Chat Model</Label>
                <Input
                  id="chatModel"
                  value="gemini-2.0-flash"
                  readOnly
                />
                <p className="text-sm text-muted-foreground">
                  The AI model used for chat responses (Gemini 2.0 Flash)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="embeddingModel">Embedding Model</Label>
                <Input
                  id="embeddingModel"
                  value="text-embedding-004"
                  readOnly
                />
                <p className="text-sm text-muted-foreground">
                  The model used for generating document embeddings (768 dimensions)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleReset}>
            Reset API Keys
          </Button>
          <RainbowButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </RainbowButton>
        </div>
      </div>
    </SidebarInset>
  );
}