"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, User, LogOut, MessageSquare, Bell, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useMobile } from "@/hooks/use-mobile"
// Update the imports to include our new components
import NotificationDropdown from "@/components/notification-dropdown"
import MobileNav from "@/components/mobile-nav"
import Image from "next/image"

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  const closeSheet = () => setIsOpen(false)

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Categories", href: "/categories" },
    { name: "Community", href: "/community" },
    { name: "About", href: "/about" },
  ]

  const userNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: User },
    { name: "My Services", href: "/my-services", icon: User, providerOnly: true },
    { name: "Bookings", href: "/bookings", icon: User },
    { name: "Messages", href: "/messages", icon: MessageSquare, badge: true },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    const nameParts = name.split(" ")
    let initials = ""
    for (let i = 0; i < nameParts.length; i++) {
      initials += nameParts[i].charAt(0).toUpperCase()
    }
    return initials
  }

  return (
    // Add the new components to the header
    // 1. Add MobileNav component at the beginning of the header:
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="text-xl font-bold">UoE Marketplace</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {!isMobile && (
                <>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/messages">
                      <MessageSquare className="h-5 w-5" />
                      <span className="sr-only">Messages</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/notifications">
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">Notifications</span>
                    </Link>
                  </Button>
                </>
              )}

              {/* 2. Add NotificationDropdown before the user menu: */}
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.name || ""} />
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {userNavigation
                    .filter((item) => !item.providerOnly || user?.role === "provider")
                    .map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && <Badge className="ml-2">3</Badge>}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeSheet}
                      className={`text-base font-medium transition-colors hover:text-primary ${
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-4" />
                  {isAuthenticated ? (
                    <>
                      {userNavigation
                        .filter((item) => !item.providerOnly || user?.role === "provider")
                        .map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={closeSheet}
                            className="flex items-center justify-between text-base font-medium transition-colors hover:text-primary"
                          >
                            <div className="flex items-center">
                              <item.icon className="mr-2 h-4 w-4" />
                              <span>{item.name}</span>
                            </div>
                            {item.badge && <Badge>3</Badge>}
                          </Link>
                        ))}
                      {user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={closeSheet}
                          className="flex items-center text-base font-medium transition-colors hover:text-primary"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout()
                          closeSheet()
                        }}
                        className="flex items-center text-base font-medium transition-colors hover:text-primary"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button asChild>
                        <Link href="/login" onClick={closeSheet}>
                          Log in
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/signup" onClick={closeSheet}>
                          Sign up
                        </Link>
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

