"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Eye, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { serviceService } from "@/lib/services/service-service"
import type { Service } from "@/lib/types"
import { handleApiError } from "@/lib/api-client"

export default function MyServicesPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/my-services")
      return
    }

    if (!authLoading && user?.role !== "provider") {
      toast({
        title: "Access denied",
        description: "Only service providers can access this page",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    const fetchServices = async () => {
      if (!token) return

      try {
        setIsLoading(true)
        const response = await serviceService.getMyServices(token)
        setServices(response.data)
      } catch (error) {
        handleApiError(error, "Failed to load services")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchServices()
    }
  }, [token, authLoading, isAuthenticated, user, router, toast])

  const handleDeleteService = async () => {
    if (!serviceToDelete || !token) return

    try {
      setIsDeleting(true)

      await serviceService.deleteService(serviceToDelete, token)

      // Remove the deleted service from the list
      setServices(services.filter((service) => service._id !== serviceToDelete))

      toast({
        title: "Service deleted",
        description: "Your service has been deleted successfully.",
      })

      setServiceToDelete(null)
    } catch (error) {
      handleApiError(error, "Failed to delete service")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredServices = services.filter((service) => {
    if (activeTab === "all") return true
    return service.status === activeTab
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Inactive
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
          <div className="h-12 w-96 bg-muted animate-pulse rounded"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
            <p className="text-muted-foreground">Manage your service listings</p>
          </div>
          <Button asChild>
            <Link href="/my-services/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Service
            </Link>
          </Button>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredServices.length > 0 ? (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <Card key={service._id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-medium">
                          <Link href={`/services/${service._id}`} className="hover:underline">
                            {service.title}
                          </Link>
                        </h3>
                        {getStatusBadge(service.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{service.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">{service.category?.name || "Uncategorized"}</Badge>
                        <Badge variant="secondary">KSh {service.price}</Badge>
                        {service.featured && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 sm:gap-3">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/services/${service._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/my-services/edit/${service._id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setServiceToDelete(service._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Service</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this service? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex items-start space-x-2 py-4">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div className="text-sm text-muted-foreground">
                              Deleting this service will remove all associated bookings and reviews.
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setServiceToDelete(null)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteService} disabled={isDeleting}>
                              {isDeleting ? "Deleting..." : "Delete Service"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-medium">No services found</p>
            <p className="text-muted-foreground">
              {activeTab === "all"
                ? "You haven't created any services yet."
                : `You don't have any ${activeTab} services.`}
            </p>
            <Button asChild className="mt-4">
              <Link href="/my-services/create">Create a Service</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

