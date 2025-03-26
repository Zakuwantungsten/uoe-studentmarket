"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Search, ShoppingBag, Calendar, MessageSquare, User, Settings, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"

export default function MobileNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/search",
      label: "Search",
      icon: Search,
      active: pathname === "/search",
    },
    {
      href: "/services",
      label: "Services",
      icon: ShoppingBag,
      active: pathname.startsWith("/services"),
    },
    {
      href: "/categories",
      label: "Categories",
      icon: ShoppingBag,
      active: pathname.startsWith("/categories"),
    },
  ]

  const authenticatedRoutes = [
    {
      href: "/bookings",
      label: "My Bookings",
      icon: Calendar,
      active: pathname.startsWith("/bookings"),
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageSquare,
      active: pathname.startsWith("/messages"),
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      active: pathname.startsWith("/profile"),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ]

  const providerRoutes = [
    {
      href: "/provider-dashboard",
      label: "Provider Dashboard",
      icon: ShoppingBag,
      active: pathname.startsWith("/provider-dashboard"),
    },
    {
      href: "/my-services",
      label: "My Services",
      icon: ShoppingBag,
      active: pathname.startsWith("/my-services"),
    },
  ]

  const adminRoutes = [
    {
      href: "/admin",
      label: "Admin Dashboard",
      icon: ShoppingBag,
      active: pathname.startsWith("/admin"),
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>University of Eldoret</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                asChild
                variant={route.active ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setOpen(false)}
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-5 w-5" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>

          {user && (
            <>
              <Separator />
              <div className="space-y-1">
                {authenticatedRoutes.map((route) => (
                  <Button
                    key={route.href}
                    asChild
                    variant={route.active ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setOpen(false)}
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-5 w-5" />
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </>
          )}

          {user && user.role === "provider" && (
            <>
              <Separator />
              <div className="space-y-1">
                {providerRoutes.map((route) => (
                  <Button
                    key={route.href}
                    asChild
                    variant={route.active ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setOpen(false)}
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-5 w-5" />
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </>
          )}

          {user && user.role === "admin" && (
            <>
              <Separator />
              <div className="space-y-1">
                {adminRoutes.map((route) => (
                  <Button
                    key={route.href}
                    asChild
                    variant={route.active ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setOpen(false)}
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-5 w-5" />
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </>
          )}

          {user ? (
            <>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Separator />
              <div className="space-y-1">
                <Button asChild variant="default" className="w-full" onClick={() => setOpen(false)}>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

