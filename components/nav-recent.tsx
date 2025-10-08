"use client"

import { useState } from "react"
import { MessageSquare, Forward, MoreHorizontal, Trash2, ChevronDown, Search, type LucideIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const INITIAL_DISPLAY_COUNT = 3

export function NavRecent({
  recent,
  onSelect,
  searchQuery,
  onSearchChange,
}: {
  recent: {
    name: string
    url: string
    icon: LucideIcon
  }[]
  onSelect?: (name: string) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}) {
  const { isMobile } = useSidebar()
  const [isExpanded, setIsExpanded] = useState(false)

  const displayedItems = isExpanded ? recent : recent.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMore = recent.length > INITIAL_DISPLAY_COUNT

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between px-2">
        <SidebarGroupLabel>Recent</SidebarGroupLabel>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
            <span className="sr-only">{isExpanded ? "Show less" : "Show more"}</span>
          </Button>
        )}
      </div>
      {onSearchChange && (
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search designs..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
        </div>
      )}
      <SidebarMenu>
        {displayedItems.map((item, index) => (
          <SidebarMenuItem
            key={item.name}
            className="animate-in fade-in slide-in-from-left-2 duration-200"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <SidebarMenuButton onClick={() => onSelect?.(item.name)}>
              <item.icon />
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => onSelect?.(item.name)}>
                  <MessageSquare className="text-muted-foreground" />
                  <span>View Conversation</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="text-muted-foreground" />
                  <span>Share Conversation</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Conversation</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
