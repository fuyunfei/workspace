"use client"

import { useState, useRef, useEffect } from "react"
import type * as React from "react"
import { MessageSquare, Sparkles, FileText, Gift, Trash2, HelpCircle, MessageCircle } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavRecent } from "@/components/nav-recent"
import { NavUser } from "@/components/nav-user"
import { SidebarChatView } from "@/components/sidebar-chat-view"
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
  onPageOnClick,
  onPageOnHover,
  isInChatMode = false,
}: {
  onPageOnClick?: () => void
  onPageOnHover?: () => void
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
        onMouseEnter={isInChatMode ? onPageOnHover : undefined}
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
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  selectedConversation?: string | null
  onConversationChange?: (conversation: string | null) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showWorkspace, setShowWorkspace] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const filteredRecent = data.recent.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNavMainSelect = (title: string) => {
    if (title === "AI Create") {
      // Return to main workspace page
      onConversationChange?.(null)
      setShowWorkspace(false)
    }
    // Handle other nav items as needed
  }

  const handlePageOnHover = () => {
    // Trigger workspace display when hovering PageOn
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setShowWorkspace(true)
  }

  const handleSidebarMouseEnter = () => {
    if (!selectedConversation) return
    // Only clear timeout, don't actively show workspace
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  const handleSidebarMouseLeave = (e: React.MouseEvent) => {
    if (!selectedConversation) return

    // Check if any dropdown/menu is open in the sidebar
    const hasOpenMenu = (e.currentTarget as HTMLElement).querySelector('[data-state="open"]')
    if (hasOpenMenu) {
      // Don't hide if there's an open menu - wait for it to close
      return
    }

    // Delay hiding to allow smooth transition
    hoverTimeoutRef.current = setTimeout(() => {
      setShowWorkspace(false)
    }, 100)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Monitor when dropdowns close and hide workspace if mouse is outside
  useEffect(() => {
    if (!showWorkspace || !selectedConversation) return

    const checkDropdownClose = () => {
      // Use a small delay to let DOM update
      setTimeout(() => {
        const sidebarElement = document.querySelector('[data-slot="sidebar"]')
        if (!sidebarElement) return

        const hasOpenMenu = sidebarElement.querySelector('[data-state="open"]')
        if (!hasOpenMenu) {
          // No open menus, check if mouse is outside sidebar
          const rect = sidebarElement.getBoundingClientRect()
          const mouseEvent = (window as any).lastMouseEvent
          if (mouseEvent) {
            const isOutside =
              mouseEvent.clientX < rect.left ||
              mouseEvent.clientX > rect.right ||
              mouseEvent.clientY < rect.top ||
              mouseEvent.clientY > rect.bottom

            if (isOutside) {
              setShowWorkspace(false)
            }
          }
        }
      }, 50)
    }

    // Track mouse position
    const trackMouse = (e: MouseEvent) => {
      ;(window as any).lastMouseEvent = e
    }

    document.addEventListener('click', checkDropdownClose)
    document.addEventListener('mousemove', trackMouse)

    return () => {
      document.removeEventListener('click', checkDropdownClose)
      document.removeEventListener('mousemove', trackMouse)
    }
  }, [showWorkspace, selectedConversation])

  // Determine what content to show
  const showWorkspaceContent = !selectedConversation || showWorkspace

  return (
    <Sidebar
      collapsible={selectedConversation ? "offcanvas" : "icon"}
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
      {...props}
    >
      <UnifiedHeader
        onPageOnClick={() => handleNavMainSelect("AI Create")}
        onPageOnHover={handlePageOnHover}
        isInChatMode={!!selectedConversation}
      />
      <SidebarContent className="animate-in fade-in slide-in-from-left-4 duration-300">
        {showWorkspaceContent ? (
          <>
            <NavMain items={data.navMain} onSelect={handleNavMainSelect} />
            <NavRecent
              recent={filteredRecent}
              onSelect={onConversationChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </>
        ) : (
          <SidebarChatView conversationName={selectedConversation!} />
        )}
      </SidebarContent>
      {showWorkspaceContent && (
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
