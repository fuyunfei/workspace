"use client"

import { useState } from "react"
import type * as React from "react"
import { MessageSquare, Sparkles, FileText, Gift, Trash2, HelpCircle, MessageCircle } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavRecent } from "@/components/nav-recent"
import { NavUser } from "@/components/nav-user"
import { SidebarChatView } from "@/components/sidebar-chat-view"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "AI Create",
      url: "#",
      icon: Sparkles,
      isActive: false,
    },
    {
      title: "New Blank Slide",
      url: "#",
      icon: FileText,
      isActive: false,
    },
    {
      title: "Refer & Earn",
      url: "#",
      icon: Gift,
      isActive: false,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
      isActive: false,
    },
  ],
  recent: [
    {
      name: "Landing Page Design",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Dashboard UI Mockup",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Mobile App Wireframe",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "E-commerce Product Page",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Social Media Feed",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Admin Panel Layout",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Portfolio Website",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Login & Signup Forms",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Blog Post Template",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Pricing Page Design",
      url: "#",
      icon: MessageSquare,
    },
  ],
}

function WorkspaceHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarHeader className="flex h-12 shrink-0 flex-row items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      {!isCollapsed && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">PageOn</h1>
        </div>
      )}
    </SidebarHeader>
  )
}

export function AppSidebar({
  selectedConversation,
  onConversationChange,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  selectedConversation?: string | null
  onConversationChange?: (conversation: string | null) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRecent = data.recent.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Sidebar collapsible={selectedConversation ? "offcanvas" : "icon"} {...props}>
      {selectedConversation ? (
        <SidebarContent className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-300">
          <SidebarChatView conversationName={selectedConversation} />
        </SidebarContent>
      ) : (
        <>
          <WorkspaceHeader />
          <SidebarContent className="animate-in fade-in slide-in-from-left-4 duration-300">
            <NavMain items={data.navMain} />
            <NavRecent
              recent={filteredRecent}
              onSelect={onConversationChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </SidebarContent>
        </>
      )}
      {!selectedConversation && (
        <SidebarFooter className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Help">
                <HelpCircle />
                <span>Help</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Feedback">
                <MessageCircle />
                <span>Feedback</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <NavUser user={data.user} />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  )
}
