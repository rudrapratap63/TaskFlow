"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import api from "@/lib/axios"

interface AuthContextType {
  user: any | null
  isLoading: boolean
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
  checkAuth: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }
      
      const response = await api.get("/users/me")
      setUser(response.data)
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
      localStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    // Basic route protection
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
    
    if (!isLoading) {
      if (!user && !isAuthRoute) {
        // Not logged in and trying to access protected route
        router.push('/login')
      } else if (user && isAuthRoute) {
        // Logged in and trying to access auth route
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, pathname, router])

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
