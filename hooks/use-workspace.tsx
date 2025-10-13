"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import { MessageSquare, type LucideIcon } from "lucide-react"

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export type ChatMode = "fullscreen" | "canvas"

export type Page = {
  id: string
  name: string
  icon: LucideIcon
  folderId: string | null
  createdAt: Date
  updatedAt: Date
  // Chat-related fields
  chatMessages: ChatMessage[]
  chatMode: ChatMode
}

export type Folder = {
  id: string
  name: string
  createdAt: Date
  isExpanded: boolean
}

type WorkspaceContextType = {
  pages: Page[]
  folders: Folder[]
  selectedPageId: string | null

  // Page operations
  createPage: (name: string, folderId?: string | null) => Page
  deletePage: (id: string) => void
  renamePage: (id: string, newName: string) => void
  copyPage: (id: string) => Page
  movePage: (pageId: string, folderId: string | null) => void
  selectPage: (id: string | null) => void

  // Folder operations
  createFolder: (name: string) => Folder
  deleteFolder: (id: string) => void
  renameFolder: (id: string, newName: string) => void
  toggleFolder: (id: string) => void

  // Chat operations
  addChatMessage: (pageId: string, message: Omit<ChatMessage, "id" | "timestamp">) => void
  updateChatMode: (pageId: string, mode: ChatMode) => void
  getChatMessages: (pageId: string) => ChatMessage[]
  getChatMode: (pageId: string) => ChatMode

  // Sidebar width (shared between workspace and chat panel)
  sidebarWidth: number
  setSidebarWidth: (width: number) => void
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

const STORAGE_KEY_PAGES = "workspace_pages"
const STORAGE_KEY_FOLDERS = "workspace_folders"

// Sample initial data
const initialPages: Page[] = [
  {
    id: "1",
    name: "Landing Page Design",
    icon: MessageSquare,
    folderId: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    chatMessages: [],
    chatMode: "fullscreen",
  },
  {
    id: "2",
    name: "Dashboard UI Mockup",
    icon: MessageSquare,
    folderId: null,
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
    chatMessages: [],
    chatMode: "fullscreen",
  },
  {
    id: "3",
    name: "Mobile App Wireframe",
    icon: MessageSquare,
    folderId: null,
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
    chatMessages: [],
    chatMode: "fullscreen",
  },
]

const SIDEBAR_WIDTH_MIN = 12 // rem
const SIDEBAR_WIDTH_MAX = 30 // rem
const SIDEBAR_WIDTH_DEFAULT = 16 // rem

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sidebarWidth, setSidebarWidthState] = useState(SIDEBAR_WIDTH_DEFAULT)

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedPages = localStorage.getItem(STORAGE_KEY_PAGES)
      const storedFolders = localStorage.getItem(STORAGE_KEY_FOLDERS)

      if (storedPages) {
        const parsed = JSON.parse(storedPages)
        // Restore icon reference and migrate old data
        setPages(parsed.map((p: any) => ({
          ...p,
          icon: MessageSquare,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          // Migrate old pages without chat fields
          chatMessages: p.chatMessages || [],
          chatMode: p.chatMode || "fullscreen",
        })))
      } else {
        setPages(initialPages)
      }

      if (storedFolders) {
        const parsed = JSON.parse(storedFolders)
        setFolders(parsed.map((f: any) => ({ ...f, createdAt: new Date(f.createdAt) })))
      }
    } catch (error) {
      console.error("Failed to load workspace data:", error)
      setPages(initialPages)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages))
    } catch (error) {
      console.error("Failed to save pages:", error)
    }
  }, [pages, isInitialized])

  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders))
    } catch (error) {
      console.error("Failed to save folders:", error)
    }
  }, [folders, isInitialized])

  // Page operations
  const createPage = useCallback((name: string, folderId: string | null = null): Page => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      name,
      icon: MessageSquare,
      folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      chatMessages: [],
      chatMode: "fullscreen",
    }
    setPages((prev) => [newPage, ...prev])
    return newPage
  }, [])

  const deletePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id))
    if (selectedPageId === id) {
      setSelectedPageId(null)
    }
  }, [selectedPageId])

  const renamePage = useCallback((id: string, newName: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName, updatedAt: new Date() } : p))
    )
  }, [])

  const copyPage = useCallback((id: string): Page => {
    const page = pages.find((p) => p.id === id)
    if (!page) throw new Error("Page not found")

    const newPage: Page = {
      ...page,
      id: `page-${Date.now()}`,
      name: `${page.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Reset chat for copied page
      chatMessages: [],
      chatMode: "fullscreen",
    }
    setPages((prev) => [newPage, ...prev])
    return newPage
  }, [pages])

  const movePage = useCallback((pageId: string, folderId: string | null) => {
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, folderId, updatedAt: new Date() } : p))
    )
  }, [])

  const selectPage = useCallback((id: string | null) => {
    setSelectedPageId(id)
  }, [])

  // Folder operations
  const createFolder = useCallback((name: string): Folder => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      createdAt: new Date(),
      isExpanded: true,
    }
    setFolders((prev) => [...prev, newFolder])
    return newFolder
  }, [])

  const deleteFolder = useCallback((id: string) => {
    // Delete all pages in this folder
    setPages((prev) => {
      const pagesInFolder = prev.filter((p) => p.folderId === id)
      // If selected page is in this folder, clear selection
      if (pagesInFolder.some((p) => p.id === selectedPageId)) {
        setSelectedPageId(null)
      }
      return prev.filter((p) => p.folderId !== id)
    })
    setFolders((prev) => prev.filter((f) => f.id !== id))
  }, [selectedPageId])

  const renameFolder = useCallback((id: string, newName: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    )
  }, [])

  const toggleFolder = useCallback((id: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isExpanded: !f.isExpanded } : f))
    )
  }, [])

  // Chat operations
  const addChatMessage = useCallback((pageId: string, message: Omit<ChatMessage, "id" | "timestamp">) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page

        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
        }
        const newMessages = [...page.chatMessages, newMessage]

        // Auto-switch to canvas mode on 3rd AI response
        const aiMessageCount = newMessages.filter((m) => m.role === "assistant").length
        const shouldSwitchToCanvas = aiMessageCount === 3 && page.chatMode === "fullscreen"

        return {
          ...page,
          chatMessages: newMessages,
          chatMode: shouldSwitchToCanvas ? "canvas" : page.chatMode,
          updatedAt: new Date(),
        }
      })
    )
  }, [])

  const updateChatMode = useCallback((pageId: string, mode: ChatMode) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, chatMode: mode, updatedAt: new Date() } : page
      )
    )
  }, [])

  const getChatMessages = useCallback(
    (pageId: string): ChatMessage[] => {
      const page = pages.find((p) => p.id === pageId)
      return page?.chatMessages || []
    },
    [pages]
  )

  const getChatMode = useCallback(
    (pageId: string): ChatMode => {
      const page = pages.find((p) => p.id === pageId)
      return page?.chatMode || "fullscreen"
    },
    [pages]
  )

  const setSidebarWidth = useCallback((width: number) => {
    const clampedWidth = Math.min(Math.max(width, SIDEBAR_WIDTH_MIN), SIDEBAR_WIDTH_MAX)
    setSidebarWidthState(clampedWidth)
  }, [])

  return (
    <WorkspaceContext.Provider
      value={{
        pages,
        folders,
        selectedPageId,
        createPage,
        deletePage,
        renamePage,
        copyPage,
        movePage,
        selectPage,
        createFolder,
        deleteFolder,
        renameFolder,
        toggleFolder,
        addChatMessage,
        updateChatMode,
        getChatMessages,
        getChatMode,
        sidebarWidth,
        setSidebarWidth,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
