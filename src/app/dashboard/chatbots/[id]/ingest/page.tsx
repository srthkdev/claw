"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Github, Globe, FileText, Database, File, Code } from "lucide-react";
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

interface Document {
  id: number;
  url: string;
  contentType: string;
  createdAt: string;
  embeddingCount: number;
}

interface DocumentStatistics {
  totalDocuments: number;
  totalEmbeddings: number;
  contentTypes: string[];
  latestDocument: string;
}

export default function IngestPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;
  
  const [activeTab, setActiveTab] = useState("manual");
  const [manualContent, setManualContent] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null);
  const [isGithubEnabled, setIsGithubEnabled] = useState(false);
  const [documentStats, setDocumentStats] = useState<DocumentStatistics | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Check if GitHub integration is enabled
  useEffect(() => {
    const checkGithubStatus = async () => {
      try {
        const response = await fetch('/api/github/status');
        const data = await response.json();
        setIsGithubEnabled(data.enabled);
      } catch (error) {
        console.error('Error checking GitHub status:', error);
        setIsGithubEnabled(false);
      }
    };

    checkGithubStatus();
  }, []);

  // Fetch document statistics
  useEffect(() => {
    const fetchDocumentStats = async () => {
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}/documents`);
        if (response.ok) {
          const data = await response.json();
          setDocumentStats(data.statistics);
          setDocuments(data.documents);
        }
      } catch (error) {
        console.error('Error fetching document stats:', error);
      }
    };

    fetchDocumentStats();
  }, [chatbotId]);

  const handleManualIngest = async () => {
    if (!manualContent.trim()) {
      setResult({success: false, message: "Content is required"});
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: manualContent,
          url: manualUrl || null,
          contentType: 'text',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to ingest content');
      }

      setResult({success: true, message: `Successfully ingested ${data.totalDocuments} document(s) with ${data.totalEmbeddings} embeddings`});
      setManualContent("");
      setManualUrl("");
      
      // Refresh document stats
      const statsResponse = await fetch(`/api/chatbots/${chatbotId}/documents`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDocumentStats(statsData.statistics);
        setDocuments(statsData.documents);
      }
      
      // Send a custom event to notify the dashboard to refresh
      window.dispatchEvent(new CustomEvent('chatbotDataIngested', { detail: { chatbotId } }));
    } catch (error) {
      setResult({success: false, message: (error as Error).message});
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubIngest = async () => {
    if (!githubRepo.trim()) {
      setResult({success: false, message: "GitHub repository is required"});
      return;
    }

    // Validate GitHub repo format
    const repoPattern = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
    if (!repoPattern.test(githubRepo.trim())) {
      setResult({success: false, message: "Invalid GitHub repository format. Please use the format: owner/repository (e.g., microsoft/TypeScript)"});
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceType: 'github',
          githubRepo: githubRepo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Provide a more helpful error message for GitHub token issues
        if (data.error && data.error.includes('GITHUB_TOKEN')) {
          throw new Error('GitHub integration is not configured. Please contact the administrator to enable GitHub repository ingestion.');
        }
        throw new Error(data.error || 'Failed to ingest GitHub repository');
      }

      setResult({success: true, message: `Successfully ingested ${data.totalDocuments} document(s) with ${data.totalEmbeddings} embeddings`});
      setGithubRepo("");
      
      // Refresh document stats
      const statsResponse = await fetch(`/api/chatbots/${chatbotId}/documents`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDocumentStats(statsData.statistics);
        setDocuments(statsData.documents);
      }
      
      // Send a custom event to notify the dashboard to refresh
      window.dispatchEvent(new CustomEvent('chatbotDataIngested', { detail: { chatbotId } }));
    } catch (error) {
      setResult({success: false, message: (error as Error).message});
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebsiteIngest = async () => {
    if (!websiteUrl.trim()) {
      setResult({success: false, message: "Website URL is required"});
      return;
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch {
      setResult({success: false, message: "Please enter a valid URL"});
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceType: 'website',
          url: websiteUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to crawl website');
      }

      setResult({success: true, message: `Successfully ingested ${data.totalDocuments} document(s) with ${data.totalEmbeddings} embeddings`});
      setWebsiteUrl("");
      
      // Refresh document stats
      const statsResponse = await fetch(`/api/chatbots/${chatbotId}/documents`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDocumentStats(statsData.statistics);
        setDocuments(statsData.documents);
      }
      
      // Send a custom event to notify the dashboard to refresh
      window.dispatchEvent(new CustomEvent('chatbotDataIngested', { detail: { chatbotId } }));
    } catch (error) {
      setResult({success: false, message: (error as Error).message});
    } finally {
      setIsLoading(false);
    }
  };

  // Format content type for display
  const formatContentType = (type: string) => {
    const typeMap: Record<string, string> = {
      'web_page': 'Web Page',
      'markdown': 'Markdown',
      'pdf': 'PDF',
      'text': 'Text',
      'code': 'Code'
    };
    return typeMap[type] || type;
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
                <BreadcrumbPage>Add Data</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Add Data to Chatbot</h1>
            <p className="text-muted-foreground">Ingest content from various sources to train your chatbot</p>
          </div>
          <RainbowButton variant="outline" onClick={() => router.back()}>
            Back to Chatbots
          </RainbowButton>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <AlertDescription>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Document Statistics */}
        {documentStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Document Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-3">
                  <div className="text-2xl font-bold">{documentStats.totalDocuments}</div>
                  <div className="text-sm text-muted-foreground">Documents</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-2xl font-bold">{documentStats.totalEmbeddings}</div>
                  <div className="text-sm text-muted-foreground">Embeddings</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-2xl font-bold">{documentStats.contentTypes.length}</div>
                  <div className="text-sm text-muted-foreground">Content Types</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-2xl font-bold">
                    {documentStats.latestDocument 
                      ? new Date(documentStats.latestDocument).toLocaleDateString() 
                      : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Last Added</div>
                </div>
              </div>
              
              {documentStats.contentTypes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Content Types:</h3>
                  <div className="flex flex-wrap gap-2">
                    {documentStats.contentTypes.map((type, index) => (
                      <span key={index} className="bg-muted px-2 py-1 rounded text-sm">
                        {formatContentType(type)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Manual Content
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-2" disabled={!isGithubEnabled}>
              <Github className="h-4 w-4" />
              GitHub Repo
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Manual Content</CardTitle>
                <CardDescription>
                  Paste or type content directly to add to your chatbot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Source URL (optional)</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com/document"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste your content here..."
                    rows={10}
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                  />
                </div>
                <RainbowButton 
                  onClick={handleManualIngest} 
                  disabled={isLoading || !manualContent.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingesting...
                    </>
                  ) : (
                    "Ingest Content"
                  )}
                </RainbowButton>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="github">
            <Card>
              <CardHeader>
                <CardTitle>GitHub Repository</CardTitle>
                <CardDescription>
                  Import documentation from a GitHub repository
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="github-repo">Repository</Label>
                  <Input
                    id="github-repo"
                    placeholder="owner/repository (e.g., microsoft/TypeScript)"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    disabled={!isGithubEnabled}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the repository in the format: owner/repository (e.g., microsoft/TypeScript)
                  </p>
                  {!isGithubEnabled && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Note: GitHub integration is not configured. Please contact the administrator to enable this feature.
                    </p>
                  )}
                </div>
                <RainbowButton 
                  onClick={handleGithubIngest} 
                  disabled={isLoading || !githubRepo.trim() || !isGithubEnabled}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingesting...
                    </>
                  ) : (
                    "Ingest Repository"
                  )}
                </RainbowButton>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="website">
            <Card>
              <CardHeader>
                <CardTitle>Website</CardTitle>
                <CardDescription>
                  Crawl a documentation website to extract content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website-url">Website URL</Label>
                  <Input
                    id="website-url"
                    placeholder="https://example.com/docs"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    The crawler will extract content from this website and its subpages
                  </p>
                </div>
                <RainbowButton 
                  onClick={handleWebsiteIngest} 
                  disabled={isLoading || !websiteUrl.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingesting...
                    </>
                  ) : (
                    "Crawl Website"
                  )}
                </RainbowButton>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recently Added Documents */}
        {documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                Recently Added Documents
              </CardTitle>
              <CardDescription>
                Most recent documents added to this chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm truncate max-w-xs">
                          {doc.url || `Document #${doc.id}`}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {formatContentType(doc.contentType)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{doc.embeddingCount}</div>
                        <div className="text-xs text-muted-foreground">embeddings</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarInset>
  );
}