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

function UnifiedHeader({
  onWorkspaceHover,
  onWorkspaceLeave,
  onPageOnClick,
  isInChatMode = false,
}: {
  onWorkspaceHover?: () => void
  onWorkspaceLeave?: () => void
  onPageOnClick?: () => void
  isInChatMode?: boolean
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  if (isCollapsed) {
    return null
  }

  return (
    <SidebarHeader className="flex h-12 shrink-0 flex-row items-center gap-2 border-b px-4">
      <button
        onClick={onPageOnClick}
        onMouseEnter={isInChatMode ? onWorkspaceHover : undefined}
        onMouseLeave={isInChatMode ? onWorkspaceLeave : undefined}
        className="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-muted-foreground"
      >
        PageOn
      </button>
    </SidebarHeader>
  )
}

export function AppSidebar({
  selectedConversation,
  onConversationChange,
  onWorkspaceHover,
  onWorkspaceLeave,
  hideHeader = false,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  selectedConversation?: string | null
  onConversationChange?: (conversation: string | null) => void
  onWorkspaceHover?: () => void
  onWorkspaceLeave?: () => void
  hideHeader?: boolean
}) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRecent = data.recent.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNavMainSelect = (title: string) => {
    if (title === "AI Create") {
      // Return to main workspace page
      onConversationChange?.(null)
    }
    // Handle other nav items as needed
  }

  return (
    <Sidebar collapsible={selectedConversation ? "offcanvas" : "icon"} {...props}>
      {!hideHeader && (
        <UnifiedHeader
          onWorkspaceHover={onWorkspaceHover}
          onWorkspaceLeave={onWorkspaceLeave}
          onPageOnClick={() => handleNavMainSelect("AI Create")}
          isInChatMode={!!selectedConversation}
        />
      )}
      {selectedConversation ? (
        <SidebarContent className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-300">
          <SidebarChatView
            conversationName={selectedConversation}
          />
        </SidebarContent>
      ) : (
        <SidebarContent className="animate-in fade-in slide-in-from-left-4 duration-300">
          <NavMain items={data.navMain} onSelect={handleNavMainSelect} />
          <NavRecent
            recent={filteredRecent}
            onSelect={onConversationChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </SidebarContent>
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
