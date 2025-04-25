'use client'

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Database, Home, LogOut, Menu, Search, Settings, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "../context/AuthContext"
import ProtectedRoute from "../components/ProtectedRoute"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  // Get user initials for the avatar
  const getInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return user.fullName.slice(0, 2).toUpperCase();
    }
    return user?.username?.slice(0, 2).toUpperCase() || 'CM';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="w-full bg-white border-b shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-[#F5F5F5] p-0">
                  <div className="flex flex-col h-full py-4">
                    <div className="px-4 mb-6 flex items-center justify-between">
                      <Link href="/app" className="flex-grow flex justify-center">
                        <Image 
                          src="/caseloop-logo.png" 
                          alt="CaseSync Logo" 
                          width={80} 
                          height={20} 
                          priority
                        />
                      </Link>
                    </div>
                    <nav className="flex-1 px-2 space-y-2">
                      <Link
                        href="/app"
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-[#333333] hover:bg-blue-50 hover:text-[#007BFF]"
                      >
                        <Home className="h-6 w-6" />
                        <span className="font-medium">Home</span>
                      </Link>
                      <Link
                        href="/app/resources"
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-[#333333] hover:bg-blue-50 hover:text-[#007BFF]"
                      >
                        <Search className="h-6 w-6" />
                        <span className="font-medium">Resources</span>
                      </Link>
                      <Link
                        href="/app/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-[#333333] hover:bg-blue-50 hover:text-[#007BFF]"
                      >
                        <Settings className="h-6 w-6" />
                        <span className="font-medium">Settings</span>
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <div className="flex-1 flex items-center justify-center md:justify-start">
              <Link href="/app" className="hidden md:block">
                <Image 
                  src="/caseloop-logo.png" 
                  alt="CaseSync Logo" 
                  width={80} 
                  height={20} 
                  priority
                />
              </Link>
            </div>

            {/* Right Side Items */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-sm">
                  <div className="font-medium">{user?.fullName || user?.username}</div>
                  <div className="text-xs text-muted-foreground">{user?.role}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex md:w-[250px] md:flex-col bg-[#F5F5F5] border-r">
            <div className="flex flex-col h-full py-4">
              <nav className="flex-1 px-2 space-y-2">
                <Link
                  href="/app"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-[#333333] hover:bg-blue-50 hover:text-[#007BFF]"
                >
                  <Home className="h-6 w-6" />
                  <span className="font-medium">Home</span>
                </Link>
                <Link
                  href="/app/resources"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-[#333333] hover:bg-blue-50 hover:text-[#007BFF]"
                >
                  <Search className="h-6 w-6" />
                  <span className="font-medium">Resources</span>
                </Link>
                <Link
                  href="/app/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-[#333333] hover:bg-blue-50 hover:text-[#007BFF]"
                >
                  <Settings className="h-6 w-6" />
                  <span className="font-medium">Settings</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Page Content - using the same max width constraint as header */}
          <div className="flex-1 bg-[#F5F5F5] overflow-hidden">
            <main className="mx-auto w-full max-w-screen-2xl p-3 sm:p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

