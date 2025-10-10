"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Palette,
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
  { id: "sonnet-3.5", name: "Sonnet 3.5" },
  { id: "opus-4.1", name: "Opus 4.1" },
  { id: "gpt-4", name: "GPT-4" },
]

function PageContent() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [selectedModel, setSelectedModel] = useState("sonnet-3.5")
  const { setOpen } = useSidebar()

  const handleConversationSelect = (name: string | null) => {
    setSelectedConversation(name)
    if (name) {
      setOpen(true)
    }
  }

  const handleUseCaseClick = (useCaseId: string) => {
    if (selectedUseCase === useCaseId) {
      // If already selected, quick start without input
      handleQuickStart(useCaseId)
    } else {
      setSelectedUseCase(useCaseId)
      // Focus the input
      const input = document.querySelector('input[placeholder]') as HTMLInputElement
      if (input) {
        input.focus()
        // Scroll to input if on mobile
        input.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  const handleQuickStart = (useCaseId: string) => {
    const useCase = useCases.find((uc) => uc.id === useCaseId)
    setIsCreating(true)

    setTimeout(() => {
      setSelectedConversation(useCase?.title || "New Design")
      setSelectedUseCase(null)
      setIsCreating(false)
    }, 800)
  }

  const handleSubmit = () => {
    if (!inputValue.trim() || isCreating) return

    setIsCreating(true)

    // Simulate API call and creation process
    setTimeout(() => {
      const useCaseTitle = selectedUseCase
        ? useCases.find((uc) => uc.id === selectedUseCase)?.title
        : "New Design"

      // Create conversation with title based on input or use case
      const conversationTitle = inputValue.slice(0, 50) || useCaseTitle || "Untitled"
      setSelectedConversation(conversationTitle)

      // Reset form
      setInputValue("")
      setSelectedUseCase(null)
      setIsCreating(false)
    }, 800)
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

  return (
    <>
      <AppSidebar
        selectedConversation={selectedConversation}
        onConversationChange={handleConversationSelect}
      />
      <SidebarInset className="relative">
        <div className="h-screen">
          {selectedConversation ? (
            <div className="flex h-full flex-col bg-muted/20 animate-in fade-in zoom-in-95 duration-500">
              {/* Canvas header with project name */}
              <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <h1 className="text-sm font-semibold">{selectedConversation}</h1>
                </div>
              </header>
              {/* Canvas content */}
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="flex h-full w-full max-w-4xl items-center justify-center rounded-lg border-2 border-dashed bg-background">
                  <div className="text-center text-muted-foreground">
                    <Palette className="mx-auto mb-4 h-12 w-12" />
                    <p className="text-lg font-medium">Design Canvas</p>
                    <p className="mt-1 text-sm">AI-generated designs will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col bg-[#f5f3f0] animate-in fade-in zoom-in-95 duration-500">
              {/* Workspace header with toggle */}
              <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
                <SidebarTrigger className="-ml-1" />
              </header>
              {/* Workspace content */}
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-3xl space-y-8">
                  <h1 className="text-center font-serif text-5xl font-normal text-foreground">yahaha returns!</h1>
                <div className="rounded-2xl border bg-background p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                      >
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
                        disabled={isCreating}
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
                              onClick={() => setSelectedModel(model.id)}
                            >
                              {model.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="icon"
                        onClick={handleSubmit}
                        disabled={!inputValue.trim() || isCreating}
                        className="h-9 w-9 rounded-lg bg-[#e8a89a] hover:bg-[#d99888] disabled:opacity-50"
                      >
                        {isCreating ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <ArrowUp className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
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
                  <h2 className="mb-6 text-center text-sm font-medium text-muted-foreground">Popular Use Cases</h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {useCases.map((useCase) => {
                      const Icon = useCase.icon
                      const isSelected = selectedUseCase === useCase.id
                      return (
                        <button
                          key={useCase.id}
                          onClick={() => handleUseCaseClick(useCase.id)}
                          disabled={isCreating}
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
          )}
        </div>
      </SidebarInset>
    </>
  )
}

export default function Page() {
  return (
    <SidebarProvider>
      <PageContent />
    </SidebarProvider>
  )
}
