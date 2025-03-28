"use client"

import React, { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Default configuration for all queries
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default QueryProvider