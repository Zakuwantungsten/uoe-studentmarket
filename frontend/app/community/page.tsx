import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { MessageSquare, Calendar, Users, ArrowRight, ThumbsUp, MessageCircle, Share2, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: "Community | UoE Student Marketplace",
  description: "Connect with the University of Eldoret student community",
}

export default function CommunityPage() {
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
                <AvatarFallback>JM</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input placeholder="Start a discussion..." />
              </div>
              <Button>Post</Button>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>SW</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">Sarah Wanjiku</h3>
                      <Badge variant="outline">Business Admin</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Posted 2 hours ago</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-medium mb-2">Looking for a study group for Business Statistics</h3>
                <p className="text-sm">
                  Hey everyone! I'm looking for students who want to form a study group for Business Statistics (BUS
                  204). We can meet twice a week at the library. Anyone interested?
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center space-x-4 w-full">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>24</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>12 Comments</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center ml-auto">
                    <Share2 className="h-4 w-4 mr-1" />
                    <span>Share</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>DO</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">David Omondi</h3>
                      <Badge variant="outline">Engineering</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Posted 5 hours ago</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-medium mb-2">Recommendations for affordable laptops?</h3>
                <p className="text-sm">
                  My laptop just died and I need a new one for my engineering projects. Looking for something affordable
                  but powerful enough for CAD software. Any recommendations from fellow students?
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center space-x-4 w-full">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>18</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>8 Comments</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center ml-auto">
                    <Share2 className="h-4 w-4 mr-1" />
                    <span>Share</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>MA</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">Mary Akinyi</h3>
                      <Badge variant="outline">Education</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Posted yesterday</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-medium mb-2">Teaching practice tips needed!</h3>
                <p className="text-sm">
                  I'm starting my teaching practice next month at a local primary school. Any education students who've
                  already done their TP have tips or advice to share?
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center space-x-4 w-full">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>32</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>15 Comments</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center ml-auto">
                    <Share2 className="h-4 w-4 mr-1" />
                    <span>Share</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <div className="flex justify-center">
              <Button variant="outline">Load More Discussions</Button>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <div className="relative h-48">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    alt="Career Fair"
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-primary">Upcoming</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Campus Career Fair</CardTitle>
                  <CardDescription>June 25, 2023 • 9:00 AM - 4:00 PM</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Connect with potential employers, explore internship opportunities, and get your CV reviewed by
                    professionals.
                  </p>
                  <div className="flex items-center space-x-2 mt-4 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Main Auditorium</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>120 attending</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">RSVP</Button>
                </CardFooter>
              </Card>

              <Card>
                <div className="relative h-48">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    alt="Hackathon"
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-primary">Upcoming</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Student Hackathon</CardTitle>
                  <CardDescription>July 1-2, 2023 • 48 Hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Join teams of students to build innovative solutions to real-world problems. Prizes for the top
                    three teams!
                  </p>
                  <div className="flex items-center space-x-2 mt-4 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Computer Science Building</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>75 attending</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">RSVP</Button>
                </CardFooter>
              </Card>

              <Card>
                <div className="relative h-48">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    alt="Workshop"
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-primary">Upcoming</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Entrepreneurship Workshop</CardTitle>
                  <CardDescription>July 10, 2023 • 2:00 PM - 5:00 PM</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Learn how to start and grow your own business while still in university. Guest speakers from
                    successful startups.
                  </p>
                  <div className="flex items-center space-x-2 mt-4 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Business School, Room 105</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>50 attending</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">RSVP</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/events">View All Events</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Computer Science Society</CardTitle>
                  <CardDescription>Tech enthusiasts and CS students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Avatar key={i} className="border-2 border-background">
                        <AvatarFallback>{String.fromCharCode(65 + i)}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs">+42</div>
                  </div>
                  <p className="text-sm">
                    A community for computer science students to collaborate on projects, share resources, and organize
                    tech events.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Join Group</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business & Entrepreneurship</CardTitle>
                  <CardDescription>Future business leaders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Avatar key={i} className="border-2 border-background">
                        <AvatarFallback>{String.fromCharCode(70 + i)}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs">+38</div>
                  </div>
                  <p className="text-sm">
                    Connect with business-minded students, discuss market trends, and develop entrepreneurial skills.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Join Group</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Creative Arts Collective</CardTitle>
                  <CardDescription>Artists, designers, and creatives</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Avatar key={i} className="border-2 border-background">
                        <AvatarFallback>{String.fromCharCode(75 + i)}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs">+25</div>
                  </div>
                  <p className="text-sm">
                    A space for creative students to showcase their work, collaborate on projects, and organize
                    exhibitions.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Join Group</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engineering Students Association</CardTitle>
                  <CardDescription>Future engineers and innovators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Avatar key={i} className="border-2 border-background">
                        <AvatarFallback>{String.fromCharCode(80 + i)}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs">+56</div>
                  </div>
                  <p className="text-sm">
                    Connect with fellow engineering students, work on practical projects, and prepare for industry
                    challenges.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Join Group</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Sciences Network</CardTitle>
                  <CardDescription>Medical and health students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Avatar key={i} className="border-2 border-background">
                        <AvatarFallback>{String.fromCharCode(85 + i)}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs">+32</div>
                  </div>
                  <p className="text-sm">
                    A community for health science students to share knowledge, discuss case studies, and organize
                    health awareness events.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Join Group</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Environmental Action Club</CardTitle>
                  <CardDescription>Eco-conscious students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Avatar key={i} className="border-2 border-background">
                        <AvatarFallback>{String.fromCharCode(90 + i)}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs">+19</div>
                  </div>
                  <p className="text-sm">
                    Join like-minded students in promoting environmental sustainability on campus and in the community.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Join Group</Button>
                </CardFooter>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/groups">View All Groups</Link>
              </Button>
            </div>
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

