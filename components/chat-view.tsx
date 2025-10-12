"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWorkspace, type Page } from "@/hooks/use-workspace"

// Fake AI response templates
const AI_RESPONSES = [
  // Round 1: Confirm understanding
  [
    "I'd be happy to help you create that! Let me make sure I understand what you're looking for.",
    "Got it! Just to confirm, you want me to design {topic}. Is that correct?",
    "Interesting! Before I start, could you tell me more about the style or tone you're aiming for?",
  ],
  // Round 2: Ask for details
  [
    "Perfect! What colors or visual style would you prefer?",
    "Great! Do you have any specific requirements or preferences for this?",
    "Sounds good! Should I focus on any particular aspect or feature?",
  ],
  // Round 3: Ready to generate (triggers canvas)
  [
    "Excellent! I have everything I need. Let me create that for you now...",
    "Perfect! I'll start working on your design right away.",
    "Got it! Creating your slides now based on your requirements.",
  ],
]

// Colors for fake artifacts
const ARTIFACT_COLORS = ["#FFB3BA", "#BAFFC9", "#BAE1FF", "#FFFFBA", "#FFD9BA", "#E0BBE4"]

interface ChatViewProps {
  page: Page
}

export function ChatView({ page }: ChatViewProps) {
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addMessage, addArtifact, setCanvasOpen } = useWorkspace()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [page.messages, isTyping])

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage = inputValue.trim()
    setInputValue("")

    // Add user message
    addMessage(page.id, {
      role: "user",
      content: userMessage,
    })

    // Simulate AI typing
    setIsTyping(true)

    // Wait a bit before responding
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Determine which round we're on (count user messages)
    const userMessageCount = page.messages.filter((m) => m.role === "user").length + 1
    const roundIndex = Math.min(userMessageCount - 1, AI_RESPONSES.length - 1)

    // Get random response from current round
    const responses = AI_RESPONSES[roundIndex]
    const response = responses[Math.floor(Math.random() * responses.length)]

    // Add AI response
    addMessage(page.id, {
      role: "assistant",
      content: response,
    })

    setIsTyping(false)

    // If this is the 3rd user message (round 3), trigger canvas after response
    if (userMessageCount === 3) {
      // Wait a bit, then add artifacts and open canvas
      setTimeout(() => {
        // Add 2-3 fake artifacts
        const artifactCount = 2 + Math.floor(Math.random() * 2)
        for (let i = 0; i < artifactCount; i++) {
          setTimeout(() => {
            addArtifact(page.id, {
              title: `Slide ${i + 1}`,
              color: ARTIFACT_COLORS[i % ARTIFACT_COLORS.length],
            })
          }, i * 300)
        }

        // Open canvas
        setTimeout(() => {
          setCanvasOpen(page.id, true)
        }, artifactCount * 300 + 200)
      }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          {page.messages.map((message) => (
            <div
              key={message.id}
              className={`mb-6 flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="mb-6 flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2 rounded-2xl border bg-background px-4 py-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isTyping}
              className="border-0 text-base shadow-none focus-visible:ring-0"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="h-9 w-9 shrink-0 rounded-lg"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
