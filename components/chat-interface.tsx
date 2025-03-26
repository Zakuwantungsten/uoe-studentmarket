"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Send, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWebSocket } from "@/lib/websocket-client"
import { messageService } from "@/lib/services/message-service"
import { useAuth } from "@/contexts/auth-context"
import type { Message, User } from "@/lib/types"

interface ChatInterfaceProps {
  recipient: User
  initialMessages: Message[]
}

export default function ChatInterface({ recipient, initialMessages = [] }: ChatInterfaceProps) {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [messageText, setMessageText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [recipientIsTyping, setRecipientIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { status, addMessageHandler, sendMessage } = useWebSocket()

  // Register WebSocket message handlers
  useEffect(() => {
    if (status === "connected") {
      // Handle incoming messages
      const removeMessageHandler = addMessageHandler("message", (data) => {
        if (data.message.sender._id === recipient._id || data.message.recipient._id === recipient._id) {
          setMessages((prev) => [...prev, data.message])

          // Mark message as read if we're the recipient
          if (data.message.recipient._id === user?._id && token) {
            messageService.markAsRead(data.message._id, token)
          }
        }
      })

      // Handle typing indicators
      const removeTypingHandler = addMessageHandler("typing", (data) => {
        if (data.senderId === recipient._id) {
          setRecipientIsTyping(data.isTyping)
        }
      })

      return () => {
        removeMessageHandler()
        removeTypingHandler()
      }
    }
  }, [status, addMessageHandler, recipient._id, user?._id, token])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, recipientIsTyping])

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      sendMessage({
        type: "typing",
        recipientId: recipient._id,
        isTyping: true,
      })
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendMessage({
        type: "typing",
        recipientId: recipient._id,
        isTyping: false,
      })
    }, 2000)
  }

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !messageText.trim()) return

    try {
      setIsSending(true)

      // Send via WebSocket if connected, otherwise use REST API
      if (status === "connected") {
        sendMessage({
          type: "message",
          recipientId: recipient._id,
          content: messageText,
        })
      } else {
        const response = await messageService.sendMessage(
          {
            recipientId: recipient._id,
            content: messageText,
          },
          token,
        )

        setMessages((prev) => [...prev, response.data])
      }

      // Clear input and typing indicator
      setMessageText("")
      setIsTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      sendMessage({
        type: "typing",
        recipientId: recipient._id,
        isTyping: false,
      })
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
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
                    message.sender._id === user?._id ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {format(new Date(message.createdAt), "h:mm a")}
                </p>
              </div>
            </div>
          ))}

          {recipientIsTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg rounded-tl-none p-3 max-w-[70%]">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground/70 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground/70 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground/70 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value)
              handleTyping()
            }}
            disabled={isSending || status === "error"}
          />
          <Button type="submit" size="icon" disabled={!messageText.trim() || isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
        {status === "error" && (
          <p className="text-xs text-destructive mt-1">Connection error. Messages will be sent via API.</p>
        )}
      </div>
    </div>
  )
}

