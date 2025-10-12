"use client"

import { useState, useRef, useEffect } from "react"
import type * as React from "react"
import { MessageSquare, Sparkles, FileText, Gift, HelpCircle, MessageCircle, Globe, Check } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavPages } from "@/components/nav-pages"
import { useWorkspace } from "@/hooks/use-workspace"
import { useAuth } from "@/hooks/use-auth"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// This is sample data.
const data = {
  navMain: [
    {
      title: "AI Create",
      url: "#",
      icon: Sparkles,
      isActive: false,
      requireAuth: false, // Public - triggers login when clicked
    },
    {
      title: "New Blank Slide",
      url: "#",
      icon: FileText,
      isActive: false,
      requireAuth: false, // Public - triggers login when clicked
    },
    {
      title: "Refer & Earn",
      url: "#",
      icon: Gift,
      isActive: false,
      requireAuth: false, // Public - triggers login when clicked
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
  onPageOnLeave,
  isInChatMode = false,
}: {
  onPageOnClick?: () => void
  onPageOnHover?: () => void
  onPageOnLeave?: () => void
  isInChatMode?: boolean
}) {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarHeader className="flex h-12 shrink-0 flex-row items-center gap-2 border-b px-4">
      {!isCollapsed ? (
        <>
          <button
            onClick={onPageOnClick}
            onMouseEnter={isInChatMode ? onPageOnHover : undefined}
            onMouseLeave={isInChatMode ? onPageOnLeave : undefined}
            className={`text-lg font-semibold transition-colors ${
              isInChatMode
                ? "cursor-pointer hover:text-primary"
                : "cursor-default"
            }`}
            title={isInChatMode ? "Back to workspace" : undefined}
          >
            PageOn
          </button>
          <button
            onClick={toggleSidebar}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
        </>
      ) : (
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent"
          title="Expand sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      )}
    </SidebarHeader>
  )
}

const languages = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
]

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { selectedPageId, selectPage, pages } = useWorkspace()
  const { requireAuth } = useAuth()
  const { isMobile } = useSidebar()

  // Get selected page data
  const selectedPage = selectedPageId ? pages.find((p) => p.id === selectedPageId) : null

  const handleNavMainSelect = (title: string) => {
    if (title === "AI Create") {
      // Require login before proceeding
      if (!requireAuth()) {
        return
      }
      // Return to main workspace page
      selectPage(null)
      setShowWorkspace(false)
    } else if (title === "New Blank Slide") {
      // Require login before creating
      if (!requireAuth()) {
        return
      }
      // Create a new blank page
      selectPage(null)
      setShowWorkspace(false)
    } else if (title === "Refer & Earn") {
      // Require login before accessing referral program
      if (!requireAuth()) {
        return
      }
      // Handle referral program
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

  const handlePageOnLeave = () => {
    // Start hiding workspace when mouse leaves PageOn button
    hoverTimeoutRef.current = setTimeout(() => {
      setShowWorkspace(false)
    }, 100)
  }

  const handleWorkspaceMouseEnter = () => {
    // Clear timeout when mouse enters workspace content
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  const handleWorkspaceMouseLeave = () => {
    // Start hiding when mouse leaves workspace content
    if (!selectedPageId) return
    hoverTimeoutRef.current = setTimeout(() => {
      setShowWorkspace(false)
    }, 100)
  }

  const handleSidebarMouseEnter = () => {
    if (!selectedPageId) return
    // Only clear timeout, don't actively show workspace
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  const handleSidebarMouseLeave = (e: React.MouseEvent) => {
    if (!selectedPageId) return

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
    if (!showWorkspace || !selectedPageId) return

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
  }, [showWorkspace, selectedPageId])

  // Determine what content to show
  // In Canvas mode: show SidebarChatView
  // Otherwise: show workspace (or workspace on hover in chat mode)
  const isCanvasMode = selectedPage && selectedPage.canvasOpen && selectedPage.artifacts.length > 0

  // Show workspace when:
  // 1. No page selected, OR
  // 2. In canvas mode but showing workspace on hover, OR
  // 3. Not in canvas mode (full-screen chat mode)
  const showWorkspaceContent = !selectedPageId || (!isCanvasMode) || (isCanvasMode && showWorkspace)

  return (
    <Sidebar
      collapsible={selectedPageId ? "offcanvas" : "icon"}
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
      {...props}
    >
      <UnifiedHeader
        onPageOnClick={() => handleNavMainSelect("AI Create")}
        onPageOnHover={handlePageOnHover}
        onPageOnLeave={handlePageOnLeave}
        isInChatMode={!!selectedPageId}
      />
      <SidebarContent className="animate-in fade-in slide-in-from-left-4 duration-300">
        {showWorkspaceContent ? (
          <div
            onMouseEnter={selectedPageId ? handleWorkspaceMouseEnter : undefined}
            onMouseLeave={selectedPageId ? handleWorkspaceMouseLeave : undefined}
            className="h-full"
          >
            <NavMain items={data.navMain} onSelect={handleNavMainSelect} />
            <NavPages />
          </div>
        ) : (
          <SidebarChatView page={selectedPage!} />
        )}
      </SidebarContent>
      {showWorkspaceContent && (
        <SidebarFooter className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton tooltip="Language">
                    <Globe />
                    <span>{languages.find((lang) => lang.code === selectedLanguage)?.name}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side={isMobile ? "top" : "right"}
                  align="start"
                  className="w-48"
                >
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className="flex items-center justify-between"
                    >
                      <span>{lang.name}</span>
                      {selectedLanguage === lang.code && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
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
          <NavUser />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  )
}
