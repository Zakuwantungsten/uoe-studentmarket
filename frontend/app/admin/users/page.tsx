import type { Metadata } from "next"
import DashboardLayout from "@/components/dashboard-layout"
import AdminDataTable from "@/components/admin-data-table"

export const metadata: Metadata = {
  title: "Admin Users | UoE Student Marketplace",
  description: "Manage users on the University of Eldoret Student Marketplace",
}

// Mock data for users
const mockUsers = [
  {
    id: "u1",
    name: "John Mwangi",
    email: "john.m@students.uoeld.ac.ke",
    role: "Provider",
    status: "Active",
    joinDate: "June 10, 2023",
  },
  {
    id: "u2",
    name: "Sarah Wanjiku",
    email: "sarah.w@students.uoeld.ac.ke",
    role: "Customer",
    status: "Active",
    joinDate: "July 15, 2023",
  },
  {
    id: "u3",
    name: "David Omondi",
    email: "david.o@students.uoeld.ac.ke",
    role: "Provider",
    status: "Active",
    joinDate: "May 22, 2023",
  },
  {
    id: "u4",
    name: "Mary Akinyi",
    email: "mary.a@students.uoeld.ac.ke",
    role: "Customer",
    status: "Inactive",
    joinDate: "August 5, 2023",
  },
  {
    id: "u5",
    name: "James Kamau",
    email: "james.k@students.uoeld.ac.ke",
    role: "Provider",
    status: "Active",
    joinDate: "September 12, 2023",
  },
]

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "joinDate", label: "Join Date" },
]

export default function AdminUsersPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">View and manage all users on the platform</p>

        <AdminDataTable title="Users" data={mockUsers} columns={columns} />
      </div>
    </DashboardLayout>
  )
}

