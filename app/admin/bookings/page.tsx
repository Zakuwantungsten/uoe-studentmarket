import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard-layout"
import AdminDataTable from "@/components/admin-data-table"

export const metadata: Metadata = {
  title: "Admin Bookings | UoE Student Marketplace",
  description: "Manage bookings on the University of Eldoret Student Marketplace",
}

// Mock data for bookings
const mockBookings = [
  {
    id: "b1",
    service: "Programming Tutoring",
    customer: "Sarah Wanjiku",
    provider: "John Mwangi",
    date: "June 20, 2023",
    amount: "KSh 500",
    status: "Completed",
  },
  {
    id: "b2",
    service: "Food Delivery",
    customer: "David Omondi",
    provider: "Sarah Wanjiku",
    date: "July 25, 2023",
    amount: "KSh 50",
    status: "Completed",
  },
  {
    id: "b3",
    service: "Laundry Service",
    customer: "Mary Akinyi",
    provider: "David Omondi",
    date: "August 5, 2023",
    amount: "KSh 300",
    status: "In Progress",
  },
  {
    id: "b4",
    service: "Math Tutoring",
    customer: "James Kamau",
    provider: "Mary Akinyi",
    date: "August 15, 2023",
    amount: "KSh 450",
    status: "Cancelled",
  },
  {
    id: "b5",
    service: "Graphic Design",
    customer: "John Mwangi",
    provider: "James Kamau",
    date: "September 20, 2023",
    amount: "KSh 800",
    status: "Pending",
  },
]

const columns = [
  { key: "service", label: "Service" },
  { key: "customer", label: "Customer" },
  { key: "provider", label: "Provider" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
]

export default function AdminBookingsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <p className="text-muted-foreground">View and manage all bookings on the platform</p>

        <AdminDataTable title="Bookings" data={mockBookings} columns={columns} />
      </div>
    </DashboardLayout>
  )
}

