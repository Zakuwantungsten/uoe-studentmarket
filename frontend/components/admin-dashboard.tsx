"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  Users,
  ShoppingBag,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
  FileText,
  Server,
  Activity,
  Bell,
  AlertCircle,
  Search,
  User,
  CheckCircle,
  Flag,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  MessageSquare,
  Clock,
  Trash,
  Ban,
  Shield,
  Eye,
  Edit,
} from "lucide-react"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { apiClient, handleApiError } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts"

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ff6b6b', '#6a5acd'];

// Interface definitions
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
  recentUsers?: any[]
  recentBookings?: any[]
  recentServices?: any[]
  pendingServices?: any[]
  pendingReviews?: any[]
  recentReports?: any[]
  recentDisputes?: any[]
  systemHealth?: {
    serverUptime: string
    apiStatus: "healthy" | "degraded" | "down"
    storageUsage: string
    recentErrors: number
  }
}

// Recent activity type
interface ActivityItem {
  id: string
  type: "signup" | "booking" | "service" | "review" | "admin" | "system"
  description: string
  user?: { id: string; name: string; image?: string }
  timestamp: string
  status?: string
}

// Stats card component
// Stats card component props interface
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string | number;
  changeType?: "increase" | "decrease";
  subtitle: string;
}

const StatsCard = ({ title, value, icon, change, changeType, subtitle }: StatsCardProps) => {
  const Icon = icon
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {changeType === "increase" ? (
              <ArrowUp className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            <span className={changeType === "increase" ? "text-green-500" : "text-red-500"}>
              {change}
            </span>
            <span className="text-muted-foreground">{subtitle}</span>
          </p>
        )}
        {!change && subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

// Activity item component
const ActivityItem = ({ item }: { item: ActivityItem }) => {
  // Icon mapping
  const iconMap = {
    signup: User,
    booking: Calendar,
    service: ShoppingBag,
    review: FileText,
    admin: Shield,
    system: Server,
  }
  
  const Icon = iconMap[item.type]
  
  // Status badge styling
  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
      case "active":
        return "outline" // Using outline instead of success
      case "pending":
        return "default" // Using default instead of warning
      case "cancelled":
      case "declined":
      case "inactive":
        return "destructive"
      default:
        return "secondary"
    }
  }
  
  return (
    <div className="flex items-start space-x-4 py-4">
      <div className="rounded-full bg-primary/10 p-2">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{item.description}</p>
        <div className="flex items-center pt-2">
          {item.user && (
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={item.user.image || "/placeholder-user.jpg"} alt={item.user.name} />
                <AvatarFallback>{item.user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{item.user.name}</span>
            </div>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{item.timestamp}</span>
        </div>
        {item.status && (
          <Badge variant={getBadgeVariant(item.status)} className="mt-2">
            {item.status}
          </Badge>
        )}
      </div>
    </div>
  )
}

// Alert severity indicator
interface SystemAlertProps {
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
}

const SystemAlert = ({ title, description, severity }: SystemAlertProps) => {
  const iconMap = {
    critical: AlertCircle,
    warning: Bell,
    info: Activity
  }
  
  const Icon = iconMap[severity]
  
  return (
    <Alert variant={severity === "critical" ? "destructive" : severity === "warning" ? "default" : null} className="mb-4">
      <Icon className="h-4 w-4" />
      <div className="ml-3">
        <h5 className="font-medium">{title}</h5>
        <AlertDescription>{description}</AlertDescription>
      </div>
    </Alert>
  )
}

// Define column structure for data tables
interface TableColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

// Report data table props
interface ReportTableProps {
  data: Record<string, any>[];
  columns: TableColumn[];
}

// Report data table
const ReportTable = ({ data, columns }: ReportTableProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredData = data.filter((item: Record<string, any>) =>
    Object.values(item).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="ml-auto">
          <FileText className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column: TableColumn) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row: Record<string, any>, i: number) => (
                <TableRow key={i}>
                  {columns.map((column: TableColumn) => (
                    <TableCell key={column.key}>
                      {column.format ? column.format(row[column.key]) : row[column.key]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {row.actions?.includes('ban') && (
                      <Button variant="ghost" size="sm">
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                    {row.actions?.includes('delete') && (
                      <Button variant="ghost" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Main Admin Dashboard Component
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
  const [timeframe, setTimeframe] = useState("week")
  const [alerts, setAlerts] = useState([
    {
      id: "alert1",
      title: "Scheduled Maintenance",
      description: "System will undergo maintenance on Sunday, 4:00 AM - 6:00 AM EAT",
      severity: "info"
    }
  ])
  
  // Recent activity
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([
    {
      id: "act1",
      type: "signup",
      description: "New user registered",
      user: { id: "u1", name: "James Mwangi" },
      timestamp: "10 minutes ago"
    },
    {
      id: "act2",
      type: "booking",
      description: "New booking created",
      user: { id: "u2", name: "Sarah Wanjiku" },
      timestamp: "35 minutes ago",
      status: "Pending"
    },
    {
      id: "act3",
      type: "service",
      description: "New service listed",
      user: { id: "u3", name: "David Kimani" },
      timestamp: "2 hours ago",
      status: "Pending Approval"
    },
    {
      id: "act4",
      type: "admin",
      description: "Service approval",
      user: { id: "u4", name: "Admin User" },
      timestamp: "3 hours ago",
      status: "Approved"
    },
    {
      id: "act5",
      type: "system",
      description: "System backup completed",
      timestamp: "5 hours ago"
    }
  ])
  
  // Mock data for flagged content
  const [flaggedContent, setFlaggedContent] = useState([
    {
      id: "r1",
      type: "review",
      content: "This service is a scam! Avoid at all costs!",
      reporter: "John Doe",
      reported: "Jane Smith",
      date: "Aug 15, 2023",
      status: "Pending",
      actions: ['delete', 'ban']
    },
    {
      id: "r2",
      type: "service",
      content: "Get exam answers guaranteed!",
      reporter: "Admin System",
      reported: "Peter Parker",
      date: "Aug 14, 2023",
      status: "Pending",
      actions: ['delete', 'ban']
    },
    {
      id: "r3",
      type: "message",
      content: "Inappropriate content in message",
      reporter: "Mary Johnson",
      reported: "Bob Brown",
      date: "Aug 10, 2023",
      status: "Pending",
      actions: ['delete', 'ban']
    }
  ])
  
  // Mock data for disputes
  const [disputes, setDisputes] = useState([
    {
      id: "d1",
      service: "Math Tutoring",
      customer: "Alice Smith",
      provider: "Bob Johnson",
      amount: "KSh 1,500",
      date: "Aug 16, 2023",
      issue: "Service not provided as described",
      status: "Open",
      actions: ['ban']
    },
    {
      id: "d2",
      service: "Essay Writing",
      customer: "Charles Brown",
      provider: "Diana White",
      amount: "KSh 2,000",
      date: "Aug 14, 2023",
      issue: "Refund requested",
      status: "In Mediation",
      actions: ['ban']
    }
  ])

  // Revenue chart data
  const [revenueData, setRevenueData] = useState([
    { name: 'Mon', revenue: 1500 },
    { name: 'Tue', revenue: 2300 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 3090 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 1490 },
  ])
  
  // Category distribution data
  const [categoryData, setCategoryData] = useState([
    { name: 'Tutoring', value: 45 },
    { name: 'Food Delivery', value: 20 },
    { name: 'Laundry', value: 15 },
    { name: 'Design', value: 10 },
    { name: 'IT Services', value: 10 },
  ])
  
  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!token) return

      try {
        setIsLoading(true)
        const response = await apiClient.get<{ success: boolean; data: AdminData }>("/admin/dashboard", { token })
        
        // Check if response has the expected structure
        if (response.success && response.data) {
          setAdminData(response.data)
          
          // Create derived data for charts
          if (response.data.bookingsByStatus) {
            const statusData = response.data.bookingsByStatus.map(item => ({
              name: item.status,
              value: item._count
            }))
            // Update state variables if needed
          }
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
  }, [token, timeframe])

  // Generate report data
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

  // Download report
  const downloadReport = () => {
    const reportData = generateReportData()
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(reportData)
    XLSX.utils.book_append_sheet(wb, ws, "Admin Report")
    const wout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([new Uint8Array(wout)], { type: "application/octet-stream" })
    saveAs(blob, "admin_report.xlsx")
  }

  // User columns for data table
  const userColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "joinDate", label: "Join Date" }
  ]

  // Service columns for data table
  const serviceColumns = [
    { key: "title", label: "Service" },
    { key: "provider", label: "Provider" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price", format: (val: number) => `KSh ${val}` },
    { key: "status", label: "Status" }
  ]

  // Flagged content columns
  const flaggedColumns = [
    { key: "type", label: "Type" },
    { key: "content", label: "Content" },
    { key: "reporter", label: "Reported By" },
    { key: "reported", label: "Reported User" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" }
  ]

  // Dispute columns
  const disputeColumns = [
    { key: "service", label: "Service" },
    { key: "customer", label: "Customer" },
    { key: "provider", label: "Provider" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" }
  ]

  return (
    <div className="space-y-8">
      {/* Time period selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select
            value={timeframe}
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {alerts.map(alert => (
        <SystemAlert 
          key={alert.id}
          title={alert.title}
          description={alert.description}
          severity={alert.severity as "critical" | "warning" | "info"}
        />
      ))}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={isLoading ? "..." : adminData.totalUsers?.toString() || "0"}
          icon={Users}
          change={adminData.newUsersToday?.toString() || "0"}
          changeType="increase"
          subtitle="today"
        />
        <StatsCard
          title="Total Services"
          value={isLoading ? "..." : adminData.totalServices?.toString() || "0"}
          icon={ShoppingBag}
          change={adminData.newServicesToday?.toString() || "0"}
          changeType="increase"
          subtitle="today"
        />
        <StatsCard
          title="Total Bookings"
          value={isLoading ? "..." : adminData.totalBookings?.toString() || "0"}
          icon={Calendar}
          change={adminData.pendingBookings?.toString() || "0"}
          changeType="increase"
          subtitle="pending"
        />
        <StatsCard
          title="Total Earnings"
          value={isLoading ? "..." : `KSh ${(adminData.totalEarnings || 0).toLocaleString()}`}
          icon={DollarSign}
          subtitle="platform revenue"
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Charts Section - Spans 5 columns */}
            <Card className="col-span-full lg:col-span-5">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Daily revenue for the selected period</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Revenue (KSh)"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Recent Activity - Spans 2 columns */}
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentActivity.slice(0, 4).map((activity) => (
                    <ActivityItem key={activity.id} item={activity} />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Activity</Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Second row of charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* User Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <RechartsPieChart>
                    <Pie
                      data={adminData.usersByRole?.map(item => ({
                        name: item.role,
                        value: item._count
                      })) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Service Categories Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Service Categories</CardTitle>
                <CardDescription>Services by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Services">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* System Health Card */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current platform status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Server Uptime</span>
                    <Badge variant="outline">99.8%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">API Status</span>
                    <Badge variant="outline" className="text-green-500">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <Badge variant="outline">65% (3.2GB/5GB)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recent Errors</span>
                    <Badge variant="outline">2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Backup</span>
                    <Badge variant="outline">3 hours ago</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Server className="mr-2 h-4 w-4" />
                  Run Diagnostics
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Third row for pending items */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Services awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {isLoading ? (
                    <p>Loading pending approvals...</p>
                  ) : adminData.pendingServices && adminData.pendingServices.length > 0 ? (
                    adminData.pendingServices.slice(0, 3).map((service) => (
                      <li key={service.id} className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{service.title}</p>
                          <p className="text-sm text-muted-foreground">By {service.provider.name}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p>No pending approvals</p>
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Pending Approvals</Button>
              </CardFooter>
            </Card>
            
            {/* Flagged Content */}
            <Card>
              <CardHeader>
                <CardTitle>Flagged Content</CardTitle>
                <CardDescription>Reported content for moderation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {flaggedContent.slice(0, 3).map((item) => (
                    <li key={item.id} className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <Badge variant="destructive" className="mr-2">{item.type}</Badge>
                          <p className="font-medium truncate max-w-[200px]">{item.content}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reported by {item.reporter} on {item.date}
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Flag className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Flagged Content</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportTable 
                data={[
                  {
                    id: "u1",
                    name: "John Mwangi",
                    email: "john.m@students.uoeld.ac.ke",
                    role: "Provider",
                    status: "Active",
                    joinDate: "June 10, 2023",
                    actions: ['ban', 'delete']
                  },
                  {
                    id: "u2",
                    name: "Sarah Wanjiku",
                    email: "sarah.w@students.uoeld.ac.ke",
                    role: "Customer",
                    status: "Active",
                    joinDate: "July 15, 2023",
                    actions: ['ban', 'delete']
                  },
                  {
                    id: "u3",
                    name: "David Omondi",
                    email: "david.o@students.uoeld.ac.ke",
                    role: "Provider",
                    status: "Active",
                    joinDate: "May 22, 2023",
                    actions: ['ban', 'delete']
                  },
                  {
                    id: "u4",
                    name: "Mary Akinyi",
                    email: "mary.a@students.uoeld.ac.ke",
                    role: "Customer",
                    status: "Inactive",
                    joinDate: "August 5, 2023",
                    actions: ['ban', 'delete']
                  },
                  {
                    id: "u5",
                    name: "James Kamau",
                    email: "james.k@students.uoeld.ac.ke",
                    role: "Provider",
                    status: "Active",
                    joinDate: "September 12, 2023",
                    actions: ['ban', 'delete']
                  }
                ]} 
                columns={userColumns} 
              />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>User registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart
                    data={[
                      { name: 'Jan', users: 40 },
                      { name: 'Feb', users: 55 },
                      { name: 'Mar', users: 70 },
                      { name: 'Apr', users: 90 },
                      { name: 'May', users: 120 },
                      { name: 'Jun', users: 150 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} name="Users" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Login Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle>Login Activity</CardTitle>
                <CardDescription>Recent user logins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: "Mary Akinyi", time: "10 minutes ago", ip: "102.167.xx.xx", location: "Nairobi, Kenya" },
                    { user: "John Mwangi", time: "35 minutes ago", ip: "41.204.xx.xx", location: "Eldoret, Kenya" },
                    { user: "Sarah Wanjiku", time: "1 hour ago", ip: "105.161.xx.xx", location: "Nakuru, Kenya" },
                    { user: "David Omondi", time: "3 hours ago", ip: "196.201.xx.xx", location: "Kisumu, Kenya" }
                  ].map((login, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{login.user}</p>
                        <p className="text-sm text-muted-foreground">{login.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{login.location}</p>
                        <p className="text-xs text-muted-foreground">{login.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Logins</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>View and manage all services on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportTable 
                data={[
                  {
                    id: "s1",
                    title: "Math Tutoring",
                    provider: "John Mwangi",
                    category: "Education",
                    price: 500,
                    status: "Active",
                    actions: ['delete']
                  },
                  {
                    id: "s2",
                    title: "Food Delivery",
                    provider: "Sarah Wanjiku",
                    category: "Food",
                    price: 150,
                    status: "Active",
                    actions: ['delete']
                  },
                  {
                    id: "s3",
                    title: "Website Development",
                    provider: "David Omondi",
                    category: "IT",
                    price: 2500,
                    status: "Pending",
                    actions: ['delete']
                  },
                  {
                    id: "s4",
                    title: "Laundry Service",
                    provider: "Mary Akinyi",
                    category: "Cleaning",
                    price: 300,
                    status: "Active",
                    actions: ['delete']
                  },
                  {
                    id: "s5",
                    title: "Graphic Design",
                    provider: "James Kamau",
                    category: "Design",
                    price: 800,
                    status: "Active",
                    actions: ['delete']
                  }
                ]} 
                columns={serviceColumns} 
              />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Category Management */}
            <Card>
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>Manage service categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Education", services: 32, featured: true },
                    { name: "Food", services: 24, featured: true },
                    { name: "IT Services", services: 18, featured: false },
                    { name: "Design", services: 15, featured: false },
                    { name: "Cleaning", services: 10, featured: false }
                  ].map((category, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{category.name}</p>
                          {category.featured && <Badge className="ml-2">Featured</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{category.services} services</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        {!category.featured && <Button variant="outline" size="sm">Feature</Button>}
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Add New Category</Button>
                <Button variant="outline">Manage All</Button>
              </CardFooter>
            </Card>
            
            {/* Featured Services */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Services</CardTitle>
                <CardDescription>Services promoted on the homepage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Math Tutoring", provider: "John Mwangi", category: "Education" },
                    { name: "Food Delivery", provider: "Sarah Wanjiku", category: "Food" },
                    { name: "Web Development", provider: "David Omondi", category: "IT Services" }
                  ].map((service, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">By {service.provider}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="outline">{service.category}</Badge>
                        <Button variant="outline" size="sm">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Manage Featured Services</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Management</CardTitle>
              <CardDescription>Handle disputes between users</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportTable 
                data={disputes}
                columns={disputeColumns} 
              />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Flagged Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Flagged Reviews</CardTitle>
                <CardDescription>Reviews reported for moderation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      id: "r1", 
                      service: "Math Tutoring", 
                      reviewer: "Alice Smith", 
                      provider: "John Mwangi", 
                      content: "This service is a complete scam! Avoid at all costs!",
                      date: "Aug 16, 2023"
                    },
                    { 
                      id: "r2", 
                      service: "Food Delivery", 
                      reviewer: "Bob Johnson", 
                      provider: "Sarah Wanjiku", 
                      content: "The food was terrible and arrived cold. Worst service ever!",
                      date: "Aug 14, 2023"
                    }
                  ].map((review, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <Badge variant="outline">{review.service}</Badge>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-sm mb-2">"{review.content}"</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>By: {review.reviewer}</span>
                        <span>For: {review.provider}</span>
                      </div>
                      <div className="flex justify-end space-x-2 mt-3">
                        <Button variant="outline" size="sm">Keep</Button>
                        <Button variant="destructive" size="sm">Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Flagged Reviews</Button>
              </CardFooter>
            </Card>
            
            {/* Dispute Resolution Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Dispute Analytics</CardTitle>
                <CardDescription>Insights into dispute patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: "Refund Issues", value: 40 },
                        { name: "Service Quality", value: 30 },
                        { name: "No-show", value: 15 },
                        { name: "Communication", value: 10 },
                        { name: "Other", value: 5 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Resolution Time</span>
                    <Badge variant="outline">2.5 days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Resolution Rate</span>
                    <Badge variant="outline">85%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <Badge variant="outline">4.2/5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>Generate custom reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Users Report</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Users</div>
                    <p className="text-xs text-muted-foreground mt-1">Registration, roles, activity</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Generate</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Services Report</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Services</div>
                    <p className="text-xs text-muted-foreground mt-1">Categories, listings, popularity</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Generate</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Financial Report</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Revenue</div>
                    <p className="text-xs text-muted-foreground mt-1">Earnings, transactions, trends</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Generate</Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Custom Report</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select defaultValue="users">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="bookings">Bookings</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="disputes">Disputes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Period</label>
                    <Select defaultValue="month">
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Last 24 Hours</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select defaultValue="excel">
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 flex items-end">
                    <Button className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>Key metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart
                    data={[
                      { name: 'Jan', users: 40, services: 20, bookings: 15 },
                      { name: 'Feb', users: 55, services: 25, bookings: 28 },
                      { name: 'Mar', users: 70, services: 32, bookings: 45 },
                      { name: 'Apr', users: 90, services: 45, bookings: 65 },
                      { name: 'May', users: 120, services: 58, bookings: 88 },
                      { name: 'Jun', users: 150, services: 70, bookings: 110 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} name="Users" />
                    <Line type="monotone" dataKey="services" stroke="#82ca9d" name="Services" />
                    <Line type="monotone" dataKey="bookings" stroke="#ffc658" name="Bookings" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>User locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { location: "Eldoret", count: 350, percentage: 35 },
                    { location: "Nairobi", count: 250, percentage: 25 },
                    { location: "Kisumu", count: 150, percentage: 15 },
                    { location: "Nakuru", count: 120, percentage: 12 },
                    { location: "Mombasa", count: 80, percentage: 8 },
                    { location: "Other", count: 50, percentage: 5 }
                  ].map((location, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-36 text-sm">{location.location}</div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${location.percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm text-right ml-2">{location.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Tools</CardTitle>
              <CardDescription>Manage announcements, notifications, and support tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Use these tools to communicate with users across the platform.</p>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Bulk Notifications</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-md font-medium">Send to Multiple Users</div>
                    <p className="text-xs text-muted-foreground mt-1">Email and in-app notifications</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" 
                      onClick={() => window.location.href = "/admin/communication"}>
                      Manage
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Announcement Banners</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-md font-medium">Site-wide Alerts</div>
                    <p className="text-xs text-muted-foreground mt-1">Display important messages to all users</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full"
                      onClick={() => window.location.href = "/admin/communication"}>
                      Manage
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-md font-medium">Customer Support</div>
                    <p className="text-xs text-muted-foreground mt-1">Respond to user inquiries and issues</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full"
                      onClick={() => window.location.href = "/admin/communication"}>
                      Manage
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Configure system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Access Control */}
              <div>
                <h3 className="text-lg font-medium mb-3">Access Control</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Admin Role</label>
                      <Select defaultValue="full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Admin</SelectItem>
                          <SelectItem value="user">User Manager</SelectItem>
                          <SelectItem value="content">Content Moderator</SelectItem>
                          <SelectItem value="support">Support Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Two-Factor Authentication</label>
                      <Select defaultValue="enabled">
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Platform Settings */}
              <div>
                <h3 className="text-lg font-medium mb-3">Platform Configuration</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Maintenance Mode</label>
                      <Select defaultValue="disabled">
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Platform Status</label>
                      <Select defaultValue="active">
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="readonly">Read Only</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Communication Settings */}
              <div>
                <h3 className="text-lg font-medium mb-3">Communication</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Notifications</label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select setting" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Events</SelectItem>
                          <SelectItem value="important">Important Only</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Announcement Banner</label>
                      <Select defaultValue="hidden">
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="hidden">Hidden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Reset</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
          
          {/* Admin Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Audit Log</CardTitle>
              <CardDescription>Record of administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[
                  { action: "User ban", admin: "Admin User", target: "John Smith", time: "Today, 10:35 AM", ip: "102.167.xx.xx" },
                  { action: "Service approval", admin: "Admin User", target: "Website Development", time: "Today, 9:20 AM", ip: "102.167.xx.xx" },
                  { action: "Settings change", admin: "Admin User", target: "Maintenance Mode", time: "Yesterday, 4:42 PM", ip: "102.167.xx.xx" },
                  { action: "User role update", admin: "Admin User", target: "David Omondi", time: "Yesterday, 2:15 PM", ip: "102.167.xx.xx" },
                  { action: "Report export", admin: "Admin User", target: "Users Report", time: "Aug 15, 2023", ip: "102.167.xx.xx" }
                ].map((log, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {log.action}: <span className="font-normal">{log.target}</span>
                      </p>
                      <div className="flex items-center pt-2">
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground">By {log.admin}</span>
                        </div>
                        <div className="ml-auto text-right">
                          <span className="text-xs text-muted-foreground">{log.time}</span>
                          <p className="text-xs text-muted-foreground">{log.ip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Full Audit Trail</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard