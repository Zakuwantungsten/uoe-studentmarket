"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { categoryService } from "@/lib/services/category-service"
import { serviceService } from "@/lib/services/service-service"

export default function OfferServicePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    priceType: "per-hour",
    location: "",
    categoryId: "",
    availability: "",
    deliveryTime: "",
    features: [],
    image: "",
    featured: false,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories()
        setCategories(response.data)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchCategories()
  }, [toast])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFeatureChange = (feature, checked) => {
    setFormData((prev) => ({
      ...prev,
      features: checked ? [...prev.features, feature] : prev.features.filter((f) => f !== feature),
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title) newErrors.title = "Title is required"
    if (!formData.description) newErrors.description = "Description is required"
    if (!formData.price) newErrors.price = "Price is required"
    if (!formData.location) newErrors.location = "Location is required"
    if (!formData.categoryId) newErrors.categoryId = "Category is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)

      // Format data for API
      const serviceData = {
        ...formData,
        price: Number.parseFloat(formData.price),
      }

      await serviceService.createService(serviceData)

      toast({
        title: "Success",
        description: "Your service has been created successfully!",
      })

      router.push("/my-services")
    } catch (error) {
      console.error("Error creating service:", error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Offer a New Service</h1>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>
                  Provide information about the service you want to offer to other students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Programming Tutoring - Java, Python, JavaScript"
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                  <p className="text-xs text-muted-foreground">Be specific and clear about what you're offering</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    onValueChange={(value) => handleSelectChange("categoryId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (KSh)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="e.g., 500"
                      value={formData.price}
                      onChange={handleChange}
                    />
                    {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price-type">Price Type</Label>
                    <Select
                      name="priceType"
                      value={formData.priceType}
                      onValueChange={(value) => handleSelectChange("priceType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select price type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per-hour">Per Hour</SelectItem>
                        <SelectItem value="per-session">Per Session</SelectItem>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="starting-from">Starting From</SelectItem>
                        <SelectItem value="per-day">Per Day</SelectItem>
                        <SelectItem value="per-item">Per Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your service in detail. What do you offer? What are your qualifications? What can students expect?"
                    rows={5}
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                  <p className="text-xs text-muted-foreground">
                    Be detailed and highlight your expertise and what makes your service unique
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Service Features</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="feature1"
                        checked={formData.features.includes("One-on-one sessions")}
                        onCheckedChange={(checked) => handleFeatureChange("One-on-one sessions", checked)}
                      />
                      <Label htmlFor="feature1" className="text-sm font-normal">
                        One-on-one sessions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="feature2"
                        checked={formData.features.includes("Group sessions available")}
                        onCheckedChange={(checked) => handleFeatureChange("Group sessions available", checked)}
                      />
                      <Label htmlFor="feature2" className="text-sm font-normal">
                        Group sessions available
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="feature3"
                        checked={formData.features.includes("Online sessions")}
                        onCheckedChange={(checked) => handleFeatureChange("Online sessions", checked)}
                      />
                      <Label htmlFor="feature3" className="text-sm font-normal">
                        Online sessions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="feature4"
                        checked={formData.features.includes("In-person sessions")}
                        onCheckedChange={(checked) => handleFeatureChange("In-person sessions", checked)}
                      />
                      <Label htmlFor="feature4" className="text-sm font-normal">
                        In-person sessions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="feature5"
                        checked={formData.features.includes("Flexible scheduling")}
                        onCheckedChange={(checked) => handleFeatureChange("Flexible scheduling", checked)}
                      />
                      <Label htmlFor="feature5" className="text-sm font-normal">
                        Flexible scheduling
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="feature6"
                        checked={formData.features.includes("Materials provided")}
                        onCheckedChange={(checked) => handleFeatureChange("Materials provided", checked)}
                      />
                      <Label htmlFor="feature6" className="text-sm font-normal">
                        Materials provided
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    name="location"
                    value={formData.location}
                    onValueChange={(value) => handleSelectChange("location", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On Campus">On Campus</SelectItem>
                      <SelectItem value="Off Campus">Off Campus</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Dorms">Dorms</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                      <SelectItem value="Campus Wide">Campus Wide</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    placeholder="e.g., Weekdays 4-8pm, Weekends 10am-6pm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Delivery Time (if applicable)</Label>
                  <Input
                    id="deliveryTime"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    placeholder="e.g., Within 24 hours, 2-3 days"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Service Image URL (optional)</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">Enter a URL for an image that represents your service</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleSelectChange("featured", checked)}
                  />
                  <Label htmlFor="featured">Promote as featured service (additional fee applies)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                  {loading ? "Creating..." : "Create Service"}
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="/dashboard">Cancel</Link>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

