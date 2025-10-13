"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import {
  Plus,
  Shuffle,
  Clock,
  ArrowUp,
  ChevronDown,
  Pencil,
  GraduationCap,
  Code,
  Coffee,
  Sparkles,
  Presentation,
  BookOpen,
  FileText,
  ImageIcon,
  Lightbulb,
  Users,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useWorkspace, type ChatMode } from "@/hooks/use-workspace"
import { useAuth } from "@/hooks/use-auth"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const useCases = [
  {
    id: "pitch-deck",
    title: "Pitch Deck",
    description: "Investor presentations",
    icon: Presentation,
    prompt: "Describe your startup idea and what you need for your pitch deck...",
  },
  {
    id: "lecture-slides",
    title: "Lecture Slides",
    description: "Educational content",
    icon: BookOpen,
    prompt: "What topic would you like to teach? Describe your lecture content...",
  },
  {
    id: "tutorial",
    title: "Tutorial",
    description: "Step-by-step guides",
    icon: FileText,
    prompt: "What would you like to teach? Describe the tutorial steps...",
  },
  {
    id: "moodboard",
    title: "Moodboard",
    description: "Visual inspiration",
    icon: ImageIcon,
    prompt: "Describe the style, mood, and visual direction you're exploring...",
  },
  {
    id: "brainstorming",
    title: "Brainstorming",
    description: "Ideation boards",
    icon: Lightbulb,
    prompt: "What problem or idea would you like to brainstorm about?",
  },
  {
    id: "team-collaboration",
    title: "Team Collaboration",
    description: "Shared workspaces",
    icon: Users,
    prompt: "Describe your team project or what you'd like to collaborate on...",
  },
]

const models = [
  { id: "sonnet-3.5", name: "Sonnet 3.5", requiresPro: false },
  { id: "opus-4.1", name: "Opus 4.1", requiresPro: true },
  { id: "gpt-4", name: "GPT-4", requiresPro: true },
]

const CHAT_PANEL_WIDTH_MIN = 12 // rem
const CHAT_PANEL_WIDTH_MAX = 30 // rem

// Chat panel resize handle component
function ChatPanelRail({
  sidebarWidth,
  setSidebarWidth,
  chatPanelRef,
}: {
  sidebarWidth: number
  setSidebarWidth: (width: number) => void
  chatPanelRef: React.RefObject<HTMLDivElement>
}) {
  const [isResizing, setIsResizing] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startWidth = sidebarWidth
    const chatPanel = chatPanelRef.current

    if (!chatPanel) return

    // Disable transitions during resize for smoother experience
    chatPanel.style.transition = 'none'

    let currentWidth = startWidth

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaRem = deltaX / 16 // Convert px to rem (assuming 1rem = 16px)
      currentWidth = Math.min(
        Math.max(startWidth + deltaRem, CHAT_PANEL_WIDTH_MIN),
        CHAT_PANEL_WIDTH_MAX
      )

      // Update width directly on element for immediate visual feedback
      chatPanel.style.width = `${currentWidth}rem`
    }

    const handleMouseUp = () => {
      setIsResizing(false)

      // Re-enable transitions
      chatPanel.style.transition = ''

      // Sync final width to React state
      setSidebarWidth(currentWidth)

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [sidebarWidth, setSidebarWidth, chatPanelRef])

  return (
    <button
      aria-label="Resize Chat Panel"
      tabIndex={-1}
      onMouseDown={handleMouseDown}
      title="Resize Chat Panel"
      className={cn(
        "hover:after:bg-border absolute inset-y-0 right-0 z-20 w-4 translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] cursor-col-resize",
        isResizing && "after:bg-primary after:w-1"
      )}
    />
  )
}

interface ChatAppProps {
  pageId: string | null // null表示workspace home
}

