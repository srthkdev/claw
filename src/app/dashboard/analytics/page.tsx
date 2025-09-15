"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
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

interface AnalyticsData {
  overview: {
    totalChatbots: number;
    totalDocuments: number;
    totalMessages: number;
  };
  chatbots: {
    id: number;
    name: string;
    documentCount: number;
    messageCount: number;
    lastActivity: string;
  }[];
  recentActivity: {
    date: string;
    count: number;
  }[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <SidebarInset>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </SidebarInset>
    );
  }

  if (error) {
    return (
      <SidebarInset>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </SidebarInset>
    );
  }

  if (!analyticsData) {
    return (
      <SidebarInset>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">No analytics data available</div>
        </div>
      </SidebarInset>
    );
  }

  // Prepare data for charts
  const chatbotData = analyticsData.chatbots.map(chatbot => ({
    name: chatbot.name.length > 15 ? chatbot.name.substring(0, 15) + '...' : chatbot.name,
    documents: chatbot.documentCount,
    messages: chatbot.messageCount,
  }));

  const activityData = analyticsData.recentActivity.map(activity => ({
    date: new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    messages: activity.count,
  }));

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
                <BreadcrumbPage>Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="space-y-6 p-4 pt-0">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor your chatbot performance and usage metrics</p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chatbots</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">🤖</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalChatbots}</div>
              <p className="text-xs text-muted-foreground">Active chatbots</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Ingested</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">📄</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">Training data</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Exchanged</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">💬</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalMessages}</div>
              <p className="text-xs text-muted-foreground">Total conversations</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chatbot Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Distribution</CardTitle>
              <CardDescription>Documents and messages per chatbot</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chatbotData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="documents" fill="#8884d8" name="Documents" />
                  <Bar dataKey="messages" fill="#82ca9d" name="Messages" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Message volume over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#0088FE" name="Messages" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Chatbot Details */}
        <Card>
          <CardHeader>
            <CardTitle>Chatbot Details</CardTitle>
            <CardDescription>Performance metrics for each chatbot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.chatbots.map((chatbot) => (
                <div key={chatbot.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{chatbot.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Last activity: {chatbot.lastActivity ? new Date(chatbot.lastActivity).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{chatbot.documentCount}</div>
                      <div className="text-xs text-muted-foreground">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{chatbot.messageCount}</div>
                      <div className="text-xs text-muted-foreground">Messages</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}