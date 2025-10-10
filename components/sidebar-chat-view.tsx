"use client"

import { useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface SidebarChatViewProps {
  conversationName: string
}

export function SidebarChatView({
  conversationName
}: SidebarChatViewProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "user",
      content: "Can you help me design a modern landing page?",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      role: "assistant",
      content: "I'd be happy to help! Let's create a modern landing page. What's the main purpose of your page?",
      timestamp: new Date(Date.now() - 3500000),
    },
    {
      id: "3",
      role: "user",
      content: "It's for a SaaS product that helps teams collaborate better.",
      timestamp: new Date(Date.now() - 3400000),
    },
    {
      id: "4",
      role: "assistant",
      content:
        "Perfect! For a SaaS collaboration tool, I recommend a clean, professional design with:\n\n• Hero section with clear value proposition\n• Feature highlights with icons\n• Social proof section\n• Clear CTA buttons\n\nShall I start creating the design?",
      timestamp: new Date(Date.now() - 3300000),
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Great! I'll help you design that. Let me create some concepts for you.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  if (isCollapsed) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col">
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-6 py-4">
          {messages.map((message) => (
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
