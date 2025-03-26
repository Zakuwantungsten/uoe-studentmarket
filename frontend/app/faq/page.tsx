"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// FAQ data
const faqData = {
  general: [
    {
      question: "What is the University of Eldoret Student Marketplace?",
      answer:
        "The University of Eldoret Student Marketplace is a platform where students can offer and find various services within the university community. It connects service providers with customers, making it easy to discover, book, and pay for services.",
    },
    {
      question: "Who can use the marketplace?",
      answer:
        "The marketplace is primarily designed for University of Eldoret students. Students can register as service providers to offer their skills or as customers to book services.",
    },
    {
      question: "Is the marketplace free to use?",
      answer:
        "Yes, creating an account and browsing services is completely free. The platform charges a small service fee on completed transactions to maintain the service.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach our customer support team through the 'Contact Us' page or by sending an email to support@uoemarketplace.com. We typically respond within 24 hours.",
    },
  ],
  customers: [
    {
      question: "How do I book a service?",
      answer:
        "To book a service, browse or search for the service you need, view the details, and click the 'Book Now' button. You'll need to select a date and time, provide any necessary details, and complete the payment process.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "Currently, we accept M-Pesa as our primary payment method. We plan to add more payment options in the future.",
    },
    {
      question: "Can I cancel a booking?",
      answer:
        "Yes, you can cancel a booking through your 'My Bookings' page. Please note that cancellation policies may vary depending on the service provider and how close to the appointment time you cancel.",
    },
    {
      question: "How do I leave a review?",
      answer:
        "After a service is marked as completed, you'll have the option to leave a review on the service page or through your 'My Bookings' section. Reviews help other students make informed decisions.",
    },
  ],
  providers: [
    {
      question: "How do I become a service provider?",
      answer:
        "To become a service provider, sign up for an account and select 'Provider' as your role. Complete your profile with relevant information about your skills and experience, then create your service listings.",
    },
    {
      question: "How do I create a service listing?",
      answer:
        "After registering as a provider, go to 'My Services' and click 'Create New Service'. Fill in the details about your service, including title, description, price, category, and availability.",
    },
    {
      question: "How and when do I get paid?",
      answer:
        "Payments are processed through M-Pesa. When a customer books and pays for your service, the funds are held until the service is marked as completed. Once completed, the payment (minus platform fees) is transferred to your account.",
    },
    {
      question: "Can I offer multiple services?",
      answer:
        "Yes, you can create multiple service listings under your provider account. This allows you to showcase different skills and reach more potential customers.",
    },
  ],
  payments: [
    {
      question: "Is it safe to pay through the platform?",
      answer:
        "Yes, all payments are processed securely. We use industry-standard encryption and security measures to protect your financial information.",
    },
    {
      question: "What happens if I'm not satisfied with a service?",
      answer:
        "If you're not satisfied with a service, we encourage you to first communicate with the provider to resolve the issue. If that doesn't work, you can contact our support team to help mediate or process a refund if necessary.",
    },
    {
      question: "Are there any hidden fees?",
      answer:
        "No, all fees are transparently displayed during the booking process. The price you see is the price you pay, with no hidden charges.",
    },
    {
      question: "How do refunds work?",
      answer:
        "Refund policies may vary by service provider. Generally, if a service is cancelled by the provider or not delivered as described, you're eligible for a full refund. Contact our support team if you need assistance with refunds.",
    },
  ],
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("general")

  // Filter FAQs based on search query
  const filterFAQs = (faqs: typeof faqData.general) => {
    if (!searchQuery.trim()) return faqs

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  // Get filtered FAQs for current tab
  const currentFAQs = filterFAQs(faqData[activeTab as keyof typeof faqData])

  // Search across all categories
  const searchAllFAQs = () => {
    const results: {
      category: string
      faqs: typeof faqData.general
    }[] = []

    Object.entries(faqData).forEach(([category, faqs]) => {
      const filtered = filterFAQs(faqs)
      if (filtered.length > 0) {
        results.push({
          category,
          faqs: filtered,
        })
      }
    })

    return results
  }

  const allSearchResults = searchQuery.trim() ? searchAllFAQs() : []

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-6">
          Find answers to common questions about the University of Eldoret Student Marketplace
        </p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {searchQuery.trim() ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>

            {allSearchResults.length > 0 ? (
              <div className="space-y-6">
                {allSearchResults.map(({ category, faqs }) => (
                  <div key={category}>
                    <h3 className="text-lg font-medium capitalize mb-2">{category}</h3>
                    <Accordion type="single" collapsible className="border rounded-lg">
                      {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`${category}-${index}`}>
                          <AccordionTrigger className="px-4">{faq.question}</AccordionTrigger>
                          <AccordionContent className="px-4">
                            <p>{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <p className="font-medium">No results found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try different keywords or browse the categories below
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="customers">For Customers</TabsTrigger>
              <TabsTrigger value="providers">For Providers</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            {Object.entries(faqData).map(([category, faqs]) => (
              <TabsContent key={category} value={category}>
                <Accordion type="single" collapsible className="border rounded-lg">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={index.toString()}>
                      <AccordionTrigger className="px-4">{faq.question}</AccordionTrigger>
                      <AccordionContent className="px-4">
                        <p>{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">Still have questions? We're here to help!</p>
          <Button asChild className="mt-2">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

