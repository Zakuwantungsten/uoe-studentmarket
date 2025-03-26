"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/services/auth-service"
import { User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    password: string
    role: "USER" | "PROVIDER"
    studentId?: string
  }) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        try {
          const response = await authService.getProfile(storedToken)
          if (response.data) {
            setUser(response.data)
            setToken(storedToken)
          }
        } catch (error) {
          localStorage.removeItem("token")
        }
      }
      setIsLoading(false)
    }
    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authService.login({ email, password })
      
      if (!response.data) {
        throw new Error(response.message || "Login failed")
      }

      const { user: userData, token: authToken } = response.data

      localStorage.setItem("token", authToken)
      setUser(userData)
      setToken(authToken)

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      })

      router.push(userData.role === "ADMIN" ? "/admin" : "/dashboard")
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.message || "Invalid credentials",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    name: string
    email: string
    password: string
    role: "USER" | "PROVIDER"
    studentId?: string
  }) => {
    setIsLoading(true)
    try {
      const response = await authService.register(data)
      
      if (!response.data) {
        throw new Error(response.message || "Registration failed")
      }

      const { user: userData, token: authToken } = response.data

      localStorage.setItem("token", authToken)
      setUser(userData)
      setToken(authToken)

      toast({
        title: "Registration successful",
        description: `Welcome to UoE Student Marketplace, ${userData.name}!`,
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error?.message || "Please try again",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    router.push("/")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUser,
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