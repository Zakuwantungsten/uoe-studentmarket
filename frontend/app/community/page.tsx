"use client"

import type { Metadata } from "next"
import { useState, useEffect, FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { MessageSquare, Calendar, Users, ArrowRight, ThumbsUp, MessageCircle, Share2, MapPin } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { getAllDiscussions, createDiscussion, createComment, Discussion, Comment } from "@/lib/services/discussion-service"
import { getAllEvents, rsvpToEvent, Event } from "@/lib/services/event-service"
import { getAllGroups, joinGroup, leaveGroup, Group } from "@/lib/services/group-service"

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState({
    discussions: true,
    events: true,
    groups: true
  })
  // State for simple discussion input
  const [discussionInput, setDiscussionInput] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentText, setCommentText] = useState<{[key: string]: string}>({})

  useEffect(() => {
    // Fetch discussions
    const loadDiscussions = async () => {
      try {
        const res = await getAllDiscussions(1, 10)
        const discussionData = res as { data: { data: Discussion[] } }
        setDiscussions(discussionData.data.data)
        setLoading(prev => ({ ...prev, discussions: false }))
      } catch (error) {
        console.error("Error fetching discussions:", error)
        toast({
          title: "Error",
          description: "Failed to load discussions. Please try again later.",
          variant: "destructive",
        })
        setLoading(prev => ({ ...prev, discussions: false }))
      }
    }

    // Fetch events
    const loadEvents = async () => {
      try {
        const res = await getAllEvents(1, 3, true)
        const eventData = res as { data: { data: Event[] } }
        setEvents(eventData.data.data)
        setLoading(prev => ({ ...prev, events: false }))
      } catch (error) {
        console.error("Error fetching events:", error)
        toast({
          title: "Error",
          description: "Failed to load events. Please try again later.",
          variant: "destructive",
        })
        setLoading(prev => ({ ...prev, events: false }))
      }
    }

    // Fetch groups
    const loadGroups = async () => {
      try {
        const res = await getAllGroups(1, 6)
        const groupData = res as { data: { data: Group[] } }
        setGroups(groupData.data.data)
        setLoading(prev => ({ ...prev, groups: false }))
      } catch (error) {
        console.error("Error fetching groups:", error)
        toast({
          title: "Error",
          description: "Failed to load groups. Please try again later.",
          variant: "destructive",
        })
        setLoading(prev => ({ ...prev, groups: false }))
      }
    }

    loadDiscussions()
    loadEvents()
    loadGroups()
  }, [toast])

  const handleCreateDiscussion = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a discussion",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Validate input
    if (!discussionInput.trim()) {
      toast({
        title: "Content required",
        description: "Please enter a message to post",
        variant: "destructive",
      })
      return
    }

    if (discussionInput.trim().length < 10) {
      toast({
        title: "Content too short",
        description: "Your message must be at least 10 characters",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      // Generate title from content (first 50 chars or first sentence)
      const contentText = discussionInput.trim()
      let title = contentText.substring(0, 50)
      // If title ends mid-word, find last space
      if (title.length === 50 && contentText.length > 50 && title.charAt(49) !== ' ') {
        const lastSpace = title.lastIndexOf(' ')
        if (lastSpace > 0) {
          title = title.substring(0, lastSpace)
        }
      }
      // Add ellipsis if we truncated
      if (title.length < contentText.length) {
        title += '...'
      }
      
      const response = await createDiscussion({
        title,
        content: contentText
      })
      
      // Add new discussion to the list
      const discussionData = response as { data: { data: Discussion } }
      // Ensure discussions is treated as an array even if it's null or undefined
      setDiscussions([discussionData.data.data, ...(Array.isArray(discussions) ? discussions : [])])
      
      // Reset input
      setDiscussionInput("")
      
      toast({
        title: "Success",
        description: "Your discussion has been posted",
      })
    } catch (error) {
      console.error("Error creating discussion:", error)
      toast({
        title: "Error",
        description: "Failed to create discussion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePostComment = async (discussionId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!commentText[discussionId]?.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await createComment({
        content: commentText[discussionId],
        discussionId
      })
      
      // Update the discussions list with the new comment
      setDiscussions(discussions.map(discussion => {
        if (discussion._id === discussionId) {
          return {
            ...discussion,
            comments: [
              (response as { data: { data: Comment } }).data.data, 
              ...(discussion.comments || [])
            ]
          }
        }
        return discussion
      }))
      
      // Clear comment input
      setCommentText({...commentText, [discussionId]: ""})
      
      toast({
        title: "Success",
        description: "Your comment has been posted",
      })
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRSVP = async (eventId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to RSVP to events",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      await rsvpToEvent(eventId)
      toast({
        title: "Success",
        description: "You have successfully RSVP'd to this event",
      })
    } catch (error) {
      console.error("Error RSVP'ing to event:", error)
      toast({
        title: "Error",
        description: "Failed to RSVP to event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join groups",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      await joinGroup(groupId)
      
      // Update groups list to reflect membership
      setGroups(groups.map(group => {
        if (group._id === groupId) {
          return {
            ...group,
            members: [...group.members, { 
              _id: user?._id || "",
              name: user?.name || "User", 
              email: user?.email || ""
            }]
          }
        }
        return group
      }))
      
      toast({
        title: "Success",
        description: "You have successfully joined the group",
      })
    } catch (error) {
      console.error("Error joining group:", error)
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to check if user is a member of a group
  const isGroupMember = (group: Group) => {
    if (!isAuthenticated) return false
    return group.members.some(member => member._id === user?._id)
  }

  // Format date for event display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMMM d, yyyy • h:mm a")
  }
  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">
            Connect with fellow students, join events, and participate in discussions
          </p>
        </div>

        <Tabs defaultValue="discussions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discussions" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Avatar>
                {user?.image ? (
                  <AvatarImage src={user.image} alt={user.name || "User"} />
                ) : (
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <Input 
                  placeholder="Start a discussion..." 
                  value={discussionInput}
                  onChange={(e) => setDiscussionInput(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleCreateDiscussion}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>

            {loading.discussions ? (
              <div className="flex justify-center py-8">
                <p>Loading discussions...</p>
              </div>
            ) : !discussions || discussions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <p className="text-muted-foreground">No discussions found</p>
                <Button 
                  onClick={() => {
                    setDiscussionInput("I would like to start a discussion about...");
                    // Scroll to the input at the top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Create the first discussion
                </Button>
              </div>
            ) : (
              <>
                {discussions.map((discussion) => (
                  <Card key={discussion._id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {discussion.author?.name ? discussion.author.name[0] : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{discussion.author ? discussion.author.name : "Unknown User"}</h3>
                            <Badge variant="outline">Student</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Posted {new Date(discussion.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="text-lg font-medium mb-2">{discussion.title}</h3>
                      <p className="text-sm">{discussion.content}</p>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex-col space-y-4">
                      <div className="flex items-center space-x-4 w-full">
                        <Button variant="ghost" size="sm" className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>0</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>{discussion.comments?.length || 0} Comments</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center ml-auto">
                          <Share2 className="h-4 w-4 mr-1" />
                          <span>Share</span>
                        </Button>
                      </div>
                      {isAuthenticated && (
                        <div className="flex items-center space-x-2 w-full">
                          <Avatar className="h-6 w-6">
                            {user?.image ? (
                              <AvatarImage src={user.image} alt={user.name || "User"} />
                            ) : (
                              <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                            )}
                          </Avatar>
                          <Input 
                            placeholder="Add a comment..."
                            value={commentText[discussion._id] || ""}
                            onChange={(e) => setCommentText({...commentText, [discussion._id]: e.target.value})}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={() => handlePostComment(discussion._id)}>Reply</Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}

                <div className="flex justify-center">
                  <Button variant="outline">Load More Discussions</Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {loading.events ? (
              <div className="flex justify-center py-8">
                <p>Loading events...</p>
              </div>
            ) : !events || events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <p className="text-muted-foreground">No upcoming events found</p>
                <Button asChild>
                  <Link href="/create-event">Create an event</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map(event => (
                    <Card key={event._id}>
                      <div className="relative h-48">
                        <Image
                          src={event.image || "/placeholder.svg?height=200&width=400"}
                          alt={event.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                        <Badge className="absolute top-2 right-2 bg-primary">Upcoming</Badge>
                      </div>
                      <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>
                          {formatEventDate(event.startDate)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{event.description}</p>
                        <div className="flex items-center space-x-2 mt-4 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Organized by {event.organizer ? event.organizer.name : "Unknown"}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => handleRSVP(event._id)}
                        >
                          RSVP
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/events">View All Events</Link>
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            {loading.groups ? (
              <div className="flex justify-center py-8">
                <p>Loading groups...</p>
              </div>
            ) : !groups || groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <p className="text-muted-foreground">No groups found</p>
                <Button asChild>
                  <Link href="/create-group">Create a group</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groups.map(group => (
                    <Card key={group._id}>
                      <CardHeader>
                        <CardTitle>{group.name}</CardTitle>
                        <CardDescription>Created by {group.creator ? group.creator.name : "Unknown"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex -space-x-2 mb-4">
                          {group.members.slice(0, 5).map((member, i) => (
                            <Avatar key={member._id} className="border-2 border-background">
                              <AvatarFallback>{member.name?.[0] || String.fromCharCode(65 + i)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {group.members.length > 5 && (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs">
                              +{group.members.length - 5}
                            </div>
                          )}
                        </div>
                        <p className="text-sm">{group.description}</p>
                      </CardContent>
                      <CardFooter>
                        {isGroupMember(group) ? (
                          <Button className="w-full" variant="outline" disabled>
                            Joined
                          </Button>
                        ) : (
                          <Button 
                            className="w-full"
                            onClick={() => handleJoinGroup(group._id)}
                          >
                            Join Group
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/groups">View All Groups</Link>
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="bg-primary text-primary-foreground rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Start Your Own Group</h2>
              <p className="text-primary-foreground/90">
                Have an interest that's not represented? Create a new group and connect with like-minded students.
              </p>
            </div>
            <Button variant="secondary" className="md:self-start" asChild>
              <Link href="/create-group">
                Create a Group
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

