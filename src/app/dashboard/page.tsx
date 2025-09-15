"use client";

import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { PlusCircle, Trash2, Edit, Code, BarChart3, Palette } from "lucide-react"
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Chatbot {
  id: number;
  name: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function Page() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newChatbotName, setNewChatbotName] = useState("");
  const [newChatbotDescription, setNewChatbotDescription] = useState("");
  const router = useRouter();

  // Fetch chatbots
  const fetchChatbots = async () => {
    try {
      const response = await fetch('/api/chatbots');
      if (!response.ok) {
        throw new Error('Failed to fetch chatbots');
      }
      const data = await response.json();
      setChatbots(data);
    } catch (err) {
      setError('Failed to load chatbots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch chatbots on component mount
  useEffect(() => {
    fetchChatbots();
  }, []);

  // Listen for chatbot data ingestion events
  useEffect(() => {
    const handleDataIngested = (event: CustomEvent) => {
      // Refresh the chatbot list when data is ingested
      fetchChatbots();
    };

    window.addEventListener('chatbotDataIngested', handleDataIngested as EventListener);
    
    return () => {
      window.removeEventListener('chatbotDataIngested', handleDataIngested as EventListener);
    };
  }, []);

  // Create a new chatbot
  const handleCreateChatbot = async () => {
    if (!newChatbotName.trim()) return;

    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChatbotName,
          config: {
            description: newChatbotDescription,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chatbot');
      }

      const newChatbot = await response.json();
      setChatbots([...chatbots, newChatbot]);
      setNewChatbotName("");
      setNewChatbotDescription("");
      setIsCreateDialogOpen(false);
    } catch (err) {
      console.error('Error creating chatbot:', err);
      alert('Failed to create chatbot');
    }
  };

  // Delete a chatbot
  const handleDeleteChatbot = async (chatbotId: number) => {
    if (!confirm('Are you sure you want to delete this chatbot?')) return;

    try {
      const response = await fetch(`/api/chatbots/${chatbotId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chatbot');
      }

      setChatbots(chatbots.filter(chatbot => chatbot.id !== chatbotId));
    } catch (err) {
      console.error('Error deleting chatbot:', err);
      alert('Failed to delete chatbot');
    }
  };

  if (loading) {
    return (
      <SidebarInset>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading chatbots...</div>
        </div>
      </SidebarInset>
    );
  }

  if (error) {
    return (
      <SidebarInset>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Chatbots</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Chatbots</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <RainbowButton>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Chatbot
              </RainbowButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Chatbot</DialogTitle>
                <DialogDescription>
                  Create a new chatbot to start adding your documentation or GitHub repositories.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newChatbotName}
                    onChange={(e) => setNewChatbotName(e.target.value)}
                    className="col-span-3"
                    placeholder="My Awesome Chatbot"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newChatbotDescription}
                    onChange={(e) => setNewChatbotDescription(e.target.value)}
                    className="col-span-3"
                    placeholder="Describe what this chatbot is for..."
                  />
                </div>
              </div>
              <DialogFooter>
                <RainbowButton 
                  onClick={handleCreateChatbot}
                  disabled={!newChatbotName.trim()}
                >
                  Create
                </RainbowButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {chatbots.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chatbots.map((chatbot) => (
              <div key={chatbot.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{chatbot.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {chatbot.documentCount || 0} documents
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteChatbot(chatbot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-4 flex gap-2 flex-wrap">
                  <RainbowButton 
                    size="sm"
                    onClick={() => router.push(`/dashboard/chatbots/${chatbot.id}/ingest`)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Data
                  </RainbowButton>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/dashboard/chatbots/${chatbot.id}/script`)}
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Script
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/dashboard/chatbots/${chatbot.id}/customize`)}
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    Customize
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/dashboard/chatbots/${chatbot.id}/analytics`)}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  Created: {new Date(chatbot.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-md">
              <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No chatbots yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first chatbot to start adding documentation or GitHub repositories.
              </p>
              <RainbowButton onClick={() => setIsCreateDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Chatbot
              </RainbowButton>
            </div>
          </div>
        )}
        
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            Create a chatbot and start adding your documentation or GitHub repositories to build an AI assistant.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">1. Create a Chatbot</h3>
              <p className="text-sm text-muted-foreground">
                Start by creating a new chatbot with a name and description.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">2. Add Data Sources</h3>
              <p className="text-sm text-muted-foreground">
                Connect your documentation websites or GitHub repositories.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">3. Generate Script</h3>
              <p className="text-sm text-muted-foreground">
                Get the embed code to add your chatbot to your website.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">4. Monitor Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track usage and performance of your chatbots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}