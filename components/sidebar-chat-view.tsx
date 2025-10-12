"use client"

import { useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useWorkspace, type Page } from "@/hooks/use-workspace"

interface SidebarChatViewProps {
  page: Page
}

export function SidebarChatView({
  page
}: SidebarChatViewProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { addMessage } = useWorkspace()

  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    addMessage(page.id, {
      role: "user",
      content: input.trim(),
    })

    setInput("")

    // Simulate AI response
    setTimeout(() => {
      addMessage(page.id, {
        role: "assistant",
        content: "I'll update the design based on your feedback.",
      })
    }, 1000)
  }

  if (isCollapsed) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-6 py-4">
          {page.messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                  {message.role === "user" ? "U" : <Sparkles className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>

              {/* Message content */}
              <div className={`flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[220px] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {message.content}
                </div>
                <span className="px-1 text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex flex-col gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[80px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" className="gap-2">
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
