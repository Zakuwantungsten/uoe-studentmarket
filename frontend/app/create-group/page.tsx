"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

import { createGroup, GroupFormData } from "@/lib/services/group-service"

// Form schema with validation
const groupFormSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().optional(),
})

type GroupFormValues = z.infer<typeof groupFormSchema>

export default function CreateGroupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Handle authentication redirect in useEffect instead of during render
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      router.push("/login?callbackUrl=/create-group")
    }
  }, [isAuthenticated, router])
  
  // Return null early if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Default form values
  const defaultValues: Partial<GroupFormValues> = {
    name: "",
    description: "",
    image: "",
  }

  // Form setup
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues,
  })

  // Handle form submission
  const onSubmit = async (values: GroupFormValues) => {
    try {
      setIsSubmitting(true)
      
      const groupData: GroupFormData = {
        ...values
      }
      
      await createGroup(groupData)
      
      toast({
        title: "Group created",
        description: "Your group has been created successfully.",
      })
      
      router.push("/community")
    } catch (error) {
      console.error("Error creating group:", error)
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8 max-w-3xl">
      <Button variant="ghost" className="mb-4" asChild>
        <Link href="/community">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Link>
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Create a New Group</CardTitle>
          <CardDescription>
            Start a community group for students with similar interests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a clear, descriptive name for your group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your group's purpose, activities, and who should join..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain what your group is about and what activities members can expect.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Image URL" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a URL to an image for your group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <CardFooter className="px-0 pb-0">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Group..." : "Create Group"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}