export function ChatApp({ pageId }: ChatAppProps) {
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [selectedModel, setSelectedModel] = useState("sonnet-3.5")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(true)
  const chatPanelRef = React.useRef<HTMLDivElement>(null)

  const { pages, getChatMessages, getChatMode, createPage, selectPage, addChatMessage, sidebarWidth, setSidebarWidth } = useWorkspace()
  const { requireAuth, requirePro, isPro } = useAuth()
  const { setOpen } = useSidebar()

  // 判断是否是workspace home
  const isWorkspaceHome = pageId === null

  // 获取当前页面数据
  const currentPage = pageId ? pages.find((p) => p.id === pageId) : null
  const messages = pageId ? getChatMessages(pageId) : []
  const chatMode = pageId ? getChatMode(pageId) : "fullscreen"

  // Track previous chatMode to detect transitions
  const prevChatModeRef = React.useRef<ChatMode | null>(null)

  // Close workspace sidebar only when first entering canvas mode
  React.useEffect(() => {
    if (chatMode === "canvas" && prevChatModeRef.current !== "canvas" && pageId) {
      // Close sidebar when transitioning to canvas mode
      setOpen(false)
    }
    prevChatModeRef.current = chatMode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMode, pageId])

  const handleModelSelect = (modelId: string) => {
    const model = models.find((m) => m.id === modelId)
    if (!model) return

    if (model.requiresPro && !requirePro()) {
      return
    }

    setSelectedModel(modelId)
  }

  const handleUseCaseClick = (useCaseId: string) => {
    if (selectedUseCase === useCaseId) {
      // Double click: quick start
      handleQuickStart(useCaseId)
    } else {
      setSelectedUseCase(useCaseId)
      // Focus input
      const input = document.querySelector('input[placeholder]') as HTMLInputElement
      if (input) {
        input.focus()
        input.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  const handleQuickStart = (useCaseId: string) => {
    if (!requireAuth()) return

    const useCase = useCases.find((uc) => uc.id === useCaseId)
    setIsProcessing(true)

    setTimeout(() => {
      const newPage = createPage(useCase?.title || "New Chat")
      selectPage(newPage.id)
      setSelectedUseCase(null)
      setIsProcessing(false)
    }, 300)
  }

  const handleSubmit = () => {
    if (!inputValue.trim() || isProcessing) return
    if (!requireAuth()) return

    const userMessage = inputValue.trim()
    setIsProcessing(true)

    // If workspace home, create new page and add first message
    if (isWorkspaceHome) {
      setTimeout(() => {
        const useCaseTitle = selectedUseCase
          ? useCases.find((uc) => uc.id === selectedUseCase)?.title
          : "New Chat"

        const pageTitle = userMessage.slice(0, 50) || useCaseTitle || "Untitled"
        const newPage = createPage(pageTitle)

        // Add user message
        addChatMessage(newPage.id, {
          role: "user",
          content: userMessage,
        })

        // Simulate AI response after delay
        setTimeout(() => {
          generateAIResponse(newPage.id, 1)
        }, 800)

        selectPage(newPage.id)
        setInputValue("")
        setSelectedUseCase(null)
        setIsProcessing(false)
      }, 300)
    } else if (pageId) {
      // If in chat mode, add message to existing page
      addChatMessage(pageId, {
        role: "user",
        content: userMessage,
      })

      setInputValue("")

      // Get current message count to determine AI response
      const currentMessages = getChatMessages(pageId)
      const userMessageCount = currentMessages.filter((m) => m.role === "user").length + 1

      // Simulate AI response
      setTimeout(() => {
        generateAIResponse(pageId, userMessageCount)
        setIsProcessing(false)
      }, 800)
    }
  }

  const generateAIResponse = (targetPageId: string, roundNumber: number) => {
    const responses = [
      "I'd be happy to help you with that! Could you provide more details about what you're looking for? For example, what's the main goal or purpose?",
      "That sounds interesting! Let me understand better - what specific features or elements would you like to include? Any particular style or aesthetic you prefer?",
      "Perfect! I have a clear understanding now. Let me create something for you based on our discussion...",
    ]

    const response = responses[Math.min(roundNumber - 1, responses.length - 1)]

    addChatMessage(targetPageId, {
      role: "assistant",
      content: response,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const currentPlaceholder = selectedUseCase
    ? useCases.find((uc) => uc.id === selectedUseCase)?.prompt || "How can I help you today?"
    : "How can I help you today?"

  // Handlers for canvas mode sidebar control
  const handlePageOnHover = () => {
    setOpen(true)
  }

  // 根据状态渲染不同视图
  if (isWorkspaceHome) {
    // Workspace Home: 初始状态
    return (
      <div className="flex h-screen flex-col bg-[#f5f3f0] animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-3xl space-y-8">
            <h1 className="text-center font-serif text-5xl font-normal text-foreground">
              yahaha returns!
            </h1>

            {/* Input box */}
            <div className="rounded-2xl border bg-background p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                    <Shuffle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                  >
                    <Clock className="h-5 w-5" />
                  </Button>
                </div>
                <div className="relative flex-1">
                  {selectedUseCase && (
                    <div className="absolute -top-6 left-0 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>{useCases.find((uc) => uc.id === selectedUseCase)?.title}</span>
                      <button
                        onClick={() => setSelectedUseCase(null)}
                        className="ml-1 hover:text-foreground transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={currentPlaceholder}
                    disabled={isProcessing}
                    className="border-0 text-base shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-1 text-sm font-normal">
                        {models.find((m) => m.id === selectedModel)?.name}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Models
                      </DropdownMenuLabel>
                      {models.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => handleModelSelect(model.id)}
                        >
                          <span className="flex items-center gap-2">
                            {model.name}
                            {model.requiresPro && !isPro && (
                              <Badge variant="secondary" className="text-xs">
                                Pro
                              </Badge>
                            )}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="icon"
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || isProcessing}
                    className="h-9 w-9 rounded-lg bg-[#e8a89a] hover:bg-[#d99888] disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowUp className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                <Pencil className="h-4 w-4" />
                Write
              </Button>
              <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                <GraduationCap className="h-4 w-4" />
                Learn
              </Button>
              <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                <Code className="h-4 w-4" />
                Code
              </Button>
              <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                <Coffee className="h-4 w-4" />
                Life stuff
              </Button>
              <Button variant="outline" className="gap-2 rounded-full bg-transparent">
                <Sparkles className="h-4 w-4" />
                Claude&apos;s choice
              </Button>
            </div>

            {/* Use Cases Section */}
            <div className="mt-12">
              <h2 className="mb-6 text-center text-sm font-medium text-muted-foreground">
                Popular Use Cases
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {useCases.map((useCase) => {
                  const Icon = useCase.icon
                  const isSelected = selectedUseCase === useCase.id
                  return (
                    <button
                      key={useCase.id}
                      onClick={() => handleUseCaseClick(useCase.id)}
                      disabled={isProcessing}
                      className={`group relative flex flex-col items-center gap-3 rounded-xl border bg-background p-4 transition-all hover:border-foreground/20 hover:shadow-sm disabled:opacity-50 ${
                        isSelected ? "border-primary ring-2 ring-primary/20" : ""
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground animate-in fade-in zoom-in-95 duration-200">
                          Click again to start
                        </div>
                      )}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary group-hover:bg-primary/20"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{useCase.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{useCase.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Chat mode: 全屏或分屏
  if (chatMode === "fullscreen") {
    // 全屏聊天模式
    return (
      <div className="flex h-screen flex-col bg-[#f5f3f0]">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto chat-messages-scroll">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.length === 0 ? (
              // Empty state - show use cases
              <div className="mt-12 space-y-8">
                <h1 className="text-center font-serif text-4xl font-normal text-foreground">
                  Continue the conversation
                </h1>

                {/* Use Cases Section */}
                <div>
                  <h2 className="mb-4 text-center text-sm font-medium text-muted-foreground">
                    Popular Use Cases
                  </h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {useCases.map((useCase) => {
                      const Icon = useCase.icon
                      return (
                        <button
                          key={useCase.id}
                          onClick={() => setSelectedUseCase(useCase.id)}
                          className="group flex flex-col items-center gap-3 rounded-xl border bg-background p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{useCase.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {useCase.description}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // Messages display
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <span className="text-xs font-medium">You</span>
                      </div>
                    )}
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl border bg-background px-4 py-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }}></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }}></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input area - fixed at bottom */}
        <div className="border-t bg-background">
          <div className="mx-auto max-w-3xl p-4">
            <div className="flex items-center gap-3 rounded-2xl border bg-background p-3 shadow-sm">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative flex-1">
                {selectedUseCase && (
                  <div className="absolute -top-6 left-0 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                    <span>{useCases.find((uc) => uc.id === selectedUseCase)?.title}</span>
                    <button
                      onClick={() => setSelectedUseCase(null)}
                      className="ml-1 hover:text-foreground transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentPlaceholder}
                  disabled={isProcessing}
                  className="border-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs font-normal h-8">
                      {models.find((m) => m.id === selectedModel)?.name}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Models
                    </DropdownMenuLabel>
                    {models.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => handleModelSelect(model.id)}
                      >
                        <span className="flex items-center gap-2 text-sm">
                          {model.name}
                          {model.requiresPro && !isPro && (
                            <Badge variant="secondary" className="text-xs">
                              Pro
                            </Badge>
                          )}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isProcessing}
                  className="h-8 w-8 rounded-lg bg-[#e8a89a] hover:bg-[#d99888] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Canvas mode: 左右分屏
  return (
    <div className="flex h-screen">
      {/* Left: Chat panel with dynamic width */}
      {isChatPanelVisible && (
        <div
          ref={chatPanelRef}
          className="border-r bg-[#f5f3f0] flex flex-col animate-in fade-in slide-in-from-left-4 duration-500 relative overflow-visible"
          style={{ width: `${sidebarWidth}rem` }}
        >
          {/* Chat Header - similar to workspace sidebar header */}
          <div className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => selectPage(null)}
                  onMouseEnter={handlePageOnHover}
                  className="text-lg font-semibold transition-colors cursor-pointer hover:text-primary"
                >
                  PageOn
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                Create new
              </TooltipContent>
            </Tooltip>
            <button
              onClick={() => setIsChatPanelVisible(false)}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent"
              title="Hide chat panel"
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
          </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto chat-messages-scroll">
          <div className="px-4 py-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Sparkles className="h-3 w-3" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-xl px-3 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    }`}
                  >
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <span className="text-[10px] font-medium">You</span>
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <div className="max-w-[75%] rounded-xl border bg-background px-3 py-2">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input area - fixed at bottom */}
        <div className="border-t bg-background p-3">
          <div className="flex items-center gap-2 rounded-xl border bg-background p-2 shadow-sm">
            <div className="relative flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Continue the conversation..."
                disabled={isProcessing}
                className="border-0 text-xs shadow-none focus-visible:ring-0 h-8"
              />
            </div>
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isProcessing}
              className="h-7 w-7 rounded-lg bg-[#e8a89a] hover:bg-[#d99888] disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ArrowUp className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Resize handle */}
        <ChatPanelRail sidebarWidth={sidebarWidth} setSidebarWidth={setSidebarWidth} chatPanelRef={chatPanelRef} />
      </div>
      )}

      {/* Right: Canvas panel (fullscreen when chat is hidden) */}
      <div className="flex-1 bg-muted/20 overflow-y-auto relative animate-in fade-in slide-in-from-right-4 duration-500">
        {/* Show chat toggle button when chat panel is hidden */}
        {!isChatPanelVisible && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => setIsChatPanelVisible(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border shadow-sm transition-colors hover:bg-accent"
              title="Show chat panel"
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
          </div>
        )}
        <div className="p-8 space-y-6">
          {/* Artifacts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Generated Artifacts</h2>
              <Badge variant="secondary" className="text-xs">
                {messages.filter((m) => m.role === "assistant").length} artifacts
              </Badge>
            </div>

            {/* Placeholder Bento Grid Artifacts */}
            <div className="space-y-4">
              {/* Artifact 1: Large card */}
              <div className="rounded-xl border bg-background p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium">Design Concept</h3>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View Details
                  </Button>
                </div>
                <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                  <div className="text-center">
                    <Presentation className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Generated Design</p>
                  </div>
                </div>
              </div>

              {/* Artifact 2: Bento grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border bg-background p-4 shadow-sm">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-xs font-medium">Asset 1</p>
                </div>
                <div className="rounded-xl border bg-background p-4 shadow-sm">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-xs font-medium">Asset 2</p>
                </div>
              </div>

              {/* Artifact 3: Text content */}
              <div className="rounded-xl border bg-background p-6 shadow-sm">
                <h3 className="text-sm font-medium mb-3">Content Outline</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
                    <p>Introduction and overview</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
                    <p>Key features and benefits</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
                    <p>Implementation details</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5"></div>
                    <p>Next steps and conclusion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
