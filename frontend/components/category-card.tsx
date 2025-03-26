import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import {
  Book,
  Utensils,
  Home,
  Shirt,
  Palette,
  Calendar,
  Laptop,
  Car,
  Camera,
  Music,
  Scissors,
  ShoppingBag,
} from "lucide-react"
import type { Category } from "@/lib/types"

interface CategoryCardProps {
  category: Category
}

// Map category names to icons
const iconMap = {
  Tutoring: Book,
  "Food Delivery": Utensils,
  "House Hunting": Home,
  Laundry: Shirt,
  "Graphic Design": Palette,
  "Event Planning": Calendar,
  "Tech Support": Laptop,
  Transportation: Car,
  Photography: Camera,
  "Music Lessons": Music,
  Haircuts: Scissors,
  "Shopping Assistant": ShoppingBag,
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { _id, name, count } = category

  // Determine which icon to use
  const IconComponent = iconMap[name] || Book

  return (
    <Link href={`/categories/${_id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/50 h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <IconComponent className="h-6 w-6" />
          </div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-xs text-muted-foreground">{count || 0} services</p>
        </CardContent>
      </Card>
    </Link>
  )
}

