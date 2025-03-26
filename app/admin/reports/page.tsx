import type { Metadata } from "next"
import AdminReportsClientPage from "./AdminReportsClientPage"

export const metadata: Metadata = {
  title: "Admin Reports | UoE Student Marketplace",
  description: "Generate and download reports from the University of Eldoret Student Marketplace",
}

export default function AdminReportsPage() {
  return <AdminReportsClientPage />
}

