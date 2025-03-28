"use client"

import { useEffect, useState } from "react"
import { DollarSign } from "lucide-react"

import { apiClient, handleApiError } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

interface EarningData {
  totalEarnings: number
  pendingEarnings: number
  weeklyEarnings: number[]
  monthlyEarnings: number
  previousMonthEarnings: number
}

export default function EarningsSummary() {
  const { token } = useAuth()
  const [earningData, setEarningData] = useState<EarningData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEarningData = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        const response = await apiClient.get<{ success: boolean; data: EarningData }>("/api/users/dashboard-stats", {
          token,
        })

        setEarningData(response.data)
      } catch (error) {
        handleApiError(error, "Failed to load earnings data")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchEarningData()
    }
  }, [token])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-3/4 bg-muted animate-pulse rounded"></div>
        <div className="h-32 bg-muted animate-pulse rounded"></div>
        <div className="h-6 w-1/2 bg-muted animate-pulse rounded"></div>
      </div>
    )
  }

  if (!earningData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No earnings data available.</p>
      </div>
    )
  }

  const monthlyGrowth =
    earningData.previousMonthEarnings > 0
      ? ((earningData.monthlyEarnings - earningData.previousMonthEarnings) / earningData.previousMonthEarnings) * 100
      : 100

  // Add default empty array if weeklyEarnings is undefined
  const weeklyEarnings = earningData.weeklyEarnings || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold">KSh {earningData.monthlyEarnings}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <DollarSign className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Weekly Trend</span>
          <span className={monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}>
            {monthlyGrowth.toFixed(1)}% {monthlyGrowth >= 0 ? "↑" : "↓"}
          </span>
        </div>
        <div className="flex items-end gap-1 h-16">
          {weeklyEarnings.length > 0 ? (
            weeklyEarnings.map((amount, index) => {
              const maxAmount = Math.max(...weeklyEarnings)
              const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-primary/80 rounded-sm" style={{ height: `${height}%` }}></div>
                  <span className="text-xs mt-1">W{index + 1}</span>
                </div>
              )
            })
          ) : (
            <div className="text-muted-foreground text-sm w-full text-center">
              No weekly earnings data available
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between text-sm">
        <div>
          <p className="text-muted-foreground">Pending</p>
          <p className="font-medium">KSh {earningData.pendingEarnings || 0}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total</p>
          <p className="font-medium">KSh {earningData.totalEarnings}</p>
        </div>
      </div>
    </div>
  )
}