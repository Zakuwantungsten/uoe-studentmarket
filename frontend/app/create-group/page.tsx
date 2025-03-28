"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Upload } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

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
  const { user, isAuthenticated, token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview the image
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    
    setImageFile(file)
  }

  // Handle form submission
  const onSubmit = async (values: GroupFormValues) => {
    try {
      setIsSubmitting(true)
      
      // Upload image if selected
      let imageUrl = values.image
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        
        try {
          // Handle token type with explicit casting
          const options = token ? { token: token as string } : {}
          const response = await apiClient.upload("/upload/file", formData, options) as { 
            success: boolean; 
            data: { url: string } 
          }
          
          if (response?.success && response?.data?.url) {
            imageUrl = response.data.url
          }
        } catch (error) {
          console.error("Error uploading image:", error)
          toast({
            title: "Error",
            description: "Failed to upload image. The group will be created without an image.",
            variant: "destructive",
          })
        }
      }
      
      const groupData: GroupFormData = {
        ...values,
        image: imageUrl
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
                  <FormItem className="space-y-2">
                    <FormLabel>Group Image</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Button>
                      <Input 
                        {...field}
                        placeholder="Or enter image URL" 
                        className="flex-1"
                      />
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm mb-2">Image Preview:</p>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full h-auto max-h-48 rounded-md border" 
                        />
                      </div>
                    )}
                    
                    <FormDescription>
                      Upload an image or provide a URL for your group.
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