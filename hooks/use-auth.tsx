"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"

export type User = {
  id: string
  email: string
  name: string
  avatar?: string
  plan: "free" | "pro"
}

type AuthContextType = {
  isAuthenticated: boolean
  user: User | null
  showLoginDialog: boolean
  setShowLoginDialog: (show: boolean) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  requireAuth: (action?: () => void) => boolean

  // Pro related
  isPro: boolean
  showUpgradeDialog: boolean
  setShowUpgradeDialog: (show: boolean) => void
  requirePro: () => boolean
  upgradeToPro: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = "auth_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化：从 localStorage 读取登录状态
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Failed to load auth state:", error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const isAuthenticated = !!user
  const isPro = user?.plan === "pro"

  const login = useCallback(async (email: string, password: string) => {
    // 模拟登录 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 创建用户数据
    const userData: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      plan: "free", // 默认为 free plan
    }

    setUser(userData)
    // 保存到 localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData))

    // 关闭对话框
    setShowLoginDialog(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    // 清除 localStorage
    localStorage.removeItem(AUTH_STORAGE_KEY)
    // 清理对话框状态
    setShowUpgradeDialog(false)
  }, [])

  const requireAuth = useCallback((action?: () => void): boolean => {
    if (!isAuthenticated) {
      // 延迟打开对话框，让 DropdownMenu 有时间完全关闭
      setTimeout(() => {
        setShowLoginDialog(true)
      }, 100)
      return false
    }
    // 如果已登录，执行传入的操作
    if (action) {
      action()
    }
    return true
  }, [isAuthenticated])

  const requirePro = useCallback((): boolean => {
    // 先检查是否登录
    if (!requireAuth()) {
      return false
    }
    // 再检查是否是 Pro 用户
    if (!isPro) {
      // 延迟打开对话框，让 DropdownMenu 有时间完全关闭
      setTimeout(() => {
        setShowUpgradeDialog(true)
      }, 100)
      return false
    }
    return true
  }, [requireAuth, isPro])

  const upgradeToPro = useCallback(async () => {
    if (!user) return

    // 模拟升级 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 更新用户数据
    const updatedUser: User = {
      ...user,
      plan: "pro",
    }

    setUser(updatedUser)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser))

    // 不在这里关闭对话框，让调用者决定
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        showLoginDialog,
        setShowLoginDialog,
        login,
        logout,
        requireAuth,
        isPro,
        showUpgradeDialog,
        setShowUpgradeDialog,
        requirePro,
        upgradeToPro,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
