"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Home,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ShoppingBag,
  PlusCircle,
  Users,
  BarChart,
  FileText,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/auth-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const isAdminPage = pathname.startsWith("/admin")

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Listings", href: "/my-services", icon: ShoppingBag },
    { name: "Bookings", href: "/bookings", icon: Calendar },
    { name: "Reviews", href: "/dashboard?tab=reviews", icon: Star },
    { name: "Reports", href: "/dashboard?tab=reports", icon: FileText },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const adminNavigation = [
    { name: "Admin Dashboard", href: "/admin", icon: BarChart },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Service Management", href: "/admin/services", icon: ShoppingBag },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Dispute Resolution", href: "/admin/disputes", icon: MessageSquare },
    { name: "Review Control", href: "/admin/reviews", icon: Star },
    { name: "Financial Management", href: "/admin/finance", icon: PlusCircle },
    { name: "Analytics & Reports", href: "/admin/reports", icon: FileText },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
    { name: "Communication Tools", href: "/admin/communication", icon: Bell },
  ]

  const NavLinks = () => (
    <>
      <ul className="space-y-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      {isAdmin && isAdminPage && (
        <>
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</h3>
          </div>
          <ul className="space-y-2">
            {adminNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </>
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <aside className="w-64 border-r bg-background p-4 hidden md:block">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-xl font-bold">
              UoE Market
            </Link>
          </div>
          <NavLinks />
          <div className="absolute bottom-4 w-56">
            <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:max-w-xs">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/" className="text-xl font-bold">
                    UoE Market
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <NavLinks />
                <div className="absolute bottom-4 w-56">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}

          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-xl">
              {pathname.startsWith("/admin")
                ? adminNavigation.find((item) => item.href === pathname)?.name || "Admin Dashboard"
                : navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

