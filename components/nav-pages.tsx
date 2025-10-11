"use client"

import { useState, useRef } from "react"
import {
  ChevronDown,
  Search,
  MoreHorizontal,
  Edit2,
  Copy,
  Share2,
  Trash2,
  FolderPlus,
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
} from "lucide-react"

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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWorkspace, type Page, type Folder } from "@/hooks/use-workspace"
import { useAuth } from "@/hooks/use-auth"
import { RenameDialog } from "@/components/rename-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const INITIAL_DISPLAY_COUNT = 5

export function NavPages() {
  const { isMobile } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ type: "page" | "folder"; id: string; name: string } | null>(null)
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false)

  // Drag states
  const [isDragging, setIsDragging] = useState(false)
  const [draggingPageId, setDraggingPageId] = useState<string | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const dragOverTargetRef = useRef<string | null>(null)

  const {
    pages,
    folders,
    selectedPageId,
    selectPage,
    deletePage,
    renamePage,
    copyPage,
    movePage,
    createFolder,
    deleteFolder,
    renameFolder,
    toggleFolder,
  } = useWorkspace()

  // Import useAuth to check login status
  const { isAuthenticated } = useAuth()

  // Don't render if not logged in
  if (!isAuthenticated) {
    return null
  }

  // Filter pages by search query
  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get pages not in any folder (root level)
  const rootPages = filteredPages.filter((page) => !page.folderId)

  // Get pages grouped by folder
  const getPagesByFolder = (folderId: string) =>
    filteredPages.filter((page) => page.folderId === folderId)

  const displayedRootPages = isExpanded ? rootPages : rootPages.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMore = rootPages.length > INITIAL_DISPLAY_COUNT

  const handlePageAction = (action: string, page: Page) => {
    switch (action) {
      case "rename":
        // 延迟打开对话框，让 DropdownMenu 有时间完全关闭
        setTimeout(() => {
          setRenameTarget({ type: "page", id: page.id, name: page.name })
          setRenameDialogOpen(true)
        }, 100)
        break
      case "copy":
        const newPage = copyPage(page.id)
        selectPage(newPage.id)
        break
      case "share":
        // TODO: Implement share functionality
        alert(`Share page: ${page.name}`)
        break
      case "delete":
        if (confirm(`Delete "${page.name}"?`)) {
          deletePage(page.id)
        }
        break
    }
  }

  const handleFolderAction = (action: string, folder: Folder) => {
    switch (action) {
      case "rename":
        // 延迟打开对话框，让 DropdownMenu 有时间完全关闭
        setTimeout(() => {
          setRenameTarget({ type: "folder", id: folder.id, name: folder.name })
          setRenameDialogOpen(true)
        }, 100)
        break
      case "delete":
        const pagesInFolder = pages.filter((p) => p.folderId === folder.id)
        const message = pagesInFolder.length > 0
          ? `Delete "${folder.name}"? (${pagesInFolder.length} pages will be moved to root)`
          : `Delete "${folder.name}"?`
        if (confirm(message)) {
          deleteFolder(folder.id)
        }
        break
    }
  }

  const handleRenameConfirm = (newName: string) => {
    if (!renameTarget) return

    if (renameTarget.type === "page") {
      renamePage(renameTarget.id, newName)
    } else {
      renameFolder(renameTarget.id, newName)
    }
    setRenameTarget(null)
  }

  const handleCreateFolder = (name: string) => {
    createFolder(name)
  }

  const handleDragStart = (e: React.DragEvent, page: Page) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("pageId", page.id)
    setIsDragging(true)
    setDraggingPageId(page.id)
    // 初始化为root
    dragOverTargetRef.current = "root"
    setDragOverTarget("root")
    document.body.style.cursor = "grabbing"
  }

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation() // 阻止冒泡到root handler
    e.dataTransfer.dropEffect = "move"
    const target = `folder-${folderId}`
    dragOverTargetRef.current = target
    setDragOverTarget(target)
  }

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    // 默认就是root，只有folder的handler会改变它
    dragOverTargetRef.current = "root"
    setDragOverTarget("root")
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggingPageId(null)
    setDragOverTarget(null)
    dragOverTargetRef.current = null
    document.body.style.cursor = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pageId = e.dataTransfer.getData("pageId")
    const target = dragOverTargetRef.current

    if (pageId) {
      if (target === "root") {
        movePage(pageId, null)
      } else if (target?.startsWith("folder-")) {
        const folderId = target.replace("folder-", "")
        movePage(pageId, folderId)
      }
    }
    handleDragEnd()
  }

  const renderPageItem = (page: Page, index: number = 0, isInFolder: boolean = false) => {
    const isBeingDragged = draggingPageId === page.id

    const content = (
      <>
        <SidebarMenuButton
          onClick={() => selectPage(page.id)}
          isActive={selectedPageId === page.id}
          className={isBeingDragged ? "opacity-50" : ""}
        >
          <span>{page.name}</span>
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
            <DropdownMenuItem onClick={() => handlePageAction("rename", page)}>
              <Edit2 className="text-muted-foreground" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePageAction("copy", page)}>
              <Copy className="text-muted-foreground" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePageAction("share", page)}>
              <Share2 className="text-muted-foreground" />
              <span>Share</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handlePageAction("delete", page)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="text-destructive" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )

    if (isInFolder) {
      // For items in folders, use SidebarMenuSubItem which is already a <li>
      return (
        <SidebarMenuSubItem
          key={page.id}
          className="animate-in fade-in slide-in-from-left-2 duration-200"
          style={{ animationDelay: `${index * 30}ms` }}
          draggable
          onDragStart={(e) => handleDragStart(e, page)}
          onDragEnd={handleDragEnd}
        >
          {content}
        </SidebarMenuSubItem>
      )
    }

    // For root level items, use SidebarMenuItem
    return (
      <SidebarMenuItem
        key={page.id}
        className="animate-in fade-in slide-in-from-left-2 duration-200"
        style={{ animationDelay: `${index * 30}ms` }}
        draggable
        onDragStart={(e) => handleDragStart(e, page)}
        onDragEnd={handleDragEnd}
      >
        {content}
      </SidebarMenuItem>
    )
  }

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between px-2">
          <SidebarGroupLabel>Recent</SidebarGroupLabel>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 hover:bg-transparent"
              onClick={() => {
                setNewFolderDialogOpen(true)
              }}
              title="New Folder"
            >
              <FolderPlus className="h-4 w-4 text-muted-foreground" />
            </Button>
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
        </div>

        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
        </div>

        <div
          className="flex-1 min-h-0"
          onDragOver={handleRootDragOver}
          onDrop={handleDrop}
        >
          <SidebarMenu className="flex-1 p-2 min-h-[200px]">
            {/* Folders */}
            {folders.map((folder) => {
              const folderPages = getPagesByFolder(folder.id)
              if (searchQuery && folderPages.length === 0) return null

              const isFolderHovered = dragOverTarget === `folder-${folder.id}`

              return (
                <Collapsible
                  key={folder.id}
                  open={folder.isExpanded}
                  onOpenChange={() => toggleFolder(folder.id)}
                  asChild
                >
                  <div
                    data-folder-drop
                    onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                    onDrop={handleDrop}
                    className={`rounded-md transition-all duration-200 ${
                      isFolderHovered
                        ? "bg-accent ring-2 ring-accent-foreground/20"
                        : ""
                    }`}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className={isFolderHovered ? "scale-[1.02]" : ""}>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${
                              folder.isExpanded ? "rotate-90" : ""
                            }`}
                          />
                          {folder.isExpanded ? (
                            <FolderOpen className="h-4 w-4" />
                          ) : (
                            <FolderIcon className="h-4 w-4" />
                          )}
                          <span>{folder.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {folderPages.length}
                          </span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
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
                          <DropdownMenuItem onClick={() => handleFolderAction("rename", folder)}>
                            <Edit2 className="text-muted-foreground" />
                            <span>Rename</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleFolderAction("delete", folder)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="text-destructive" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {folderPages.map((page, index) => renderPageItem(page, index, true))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}

            {/* Root level pages */}
            {displayedRootPages.map((page, index) => renderPageItem(page, index))}
          </SidebarMenu>
        </div>
      </SidebarGroup>

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        title={renameTarget?.type === "folder" ? "Rename Folder" : "Rename Page"}
        currentName={renameTarget?.name || ""}
        onConfirm={handleRenameConfirm}
      />

      {/* New Folder Dialog */}
      <RenameDialog
        open={newFolderDialogOpen}
        onOpenChange={setNewFolderDialogOpen}
        title="New Folder"
        description="Create a new folder to organize your pages"
        currentName=""
        onConfirm={handleCreateFolder}
      />
    </>
  )
}
