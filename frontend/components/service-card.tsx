import Link from "next/link"
import Image from "next/image"
import { Star, MapPin, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Service } from "@/lib/types"

interface ServiceCardProps {
  service: Service
  featured?: boolean
}

export default function ServiceCard({ service, featured = false }: ServiceCardProps) {
  const {
    _id,
    title,
    category,
    price,
    location,
    rating,
    reviewCount,
    provider,
    images,
    featured: isPromoted,
    discount,
  } = service

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${featured ? "border-primary/50" : ""}`}>
      <div className="relative">
        <Image
          src={images?.[0] || "/placeholder.svg?height=200&width=400"}
          alt={title}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
        {isPromoted && <Badge className="absolute top-2 right-2 bg-primary">Featured</Badge>}
        {discount && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            {discount}% OFF
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2">
              {category?.name || "Uncategorized"}
            </Badge>
            <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
          </div>
          <div className="flex items-center space-x-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{rating || 0}</span>
            <span className="text-xs text-muted-foreground">({reviewCount || 0})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5" />
          <span>{location}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{service.availability || "Available Now"}</span>
        </div>
        <div className="flex items-center mt-3">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={provider?.profileImage} />
            <AvatarFallback>{provider?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{provider?.name}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <div className="font-bold">
          KSh {price}
          {service.priceType && (
            <span className="text-xs text-muted-foreground font-normal ml-1">{service.priceType}</span>
          )}
        </div>
        <Button asChild size="sm">
          <Link href={`/services/${_id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

