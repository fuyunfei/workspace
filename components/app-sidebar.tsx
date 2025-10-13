"use client"

import * as React from "react"
import { useState } from "react"
import { Sparkles, FileText, Gift, HelpCircle, MessageCircle, Globe, Check } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavPages } from "@/components/nav-pages"
import { useWorkspace } from "@/hooks/use-workspace"
import { useAuth } from "@/hooks/use-auth"
import { NavUser } from "@/components/nav-user"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Nav main items data
const navMainItems = [
  {
    title: "AI Create",
    url: "#",
    icon: Sparkles,
    isActive: false,
    requireAuth: false,
  },
  {
    title: "New Blank Slide",
    url: "#",
    icon: FileText,
    isActive: false,
    requireAuth: false,
  },
  {
    title: "Refer & Earn",
    url: "#",
    icon: Gift,
    isActive: false,
    requireAuth: false,
  },
]

function WorkspaceHeader({
  onCreateNew
}: {
  onCreateNew: () => void
}) {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarHeader className="flex h-12 shrink-0 flex-row items-center gap-2 border-b px-4">
      {!isCollapsed ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCreateNew}
                className="text-lg font-semibold transition-colors hover:text-primary cursor-pointer"
              >
                PageOn
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              Create new
            </TooltipContent>
          </Tooltip>
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
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const { selectPage, selectedPageId, getChatMode, sidebarWidth: workspaceSidebarWidth } = useWorkspace()
  const { requireAuth } = useAuth()
  const { isMobile, setOpen, setSidebarWidth: setSidebarContextWidth } = useSidebar()

  // Sync workspace sidebar width from workspace context (one-way: workspace -> sidebar)
  React.useEffect(() => {
    setSidebarContextWidth(workspaceSidebarWidth)
  }, [workspaceSidebarWidth, setSidebarContextWidth])

  // Determine collapsible mode based on chat state
  const chatMode = selectedPageId ? getChatMode(selectedPageId) : null
  const isInCanvasMode = selectedPageId && chatMode === "canvas"
  const collapsibleMode = isInCanvasMode ? "offcanvas" : "icon"

  const handleNavMainSelect = (title: string) => {
    if (title === "AI Create") {
      // Require login before proceeding
      if (!requireAuth()) {
        return
      }
      // Return to main workspace page
      selectPage(null)
    } else if (title === "New Blank Slide") {
      // Require login before creating
      if (!requireAuth()) {
        return
      }
      // Create a new blank page
      selectPage(null)
    } else if (title === "Refer & Earn") {
      // Require login before accessing referral program
      if (!requireAuth()) {
        return
      }
      // Handle referral program
    }
    // Handle other nav items as needed
  }

  // Handle sidebar hover to keep it open
  const handleSidebarMouseEnter = () => {
    if (isInCanvasMode) {
      setOpen(true)
    }
  }

  const handleSidebarMouseLeave = () => {
    if (isInCanvasMode) {
      setOpen(false)
    }
  }

  const handleCreateNew = () => {
    // Require login before proceeding
    if (!requireAuth()) {
      return
    }
    // Return to main workspace page (AI Create)
    selectPage(null)
  }

  return (
    <Sidebar
      collapsible={collapsibleMode}
      variant={isInCanvasMode ? "floating" : "sidebar"}
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
      {...props}
    >
      <WorkspaceHeader onCreateNew={handleCreateNew} />
      <SidebarContent>
        <NavMain items={navMainItems} onSelect={handleNavMainSelect} />
        <NavPages />
      </SidebarContent>
      <SidebarFooter>
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
      <SidebarRail />
    </Sidebar>
  )
}
