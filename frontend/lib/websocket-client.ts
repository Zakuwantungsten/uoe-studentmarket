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
  const reconnectAttemptsRef = useRef<number>(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
        // Reset reconnection attempts on successful connection
        reconnectAttemptsRef.current = 0
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

      ws.onerror = () => {
        // Only log WebSocket errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `WebSocket connection error. ReadyState: ${ws.readyState}, URL: ${ws.url.replace(/token=([^&]*)/, "token=REDACTED")}`
          )
        }
        setStatus("error")
      }

      ws.onclose = () => {
        setStatus("disconnected")
        console.log("WebSocket connection closed")

        // Clear any existing reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }

        // Implement exponential backoff for reconnection
        reconnectAttemptsRef.current += 1
        const maxDelay = 30000 // Maximum delay of 30 seconds
        const baseDelay = 1000 // Start with 1 second
        const delay = Math.min(maxDelay, baseDelay * Math.pow(2, reconnectAttemptsRef.current - 1))
        
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log(`WebSocket reconnecting in ${delay / 1000} seconds (attempt ${reconnectAttemptsRef.current})`)
        }

        // Attempt to reconnect with exponential backoff
        reconnectTimeoutRef.current = setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connect()
          }
        }, delay)
      }

      wsRef.current = ws

      // Clean up on unmount
      return () => {
        ws.close()
        wsRef.current = null
      }
    } catch (error) {
      // Provide more descriptive error message for connection errors
      console.error(`Error connecting to WebSocket: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      // Clear any pending reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      
      // Close WebSocket connection
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

