"use client"

import * as React from "react"
import {
  Bot,
  Home,
  Settings,
  BarChart3,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from "react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded } = useUser()
  const [chatbots, setChatbots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch chatbots from the database
  useEffect(() => {
    const fetchChatbots = async () => {
      if (!isLoaded || !user) return
      
      try {
        const response = await fetch('/api/chatbots')
        if (response.ok) {
          const chatbotsData = await response.json()
          setChatbots(chatbotsData)
        }
      } catch (error) {
        console.error('Failed to fetch chatbots:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChatbots()
  }, [isLoaded, user])

  // Define navigation structure
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Chatbots",
      url: "/dashboard",
      icon: Bot,
      items: chatbots.map(chatbot => ({
        title: chatbot.name,
        url: `/dashboard/chatbots/${chatbot.id}`,
      }))
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "MCP Integration",
      url: "/dashboard/mcp",
      icon: Bot,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ]

  if (!isLoaded) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-2 p-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[
          {
            name: "Claw Chatbots",
            logo: Bot,
            plan: "Free",
          },
        ]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}