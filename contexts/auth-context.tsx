"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/services/auth-service"
import type { User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/api-client"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: "customer" | "provider") => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchUserProfile(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserProfile = async (authToken: string) => {
    try {
      setIsLoading(true)
      const response = await authService.getProfile(authToken)
      setUser(response.data)
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      // Token might be invalid or expired
      localStorage.removeItem("token")
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authService.login({ email, password })
      const { user: userData, token: authToken } = response.data

      // Save token and user data
      localStorage.setItem("token", authToken)
      setToken(authToken)
      setUser(userData)

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      })

      // Redirect based on user role
      if (userData.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      handleApiError(error, "Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: "customer" | "provider") => {
    try {
      setIsLoading(true)
      const response = await authService.register({ name, email, password, role })
      const { user: userData, token: authToken } = response.data

      // Save token and user data
      localStorage.setItem("token", authToken)
      setToken(authToken)
      setUser(userData)

      toast({
        title: "Registration successful",
        description: `Welcome to UoE Student Marketplace, ${userData.name}!`,
      })

      router.push("/dashboard")
    } catch (error) {
      handleApiError(error, "Registration failed. Please try again.")
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

