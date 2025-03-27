"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Users, ShoppingBag, Calendar, DollarSign } from "lucide-react"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { apiClient, handleApiError } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

interface AdminData {
  totalUsers: number
  totalServices: number
  totalBookings: number
  totalEarnings: number
  newUsersToday: number
  newServicesToday: number
  bookingsToday: number
  pendingBookings: number
  completedBookings: number
}

const AdminDashboard = () => {
  const { token } = useAuth()
  const [adminData, setAdminData] = useState<AdminData>({
    totalUsers: 0,
    totalServices: 0,
    totalBookings: 0,
    totalEarnings: 0,
    newUsersToday: 0,
    newServicesToday: 0,
    bookingsToday: 0,
    pendingBookings: 0,
    completedBookings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!token) return

      try {
        setIsLoading(true)
        const response = await apiClient.get<{ success: boolean; data: AdminData }>("/admin/dashboard", { token })
        
        // Check if response has the expected structure
        if (response.success && response.data) {
          setAdminData(response.data)
        } else {
          console.error("Unexpected API response structure:", response)
          handleApiError(new Error("Unexpected API response structure"), "Failed to load admin dashboard data")
        }
      } catch (error) {
        handleApiError(error, "Failed to load admin dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchAdminData()
    }
  }, [token])

  const generateReportData = () => {
    const data = [
      { label: "Total Users", value: adminData.totalUsers, newToday: adminData.newUsersToday },
      { label: "Total Services", value: adminData.totalServices, newToday: adminData.newServicesToday },
      { label: "Total Bookings", value: adminData.totalBookings, newToday: adminData.bookingsToday },
      { label: "Pending Bookings", value: adminData.pendingBookings },
      { label: "Completed Bookings", value: adminData.completedBookings },
      { label: "Total Earnings", value: adminData.totalEarnings },
    ]
    return data
  }

  const downloadReport = () => {
    const reportData = generateReportData()
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(reportData)
    XLSX.utils.book_append_sheet(wb, ws, "Admin Report")
    const wout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([new Uint8Array(wout)], { type: "application/octet-stream" })
    saveAs(blob, "admin_report.xlsx")
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>Overview of Marketplace Data</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary mr-2" />
                <div className="text-2xl font-bold">{isLoading ? "..." : adminData.totalUsers}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `+${adminData.newUsersToday} today`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-primary mr-2" />
                <div className="text-2xl font-bold">{isLoading ? "..." : adminData.totalServices}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `+${adminData.newServicesToday} today`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary mr-2" />
                <div className="text-2xl font-bold">{isLoading ? "..." : adminData.totalBookings}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `${adminData.pendingBookings} pending`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Earnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-primary mr-2" />
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : `KSh ${adminData.totalEarnings.toLocaleString()}`}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Platform revenue</p>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={downloadReport}>
            Download Report
            <Download className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AdminDashboard

