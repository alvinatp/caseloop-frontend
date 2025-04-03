"use client"

import { useAuth } from "../../context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Database, UserCog, FileImport } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Username:</strong> {user?.username}
              </p>
              <p className="text-sm">
                <strong>Full Name:</strong> {user?.fullName || "Not set"}
              </p>
              <p className="text-sm">
                <strong>Role:</strong> {user?.role}
              </p>
            </div>
            
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/app/settings/profile">
                <UserCog className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
              <CardDescription>Manage application resources and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  As an administrator, you have access to additional tools for managing resources and system settings.
                </p>
              </div>
              
              <div className="mt-4 space-y-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/app/settings/manage-resources">
                    <Database className="w-4 h-4 mr-2" />
                    Manage Resources
                  </Link>
                </Button>
                
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/app/settings/scraper">
                    <FileImport className="w-4 h-4 mr-2" />
                    Resource Scraper
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

