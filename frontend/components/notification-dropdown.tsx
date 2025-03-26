"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Check, Loader2, X } from "lucide-react"
import { format } from "date-fns"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { notificationService } from "@/lib/services/notification-service"
import { handleApiError } from "@/lib/api-client"
import type { Notification } from "@/lib/types"
import { useWebSocket } from "@/lib/websocket-client"

export default function NotificationDropdown() {
  const { token, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { status: wsStatus, addMessageHandler } = useWebSocket()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return

      try {
        setIsLoading(true)
        const response = await notificationService.getNotifications(token)
        setNotifications(response.data)
        setUnreadCount(response.data.filter((n) => !n.read).length)
      } catch (error) {
        handleApiError(error, "Failed to load notifications")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchNotifications()
    }
  }, [token])

  // Listen for new notifications via WebSocket
  useEffect(() => {
    if (wsStatus === "connected") {
      const removeHandler = addMessageHandler("notification", (data) => {
        // Add new notification to the list
        setNotifications((prev) => [data.notification, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Show toast for new notification
        toast({
          title: data.notification.title,
          description: data.notification.content,
        })
      })

      return () => removeHandler()
    }
  }, [wsStatus, addMessageHandler, toast])

  // Mark notification as read
  const handleMarkAsRead = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!token || notification.read) return

    try {
      await notificationService.markAsRead(notification._id, token)

      // Update local state
      setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => prev - 1)
    } catch (error) {
      handleApiError(error, "Failed to mark notification as read")
    }
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!token) return

    try {
      setIsMarkingAll(true)
      await notificationService.markAllAsRead(token)

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)

      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      handleApiError(error, "Failed to mark all notifications as read")
    } finally {
      setIsMarkingAll(false)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <div className="w-2 h-2 rounded-full bg-blue-500" />
      case "message":
        return <div className="w-2 h-2 rounded-full bg-green-500" />
      case "review":
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />
      case "payment":
        return <div className="w-2 h-2 rounded-full bg-purple-500" />
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500" />
    }
  }

  // Get notification link based on type and data
  const getNotificationLink = (notification: Notification) => {
    const { type, data } = notification

    switch (type) {
      case "booking":
        return `/bookings/${data?.bookingId}`
      case "message":
        return `/messages?recipient=${data?.userId}`
      case "review":
        return `/services/${data?.serviceId}`
      case "payment":
        return `/bookings/${data?.bookingId}`
      default:
        return "#"
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-2 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-2 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification._id} asChild className="p-0 focus:bg-transparent">
                <Link
                  href={getNotificationLink(notification)}
                  className={`flex items-start gap-2 p-3 hover:bg-muted rounded-sm ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleMarkAsRead(notification, e)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-sm">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

