"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import Link from "next/link"
import { apiClient, handleApiError } from "@/lib/api-client"
import type { User } from "@/lib/types"

export default function FeaturedProviders() {
  const [providers, setProviders] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get<{ success: boolean; data: User[] }>("/users/top-providers?limit=4")
        setProviders(response.data)
      } catch (error) {
        handleApiError(error, "Failed to load top providers")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviders()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {providers.map((provider) => (
        <Card key={provider._id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={provider.profileImage} alt={provider.name} />
                <AvatarFallback className="text-xl">
                  {provider.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">{provider.name}</h3>
                <p className="text-sm text-muted-foreground">{provider.bio?.substring(0, 50) || "Service Provider"}</p>
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(provider.rating || 0) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">({provider.totalReviews || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {provider.badges?.map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )) || (
                  <Badge variant="secondary" className="text-xs">
                    New Provider
                  </Badge>
                )}
              </div>
              <Button asChild size="sm" className="w-full">
                <Link href={`/providers/${provider._id}`}>View Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

