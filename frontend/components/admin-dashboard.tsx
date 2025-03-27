"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Users, ShoppingBag, Calendar, DollarSign } from "lucide-react"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { apiClient, handleApiError } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts"

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
  usersByRole?: { role: string; _count: number }[]
  servicesByCategory?: { category: string; count: number }[]
  bookingsByStatus?: { status: string; _count: number }[]
}

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

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

  // Prepare chart data
  const usersByRoleData = adminData.usersByRole?.map((item) => ({
    name: item.role,
    value: item._count
  })) || [];

  const servicesByCategoryData = adminData.servicesByCategory?.map((item) => ({
    name: item.category,
    value: item.count
  })) || [];

  const bookingsByStatusData = adminData.bookingsByStatus?.map((item) => ({
    name: item.status,
    value: item._count
  })) || [];

  return (
    <div className="container mx-auto py-10 space-y-6">
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
                <div className="text-2xl font-bold">{isLoading ? "..." : adminData.totalUsers || 0}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `+${adminData.newUsersToday || 0} today`}
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
                <div className="text-2xl font-bold">{isLoading ? "..." : adminData.totalServices || 0}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `+${adminData.newServicesToday || 0} today`}
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
                <div className="text-2xl font-bold">{isLoading ? "..." : adminData.totalBookings || 0}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading..." : `${adminData.pendingBookings || 0} pending`}
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
                  {isLoading ? "..." : `KSh ${(adminData.totalEarnings || 0).toLocaleString()}`}
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

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users by Role Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">Loading...</div>
            ) : usersByRoleData.length > 0 ? (
              <ChartContainer
                config={{
                  users: { label: "Users" },
                }}
                className="h-64"
              >
                <PieChart>
                  <Pie
                    data={usersByRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {usersByRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-64">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Services by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Services by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">Loading...</div>
            ) : servicesByCategoryData.length > 0 ? (
              <ChartContainer
                config={{
                  services: { label: "Services" },
                }}
                className="h-64"
              >
                <BarChart data={servicesByCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8">
                    {servicesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-64">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Bookings by Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">Loading...</div>
            ) : bookingsByStatusData.length > 0 ? (
              <ChartContainer
                config={{
                  bookings: { label: "Bookings" },
                }}
                className="h-64"
              >
                <PieChart>
                  <Pie
                    data={bookingsByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {bookingsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-64">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard

