import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard-layout"
import AdminDataTable from "@/components/admin-data-table"

export const metadata: Metadata = {
  title: "Admin Services | UoE Student Marketplace",
  description: "Manage services on the University of Eldoret Student Marketplace",
}

// Mock data for services
const mockServices = [
  {
    id: "s1",
    title: "Programming Tutoring",
    provider: "John Mwangi",
    category: "Tutoring",
    price: "KSh 500",
    status: "Active",
    created: "June 15, 2023",
  },
  {
    id: "s2",
    title: "Food Delivery",
    provider: "Sarah Wanjiku",
    category: "Food Delivery",
    price: "KSh 50",
    status: "Active",
    created: "July 20, 2023",
  },
  {
    id: "s3",
    title: "Laundry Service",
    provider: "David Omondi",
    category: "Laundry",
    price: "KSh 300",
    status: "Active",
    created: "May 25, 2023",
  },
  {
    id: "s4",
    title: "Math Tutoring",
    provider: "Mary Akinyi",
    category: "Tutoring",
    price: "KSh 450",
    status: "Inactive",
    created: "August 10, 2023",
  },
  {
    id: "s5",
    title: "Graphic Design",
    provider: "James Kamau",
    category: "Graphic Design",
    price: "KSh 800",
    status: "Active",
    created: "September 15, 2023",
  },
]

const columns = [
  { key: "title", label: "Service" },
  { key: "provider", label: "Provider" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price" },
  { key: "status", label: "Status" },
  { key: "created", label: "Created" },
]

export default function AdminServicesPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
        <p className="text-muted-foreground">View and manage all services on the platform</p>

        <AdminDataTable title="Services" data={mockServices} columns={columns} />
      </div>
    </DashboardLayout>
  )
}

