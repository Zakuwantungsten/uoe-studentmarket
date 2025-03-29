"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Metadata } from "next"
import { Search, Send, MessageSquare } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { messageService } from "@/lib/services/message-service"
import type { Message, User } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"
import DashboardLayout from "@/components/dashboard-layout"

interface Conversation {
  user: User
  lastMessage: Message
  unreadCount: number
}

/*export const metadata: Metadata = {
  title: "Messages | UoE Student Marketplace",
  description: "Chat with other students on the University of Eldoret Student Marketplace",
}*/

export default function MessagesPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recipientId = searchParams.get("recipient")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/messages")
      return
    }

    const fetchConversations = async () => {
      if (!token) return

      try {
        setIsLoadingConversations(true)
        const response = await messageService.getConversations(token)
        setConversations(response.data)

        // If there's a recipient ID in the URL, select that conversation or start a new one
        if (recipientId) {
          // First check if we already have a conversation with this recipient
          const existingConversation = response.data.find((c) => c.user._id === recipientId)
          
          if (existingConversation) {
            // Use existing conversation
            setSelectedUser(existingConversation.user)
            fetchMessages(existingConversation.user._id)
          } else {
              // We need to fetch the recipient user details to start a new conversation
              // Use the backend API endpoint instead of the Next.js API route
              try {
                // Create API URL using the backend API_URL from environment or default
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const userResponse = await fetch(`${apiUrl}/users/${recipientId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  if (userData.success && userData.data) {
                    // Set the selected user to start a new conversation
                    setSelectedUser(userData.data);
                    // Initialize with empty messages
                    setMessages([]);
                  } else {
                    toast({
                      title: "Unable to load user details",
                      description: "Please try again or select an existing conversation",
                      variant: "destructive"
                    });
                  }
                } else {
                  toast({
                    title: "Failed to load user details",
                    description: "Cannot start a new conversation at this time",
                    variant: "destructive"
                  });
                }
              } catch (error) {
                console.error("Error fetching recipient user details:", error);
                toast({
                  title: "Error",
                  description: "Failed to load recipient details. Please try again.",
                  variant: "destructive"
                });
              }
          }
        }
      } catch (error) {
        handleApiError(error, "Failed to load conversations")
      } finally {
        setIsLoadingConversations(false)
      }
    }

    if (token) {
      fetchConversations()
    }
  }, [token, authLoading, isAuthenticated, router, recipientId])

  const fetchMessages = async (userId: string) => {
    if (!token) return

    try {
      setIsLoadingMessages(true)
      const response = await messageService.getMessages(userId, token)
      setMessages(response.data)

      // Mark messages as read
      const unreadMessages = response.data.filter((message) => !message.read && message.sender._id === userId)

      if (unreadMessages.length > 0) {
        // Update the unread count in the conversations list
        setConversations((prevConversations) =>
          prevConversations.map((conv) => (conv.user._id === userId ? { ...conv, unreadCount: 0 } : conv)),
        )

        // Mark each message as read
        for (const message of unreadMessages) {
          await messageService.markAsRead(message._id, token)
        }
      }
    } catch (error) {
      handleApiError(error, "Failed to load messages")
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedUser(conversation.user)
    fetchMessages(conversation.user._id)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !selectedUser || !messageText.trim()) return

    try {
      setIsSending(true)

      const response = await messageService.sendMessage({ recipientId: selectedUser._id, content: messageText }, token)

      // Add the new message to the messages list
      setMessages([...messages, response.data])

      // Update the last message in the conversations list
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.user._id === selectedUser._id ? { ...conv, lastMessage: response.data } : conv,
        ),
      )

      // Clear the input
      setMessageText("")
    } catch (error) {
      handleApiError(error, "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex flex-col space-y-2 mb-4">
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground">Chat with students about services</p>
        </div>

        <div className="flex flex-1 overflow-hidden border rounded-lg">
          {/* Contacts sidebar */}
          <div className="w-full md:w-80 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search messages..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {isLoadingConversations ? (
                <div className="space-y-4 p-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length > 0 ? (
                <div>
                  {filteredConversations.map((conversation) => (
                    <div key={conversation.user._id}>
                      <button
                        className={`w-full p-4 text-left hover:bg-muted/50 flex items-center gap-3 ${
                          selectedUser?._id === conversation.user._id ? "bg-muted" : ""
                        }`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.user.profileImage} alt={conversation.user.name} />
                          <AvatarFallback>
                            {conversation.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(conversation.lastMessage.createdAt), "h:mm a")}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.sender._id === user?._id ? (
                                <span className="text-muted-foreground">You: </span>
                              ) : null}
                              {conversation.lastMessage.content}
                            </p>
                            {conversation.unreadCount > 0 && <Badge className="ml-2">{conversation.unreadCount}</Badge>}
                          </div>
                        </div>
                      </button>
                      <Separator />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="hidden md:flex flex-1 flex-col">
            {selectedUser ? (
              <>
                <div className="p-4 border-b flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                    <AvatarFallback>
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.role === "PROVIDER" ? "Service Provider" : "Customer"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 h-[calc(80vh-16rem)]">
                  {isLoadingMessages ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                          <Skeleton
                            className={`h-12 w-2/3 rounded-lg ${i % 2 === 0 ? "rounded-tl-none" : "rounded-tr-none"}`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender._id === user?._id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender._id === user?._id
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted rounded-tl-none"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender._id === user?._id
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {format(new Date(message.createdAt), "h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      disabled={isSending}
                    />
                    <Button type="submit" size="icon" disabled={!messageText.trim() || isSending}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-muted-foreground">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>

          {/* Empty state for when no chat is selected (mobile) */}
          <div className="hidden md:hidden flex-1 flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
            <p className="text-muted-foreground max-w-md mb-6">Choose a conversation from the list to start chatting</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

