"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkspace, type Page } from "@/hooks/use-workspace"

interface CanvasViewProps {
  page: Page
}

export function CanvasView({ page }: CanvasViewProps) {
  const { setCanvasOpen } = useWorkspace()

  const handleClose = () => {
    setCanvasOpen(page.id, false)
  }

  return (
    <div className="flex h-full flex-col bg-muted/20">
      {/* Canvas header */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
        <h2 className="text-sm font-semibold">Canvas</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleClose}
          title="Close canvas"
        >
          <X className="h-4 w-4" />
        </Button>
      </header>

      {/* Canvas content - scrollable artifacts */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {page.artifacts.map((artifact, index) => (
            <div
              key={artifact.id}
              className="animate-in fade-in slide-in-from-bottom-4 rounded-lg border bg-background p-8 shadow-sm"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both",
              }}
            >
              {/* Placeholder slide */}
              <div
                className="flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed"
                style={{ backgroundColor: artifact.color }}
              >
                <div className="text-center">
                  <p className="text-lg font-medium opacity-50">{artifact.title}</p>
                  <p className="mt-2 text-sm opacity-40">Placeholder Slide</p>
                </div>
              </div>
            </div>
          ))}

          {page.artifacts.length === 0 && (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed bg-background">
              <p className="text-sm text-muted-foreground">No artifacts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
