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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const INITIAL_DISPLAY_COUNT = 5
const MIN_NAME_LENGTH = 1
const MAX_NAME_LENGTH = 50

export function NavPages() {
  const { isMobile, setOpen } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: "page" | "folder"
    id: string
    name: string
    pageCount?: number
  } | null>(null)

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
    getChatMode,
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

  // Validation function
  const validateName = (name: string): string | null => {
    const trimmed = name.trim()
    if (trimmed.length < MIN_NAME_LENGTH) {
      return "Name cannot be empty"
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      return `Name must be ${MAX_NAME_LENGTH} characters or less`
    }
    return null
  }

  const handlePageAction = (action: string, page: Page) => {
    switch (action) {
      case "rename":
        setEditingId(page.id)
        setEditingValue(page.name)
        setValidationError(null)
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
        setDeleteDialog({
          open: true,
          type: "page",
          id: page.id,
          name: page.name,
        })
        break
    }
  }

  const handleFolderAction = (action: string, folder: Folder) => {
    switch (action) {
      case "rename":
        setEditingId(folder.id)
        setEditingValue(folder.name)
        setValidationError(null)
        break
      case "delete":
        const pagesInFolder = pages.filter((p) => p.folderId === folder.id)
        setDeleteDialog({
          open: true,
          type: "folder",
          id: folder.id,
          name: folder.name,
          pageCount: pagesInFolder.length,
        })
        break
    }
  }

  const handleEditConfirm = () => {
    if (!editingId) return

    const error = validateName(editingValue)
    if (error) {
      setValidationError(error)
      return
    }

    // Check if it's a page or folder
    const isPage = pages.find((p) => p.id === editingId)
    if (isPage) {
      renamePage(editingId, editingValue.trim())
    } else {
      renameFolder(editingId, editingValue.trim())
    }

    setEditingId(null)
    setEditingValue("")
    setValidationError(null)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingValue("")
    setValidationError(null)
  }

  const handleEditingValueChange = (value: string) => {
    setEditingValue(value)
    // Real-time validation
    if (value.trim().length > 0) {
      setValidationError(validateName(value))
    }
  }

  const handleCreateFolder = () => {
    setIsCreatingFolder(true)
    setEditingValue("")
    setValidationError(null)
  }

  const handleNewFolderConfirm = () => {
    const error = validateName(editingValue)
    if (error) {
      setValidationError(error)
      return
    }
    createFolder(editingValue.trim())
    setIsCreatingFolder(false)
    setEditingValue("")
    setValidationError(null)
  }

  const handleNewFolderCancel = () => {
    setIsCreatingFolder(false)
    setEditingValue("")
    setValidationError(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteDialog) return

    if (deleteDialog.type === "page") {
      deletePage(deleteDialog.id)
    } else {
      deleteFolder(deleteDialog.id)
    }

    setDeleteDialog(null)
  }

  const handleDeleteCancel = () => {
    setDeleteDialog(null)
  }

  const handlePageClick = (pageId: string) => {
    selectPage(pageId)

    // Close sidebar after page selection
    setOpen(false)
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
    const isEditing = editingId === page.id

    const content = (
      <>
        {isEditing ? (
          <div className="flex flex-col gap-1 px-2 py-1.5">
            <div className="flex items-center gap-1">
              <Input
                value={editingValue}
                onChange={(e) => handleEditingValueChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditConfirm()
                  } else if (e.key === "Escape") {
                    handleEditCancel()
                  }
                }}
                onBlur={handleEditConfirm}
                autoFocus
                className={`h-7 text-sm ${validationError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
            </div>
            {(validationError || editingValue.length > 0) && (
              <div className="flex items-center justify-between text-xs px-1">
                {validationError ? (
                  <span className="text-destructive">{validationError}</span>
                ) : (
                  <span className="text-muted-foreground">
                    {editingValue.length}/{MAX_NAME_LENGTH}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <SidebarMenuButton
              onClick={() => handlePageClick(page.id)}
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
        )}
      </>
    )

    if (isInFolder) {
      // For items in folders, use SidebarMenuSubItem which is already a <li>
      return (
        <SidebarMenuSubItem
          key={page.id}
          className="animate-in fade-in slide-in-from-left-2 duration-200 group/menu-item"
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
        className="animate-in fade-in slide-in-from-left-2 duration-200 group/menu-item"
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
              onClick={handleCreateFolder}
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
          className={`flex-1 min-h-[400px] rounded-md transition-all duration-200 relative ${
            dragOverTarget === "root" && isDragging
              ? "bg-primary/10 ring-2 ring-primary shadow-lg shadow-primary/20"
              : ""
          }`}
          onDragOver={handleRootDragOver}
          onDrop={handleDrop}
        >
          {dragOverTarget === "root" && isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in zoom-in-95 fade-in duration-200">
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
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-sm font-medium">Drop here to move to root</span>
              </div>
            </div>
          )}
          <SidebarMenu className="flex-1 p-2 min-h-[300px]">
            {/* New Folder Creation */}
            {isCreatingFolder && (
              <SidebarMenuItem>
                <div className="flex flex-col gap-1 px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <FolderIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      value={editingValue}
                      onChange={(e) => handleEditingValueChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleNewFolderConfirm()
                        } else if (e.key === "Escape") {
                          handleNewFolderCancel()
                        }
                      }}
                      onBlur={handleNewFolderConfirm}
                      placeholder="Folder name"
                      autoFocus
                      className={`h-7 text-sm ${validationError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  </div>
                  {(validationError || editingValue.length > 0) && (
                    <div className="flex items-center justify-between text-xs px-1 ml-6">
                      {validationError ? (
                        <span className="text-destructive">{validationError}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {editingValue.length}/{MAX_NAME_LENGTH}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </SidebarMenuItem>
            )}

            {/* Folders */}
            {folders.map((folder) => {
              const folderPages = getPagesByFolder(folder.id)
              if (searchQuery && folderPages.length === 0) return null

              const isFolderHovered = dragOverTarget === `folder-${folder.id}`
              const isEditingFolder = editingId === folder.id

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
                    className={`rounded-md transition-all duration-200 relative ${
                      isFolderHovered
                        ? "bg-primary/10 ring-2 ring-primary shadow-md shadow-primary/20 scale-[1.02]"
                        : ""
                    }`}
                  >
                    {isFolderHovered && isDragging && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none whitespace-nowrap">
                        <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md shadow-lg flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                          </svg>
                          <span className="text-xs font-medium">Drop into folder</span>
                        </div>
                      </div>
                    )}
                    <SidebarMenuItem>
                      {isEditingFolder ? (
                        <div className="flex flex-col gap-1 px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            <FolderIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Input
                              value={editingValue}
                              onChange={(e) => handleEditingValueChange(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleEditConfirm()
                                } else if (e.key === "Escape") {
                                  handleEditCancel()
                                }
                              }}
                              onBlur={handleEditConfirm}
                              autoFocus
                              className={`h-7 text-sm flex-1 ${validationError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                          </div>
                          {(validationError || editingValue.length > 0) && (
                            <div className="flex items-center justify-between text-xs px-1 ml-6">
                              {validationError ? (
                                <span className="text-destructive">{validationError}</span>
                              ) : (
                                <span className="text-muted-foreground">
                                  {editingValue.length}/{MAX_NAME_LENGTH}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog?.open} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog?.type === "page" ? "Delete Page" : "Delete Folder"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === "page" ? (
                <>
                  Permanently delete <strong>{deleteDialog.name}</strong>?
                  <br /><br />
                  This action cannot be undone.
                </>
              ) : (
                <>
                  Permanently delete folder <strong>{deleteDialog?.name}</strong>
                  {deleteDialog?.pageCount && deleteDialog.pageCount > 0 ? (
                    <>
                      {" "}and all <strong>{deleteDialog.pageCount}</strong> page{deleteDialog.pageCount > 1 ? "s" : ""} inside
                    </>
                  ) : null}?
                  <br /><br />
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
