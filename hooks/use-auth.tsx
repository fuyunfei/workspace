"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"

export type User = {
  id: string
  email: string
  name: string
  avatar?: string
}

type AuthContextType = {
  isAuthenticated: boolean
  user: User | null
  showLoginDialog: boolean
  setShowLoginDialog: (show: boolean) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  requireAuth: (action?: () => void) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = "auth_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
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

  const login = useCallback(async (email: string, password: string) => {
    // 模拟登录 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 创建用户数据
    const userData: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
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
  }, [])

  const requireAuth = useCallback((action?: () => void): boolean => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return false
    }
    // 如果已登录，执行传入的操作
    if (action) {
      action()
    }
    return true
  }, [isAuthenticated])

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
