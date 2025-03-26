"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, BarChart, PieChart, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"

export default function AdminReportsClientPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and download various reports</p>

        <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
          <ReportCard
            title="User Report"
            description="Download detailed information about users"
            icon={<FileText className="h-8 w-8 text-primary" />}
            data={[
              { label: "Total Users", value: 150 },
              { label: "Active Users", value: 120 },
              { label: "Providers", value: 45 },
              { label: "Customers", value: 105 },
              { label: "New Users (Last 30 days)", value: 25 },
            ]}
            filename="user_report.xlsx"
          />

          <ReportCard
            title="Service Report"
            description="Download detailed information about services"
            icon={<BarChart className="h-8 w-8 text-primary" />}
            data={[
              { label: "Total Services", value: 65 },
              { label: "Active Services", value: 58 },
              { label: "Tutoring Services", value: 22 },
              { label: "Food Delivery Services", value: 15 },
              { label: "Other Services", value: 28 },
            ]}
            filename="service_report.xlsx"
          />

          <ReportCard
            title="Booking Report"
            description="Download detailed information about bookings"
            icon={<PieChart className="h-8 w-8 text-primary" />}
            data={[
              { label: "Total Bookings", value: 210 },
              { label: "Completed Bookings", value: 175 },
              { label: "Pending Bookings", value: 15 },
              { label: "Cancelled Bookings", value: 20 },
              { label: "Bookings (Last 30 days)", value: 45 },
            ]}
            filename="booking_report.xlsx"
          />

          <ReportCard
            title="Revenue Report"
            description="Download detailed information about revenue"
            icon={<TrendingUp className="h-8 w-8 text-primary" />}
            data={[
              { label: "Total Revenue", value: "KSh 18,500" },
              { label: "Revenue (Last 30 days)", value: "KSh 4,200" },
              { label: "Average Booking Value", value: "KSh 88" },
              { label: "Highest Revenue Service", value: "Tutoring" },
              { label: "Platform Fees Collected", value: "KSh 1,850" },
            ]}
            filename="revenue_report.xlsx"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

function ReportCard({ title, description, icon, data, filename }) {
  const [timeframe, setTimeframe] = useState("all-time")

  const downloadReport = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, title)
    const wout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([new Uint8Array(wout)], { type: "application/octet-stream" })
    saveAs(blob, filename)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {icon}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Time Period:</span>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 mt-4">
            {data.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="text-sm text-muted-foreground">{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={downloadReport} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </CardFooter>
    </Card>
  )
}

