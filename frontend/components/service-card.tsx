import Link from "next/link"
import Image from "next/image"
import { Star, MapPin, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Service } from "@/lib/types"

// Helper function to normalize image URLs
const normalizeImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  
  // If already absolute URL with protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Handle URL that includes 'uploads/' but may be missing the leading slash
  if (url.includes('uploads/') && !url.startsWith('/')) {
    return `/${url}`;
  }
  
  // If URL has a host but no protocol, add protocol
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // If URL is a relative path without starting slash, add it
  if (!url.startsWith('/')) {
    return `/${url}`;
  }
  
  return url;
};

// Helper function to attempt URL repair if the initial URL fails to load
const attemptUrlRepair = (url: string): string => {
  // Skip if it's already a placeholder or empty
  if (!url || url.includes('placeholder')) {
    return "/placeholder.svg?height=200&width=400";
  }
  
  // Extract filename from URL
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  
  // Try direct /uploads/ path
  if (!url.includes('/uploads/')) {
    return `/uploads/${filename}`;
  }
  
  // If it's a full URL with hostname and uploads, try the relative path
  if (url.includes('://') && url.includes('/uploads/')) {
    return `/uploads/${filename}`;
  }
  
  // Try prefixing with API base URL
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";
  if (!url.startsWith('http')) {
    return `${apiBase}${url.startsWith('/') ? url : `/${url}`}`;
  }
  
  // When all else fails, return placeholder
  return "/placeholder.svg?height=200&width=400";
};

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

  // Calculate discounted price if discount is available
  const discountedPrice = discount ? price - (price * discount / 100) : null;

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${featured ? "border-primary/50" : ""}`}>
      <div className="relative">
        {/* Log image information for debugging */}
        {process.env.NODE_ENV === 'development' && (() => {
          // Get the image URL
          const imageUrl = images?.[0] || null;
          
          console.log("Service card image data:", { 
            hasImages: !!images, 
            imageCount: images?.length || 0,
            firstImage: imageUrl || 'none',
            serviceId: _id
          });
          return null;
        })()}
        
        <Image
          src={normalizeImageUrl(images?.[0]) || "/placeholder.svg?height=200&width=400"}
          alt={title}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
          onError={(e) => {
            // If image fails to load, try alternate URL format before using placeholder
            const img = e.target as HTMLImageElement;
            const origSrc = img.src;
            
            if (images?.[0] && !origSrc.includes("placeholder.svg")) {
              // Try alternate URL format (e.g., if absolute URL fails, try relative)
              const alternateUrl = attemptUrlRepair(images[0]);
              console.error("Image failed to load, trying alternate format:", alternateUrl);
              img.src = alternateUrl;
            } else {
              // Fall back to placeholder
              console.error("Image failed completely, using placeholder:", origSrc);
              img.src = "/placeholder.svg?height=200&width=400";
            }
          }}
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
          {discount ? (
            <>
              <span className="text-destructive">KSh {discountedPrice?.toFixed(0)}</span>
              <span className="text-muted-foreground line-through text-sm ml-2">KSh {price}</span>
            </>
          ) : (
            <>KSh {price}</>
          )}
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

