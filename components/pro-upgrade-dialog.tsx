"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Loader2, Sparkles } from "lucide-react"

export function ProUpgradeDialog() {
  const { showUpgradeDialog, setShowUpgradeDialog, upgradeToPro } = useAuth()
  const [isUpgrading, setIsUpgrading] = useState(false)

  // 重置状态当对话框关闭时
  useEffect(() => {
    if (!showUpgradeDialog) {
      setIsUpgrading(false)
    }
  }, [showUpgradeDialog])

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      await upgradeToPro()
      // 成功后关闭对话框
      setShowUpgradeDialog(false)
    } catch (error) {
      console.error("Upgrade failed:", error)
      setIsUpgrading(false)
    }
  }

  const proFeatures = [
    "Unlimited projects",
    "All AI models (GPT-4, Opus)",
    "Export designs to PDF/PNG",
    "Priority support",
    "Advanced templates",
    "Team collaboration",
  ]

  return (
    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
      <DialogContent className="sm:max-w-[480px]" showCloseButton={false}>
        <DialogTitle className="sr-only">Upgrade to Pro</DialogTitle>

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">Upgrade to Pro</h2>
            <p className="mt-2 text-muted-foreground">
              Unlock all features and unleash your creativity
            </p>
          </div>

          {/* Features */}
          <div className="w-full space-y-3">
            {proFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="text-center">
            <div className="text-4xl font-bold">$19</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-3">
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full"
              size="lg"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upgrading...
                </>
              ) : (
                "Upgrade Now"
              )}
            </Button>
            <Button
              onClick={() => setShowUpgradeDialog(false)}
              variant="ghost"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
