"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

type MessageHandler = (data: any) => void
type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

interface WebSocketMessage {
  type: string
  [key: string]: any
}

export function useWebSocket() {
  const { token } = useAuth()
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const messageHandlersRef = useRef<Map<string, MessageHandler[]>>(new Map())

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (!token) return

    try {
      setStatus("connecting")

      // Create WebSocket connection with authentication token
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5001"}?token=${token}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setStatus("connected")
        console.log("WebSocket connection established")
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)

          // Call all registered handlers for this message type
          if (data.type && messageHandlersRef.current.has(data.type)) {
            messageHandlersRef.current.get(data.type)?.forEach((handler) => handler(data))
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setStatus("error")
      }

      ws.onclose = () => {
        setStatus("disconnected")
        console.log("WebSocket connection closed")

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connect()
          }
        }, 5000)
      }

      wsRef.current = ws

      // Clean up on unmount
      return () => {
        ws.close()
        wsRef.current = null
      }
    } catch (error) {
      console.error("Error connecting to WebSocket:", error)
      setStatus("error")
    }
  }, [token])

  // Register a message handler
  const addMessageHandler = useCallback((type: string, handler: MessageHandler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, [])
    }

    messageHandlersRef.current.get(type)?.push(handler)

    // Return a function to remove this handler
    return () => {
      const handlers = messageHandlersRef.current.get(type)
      if (handlers) {
        messageHandlersRef.current.set(
          type,
          handlers.filter((h) => h !== handler),
        )
      }
    }
  }, [])

  // Send a message through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  // Connect when token is available
  useEffect(() => {
    if (token) {
      connect()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [token, connect])

  return {
    status,
    lastMessage,
    addMessageHandler,
    sendMessage,
    reconnect: connect,
  }
}

