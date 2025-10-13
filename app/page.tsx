"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChatApp } from "@/components/chat-app"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useWorkspace } from "@/hooks/use-workspace"

function PageContent() {
  const { selectedPageId } = useWorkspace()

  return (
    <>
      <AppSidebar />
      <SidebarInset className="relative">
        <ChatApp pageId={selectedPageId} />
      </SidebarInset>
    </>
  )
}

export default function Page() {
  const { isAuthenticated } = useAuth()

  return (
    <SidebarProvider defaultOpen={isAuthenticated}>
      <PageContent />
    </SidebarProvider>
  )
}
