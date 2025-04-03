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
        <header className="h-[60px] bg-white border-b shadow-sm flex items-center px-4 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] bg-[#F5F5F5] p-0">
                  <div className="flex flex-col h-full py-4">
                    <div className="px-4 mb-6 flex items-center justify-between">
                      <Link href="/app" className="flex-grow flex justify-center">
                        <Image 
                          src="/casesync-logo.png" 
                          alt="CaseSync Logo" 
                          width={120} 
                          height={28} 
                          priority
                        />
                      </Link>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <X className="h-5 w-5" />
                        </Button>
                      </SheetTrigger>
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
                      
                      {isAdmin && (
                        <Link
                          href="/app/settings/manage-resources"
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-[#333333] hover:bg-blue-50 hover:text-[#007BFF]"
                        >
                          <Database className="h-6 w-6" />
                          <span className="font-medium">Manage Resources</span>
                        </Link>
                      )}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex-1 flex justify-center">
              <Image 
                src="/casesync-logo.png" 
                alt="CaseSync Logo" 
                width={110} 
                height={28} 
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-sm">
                  <div className="font-medium">{user?.fullName || user?.username}</div>
                  <div className="text-xs text-muted-foreground">{user?.role}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </div>
        </header>

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
                
                {isAdmin && (
                  <Link
                    href="/app/settings/manage-resources"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-[#333333] hover:bg-blue-50 hover:text-[#007BFF]"
                  >
                    <Database className="h-6 w-6" />
                    <span className="font-medium">Manage Resources</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 bg-[#F5F5F5] p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

