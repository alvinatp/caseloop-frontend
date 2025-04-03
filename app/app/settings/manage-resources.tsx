"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { useAuth } from "../../context/AuthContext"
import * as resourceService from "../../services/resources"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { Loader2 } from "lucide-react"

export default function ManageResources() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("manual")
  
  // Manual resource creation state
  const [resource, setResource] = useState({
    name: "",
    category: "",
    zipcode: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    status: "AVAILABLE"
  })
  
  // HTML parsing state
  const [htmlContent, setHtmlContent] = useState("")
  const [category, setCategory] = useState("")
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Redirect non-admin users
  if (user && user.role !== "ADMIN") {
    return (
      <div className="p-6">
        <Alert className="bg-red-50">
          <AlertDescription>
            Sorry, this page is only accessible to administrators.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  const handleResourceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setResource(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setResource(prev => ({ ...prev, [name]: value }))
  }
  
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    try {
      // Validate required fields
      if (!resource.name || !resource.category || !resource.zipcode) {
        setError("Name, category, and zipcode are required")
        setLoading(false)
        return
      }
      
      // Prepare contact details
      const contactDetails = {
        address: resource.address || "",
        phone: resource.phone || "",
        email: resource.email || "",
        website: resource.website || "",
        description: resource.description || ""
      }
      
      // Create resource
      const result = await resourceService.createResource({
        name: resource.name,
        category: resource.category,
        status: resource.status as any,
        contactDetails,
        zipcode: resource.zipcode
      })
      
      setSuccess("Resource created successfully!")
      
      // Reset form
      setResource({
        name: "",
        category: "",
        zipcode: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        description: "",
        status: "AVAILABLE"
      })
    } catch (err: any) {
      console.error("Error creating resource:", err)
      setError(err.response?.data?.message || "Failed to create resource")
    } finally {
      setLoading(false)
    }
  }
  
  const handleHtmlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    
    try {
      // Validate required fields
      if (!htmlContent) {
        setError("HTML content is required")
        setLoading(false)
        return
      }
      
      // Create resources from HTML
      const result = await resourceService.createResourcesFromHtml(htmlContent, category)
      
      setSuccess(`Resources created successfully!`)
      
      // Reset form
      setHtmlContent("")
      setCategory("")
    } catch (err: any) {
      console.error("Error creating resources from HTML:", err)
      setError(err.response?.data?.message || "Failed to create resources from HTML")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Resources</h1>
      
      <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="html">HTML Parser</TabsTrigger>
        </TabsList>
        
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Add New Resource</CardTitle>
              <CardDescription>
                Enter details to add a new resource to the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Resource Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={resource.name}
                    onChange={handleResourceChange}
                    placeholder="Food Bank of Example County"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    name="category"
                    value={resource.category}
                    onChange={handleResourceChange}
                    placeholder="Food & Nutrition"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    name="status" 
                    value={resource.status} 
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="LIMITED">Limited</SelectItem>
                      <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipcode">Zipcode *</Label>
                  <Input
                    id="zipcode"
                    name="zipcode"
                    value={resource.zipcode}
                    onChange={handleResourceChange}
                    placeholder="12345"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={resource.address}
                    onChange={handleResourceChange}
                    placeholder="123 Main St, Anytown, CA 12345"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={resource.description}
                    onChange={handleResourceChange}
                    placeholder="Describe the services provided by this resource..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={resource.phone}
                      onChange={handleResourceChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={resource.email}
                      onChange={handleResourceChange}
                      placeholder="contact@example.org"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={resource.website}
                    onChange={handleResourceChange}
                    placeholder="https://example.org"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Resource"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="html">
          <Card>
            <CardHeader>
              <CardTitle>Parse Resources from HTML</CardTitle>
              <CardDescription>
                Paste HTML content containing resource information to bulk import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleHtmlSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-html">Default Category (optional)</Label>
                  <Input
                    id="category-html"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Food & Nutrition"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="html-content">HTML Content *</Label>
                  <Textarea
                    id="html-content"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="Paste HTML content here..."
                    className="min-h-[300px] font-mono text-sm"
                    required
                  />
                </div>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <p className="font-semibold">Expected HTML Structure:</p>
                  <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
{`<div class="org-block">
  <h3>Organization Name</h3>
  <p class="address">123 Main St, Anytown, CA 12345</p>
  <span class="phone">(555) 123-4567</span>
  <span class="website">https://example.org</span>
  <span class="category">Food & Nutrition</span>
</div>`}
                  </pre>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    "Parse and Create Resources"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 