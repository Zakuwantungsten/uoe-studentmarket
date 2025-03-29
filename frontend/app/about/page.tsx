import type { Metadata } from "next"
import Image from "next/image"
import { CheckCircle, Users, ShoppingBag, Shield, HeartHandshake } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About | UoE Student Marketplace",
  description: "Learn about the University of Eldoret Student Marketplace",
}

export default function AboutPage() {
  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex flex-col space-y-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About UoE Student Marketplace</h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Connecting students with student-offered services at the University of Eldoret
          </p>
        </section>
        
        {/* Our Story */}
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                UoE Student Marketplace was founded in 2022 by a group of entrepreneurial students who recognized the untapped potential of student skills and services on campus.
              </p>
              <p>
                We noticed that many students had valuable skills they could offer to their peers—from tutoring and design services to food delivery and tech support—but lacked a centralized platform to connect with potential customers.
              </p>
              <p>
                What started as a simple bulletin board system has evolved into a comprehensive digital marketplace that serves the entire University of Eldoret community, fostering student entrepreneurship and making campus life more convenient for everyone.
              </p>
            </div>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image 
              src="/placeholder.svg?height=400&width=600" 
              alt="Students collaborating" 
              fill 
              className="object-cover"
            />
          </div>
        </section>
        
        {/* Our Mission */}
        <section className="bg-primary text-primary-foreground rounded-lg p-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Our Mission</h2>
            <p className="text-xl text-primary-foreground/90">
              To empower student entrepreneurs while making essential services more accessible to the campus community.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start space-x-3">
                <div className="bg-primary-foreground/10 p-2 rounded-full">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Connect Students</h3>
                  <p className="text-sm text-primary-foreground/80">
                    Create meaningful connections between service providers and those who need their skills
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary-foreground/10 p-2 rounded-full">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Foster Entrepreneurship</h3>
                  <p className="text-sm text-primary-foreground/80">
                    Provide students with a platform to develop business skills and earn income
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary-foreground/10 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Ensure Safety</h3>
                  <p className="text-sm text-primary-foreground/80">
                    Create a secure environment for transactions between students
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary-foreground/10 p-2 rounded-full">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Build Community</h3>
                  <p className="text-sm text-primary-foreground/80">
                    Strengthen the campus community through peer-to-peer support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="max-w-[700px] mx-auto text-muted-foreground">
              Our platform makes it easy to find services or offer your skills to fellow students
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                      1
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">Create an Account</h3>
                  <p className="text-muted-foreground">
                    Sign up using your university email to get verified as a student
                  </p>
                  <div className="flex flex-col space-y-2 w-full">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Simple verification process</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Create your profile</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Browse available services</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                      2
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">Book Services</h3>
                  <p className="text-muted-foreground">
                    Find and book the services you need from fellow students
                  </p>
                  <div className="flex flex-col space-y-2 w-full">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Search by category or keyword</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Review provider profiles</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Schedule and pay securely</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                      3
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">Offer Your Skills</h3>
                  <p className="text-muted-foreground">
                    Create listings for services you can provide to other students
                  </p>
                  <div className="flex flex-col space-y-2 w-full">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">List your services and pricing</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Set your availability</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm">Receive bookings and payments</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Our Team</h2>
            <p className="max-w-[700px] mx-auto text-muted-foreground">
              Meet the student entrepreneurs who created and maintain the UoE Student Marketplace
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((member) => (
              <div key={member} className="flex flex-col items-center text-center space-y-3">
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <Image 
                    src="/placeholder-user.jpg" 
                    alt={`Team member ${member}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">Team Member {member}</h3>
                  <p className="text-sm text-muted-foreground">Co-Founder</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Contact Section */}
        <section className="bg-muted p-8 rounded-lg">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Get In Touch</h2>
            <p className="text-muted-foreground">
              Have questions about UoE Student Marketplace? We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <a href="/contact" className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
                Contact Us
              </a>
              <a href="/faq" className="bg-secondary text-secondary-foreground px-8 py-3 rounded-md font-medium hover:bg-secondary/90 transition-colors">
                View FAQs
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}