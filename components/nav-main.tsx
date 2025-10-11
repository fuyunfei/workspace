"use client"

import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  onSelect,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    requireAuth?: boolean
  }[]
  onSelect?: (title: string) => void
}) {
  const { isAuthenticated } = useAuth()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => {
          // Hide items that require auth when not logged in
          if (item.requireAuth && !isAuthenticated) {
            return null
          }

          return (
            <SidebarMenuItem
              key={item.title}
              className="animate-in fade-in slide-in-from-left-2 duration-200"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <SidebarMenuButton
                tooltip={item.title}
                isActive={item.isActive}
                onClick={() => onSelect?.(item.title)}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
