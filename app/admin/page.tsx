import type { Metadata } from "next"
import AdminDashboard from "@/components/admin-dashboard"
import DashboardLayout from "@/components/dashboard-layout"

export const metadata: Metadata = {
  title: "Admin Dashboard | UoE Student Marketplace",
  description: "Admin dashboard for the University of Eldoret Student Marketplace",
}

export default function AdminPage() {
  return (
    <DashboardLayout>
      <AdminDashboard />
    </DashboardLayout>
  )
}

