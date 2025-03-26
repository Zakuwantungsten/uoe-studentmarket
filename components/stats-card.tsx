import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: string
    label: string
    positive: boolean
  }
}

export default function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {(description || trend) && (
          <div className="mt-4">
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <p className="text-xs font-medium flex items-center mt-1">
                <span className={trend.positive ? "text-green-600" : "text-red-600"}>{trend.value}</span>
                <span className="text-muted-foreground ml-1">{trend.label}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

