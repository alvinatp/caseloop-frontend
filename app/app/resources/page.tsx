"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Filter, MapPin, Search, Star, Phone, Globe, Edit, Save, Plus } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useToast } from "../../../components/ui/use-toast"
import { useForm } from "react-hook-form"

import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Checkbox } from "../../../components/ui/checkbox"
import { Label } from "../../../components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../../../components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Textarea } from "../../../components/ui/textarea"
import { getResources, updateResourceDetails, getSavedResources, unsaveResource, saveResource, Resource as ResourceType, createResource } from "../../services/resources"
import { useAuth } from "../../context/AuthContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

// US zipcode validation regex
const ZIPCODE_REGEX = /^\d{5}(-\d{4})?$/

// Define the Resource interface
interface Resource {
  id: number;
  name: string;
  category: string;
  status: "AVAILABLE" | "LIMITED" | "UNAVAILABLE";
  contactDetails: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
  };
  zipcode: string;
  notes: any[];
  createdAt: string;
  lastUpdated: string;
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [zipcode, setZipcode] = useState("")
  const [zipcodeError, setZipcodeError] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [resources, setResources] = useState<ResourceType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // New Resource creation state
  const { toast } = useToast()
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false)
  const [creatingResource, setCreatingResource] = useState(false)
  const [newResource, setNewResource] = useState({
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
  const [createSuccess, setCreateSuccess] = useState("")
  const [createError, setCreateError] = useState("")

  // Initialize zipcode from URL parameters on mount
  useEffect(() => {
    const zipcodeParam = searchParams.get('zipcode')
    if (zipcodeParam && validateZipcode(zipcodeParam)) {
      setZipcode(zipcodeParam)
    }
  }, [searchParams])

  // Validate zipcode format
  const validateZipcode = (value: string) => {
    if (!value) {
      setZipcodeError(null)
      return true
    }
    if (!ZIPCODE_REGEX.test(value)) {
      setZipcodeError("Please enter a valid US zipcode (e.g., 12345 or 12345-6789)")
      return false
    }
    setZipcodeError(null)
    return true
  }

  // Handle zipcode change
  const handleZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setZipcode(value)
    validateZipcode(value)
  }

  // Extract fetchResources function
  const fetchResources = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching all resources with params:", { page: currentPage, category: selectedCategories[0] })
      
      const params: { zipcode?: string; category?: string; page?: number } = { 
        page: currentPage
      }
      
      // Only include zipcode in API params if it's provided and valid
      // This way we'll fetch all resources when no zipcode is entered
      if (zipcode && validateZipcode(zipcode)) {
        params.zipcode = zipcode
      }
      
      if (selectedCategories.length > 0) {
        params.category = selectedCategories[0] // API currently only supports one category
      }
      
      const data = await getResources(params)
      console.log("Resources API response:", data)
      
      if (data && data.resources) {
        setResources(data.resources)
        setTotalPages(data.totalPages || 1)
        console.log("Set resources:", data.resources.length, "items")
      } else {
        console.error("Unexpected API response format:", data)
        setError("Received invalid data format from server")
      }
    } catch (err: any) {
      console.error("Error details:", err?.response?.data || err)
      const errorMessage = err.response?.data?.errors?.[0]?.zipcode || "Failed to load resources. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fetch resources when the page loads or when filters change
  useEffect(() => {
    fetchResources()
  }, [zipcode, selectedCategories, currentPage])

  // Filter resources based on search and status
  const filteredResources = resources.filter((resource) => {
    // Search in name and contact details
    const searchableText = [
      resource.name,
      resource.category,
      resource.contactDetails?.address,
      resource.contactDetails?.phone,
      resource.contactDetails?.email,
      resource.contactDetails?.website
    ].filter(Boolean).join(' ').toLowerCase();
    
    const matchesSearch = searchQuery ? 
      searchableText.includes(searchQuery.toLowerCase()) : 
      true;

    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(resource.status);

    return matchesSearch && matchesStatus;
  })

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleStatusChange = (status: string) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  // Handle resource form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewResource(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Create new resource
  const handleCreateResource = async (event: React.FormEvent) => {
    event.preventDefault()
    setCreatingResource(true)
    
    try {
      // Prepare resource payload according to API expectations
      const resourcePayload = {
        name: newResource.name,
        category: newResource.category,
        status: newResource.status as "AVAILABLE" | "LIMITED" | "UNAVAILABLE",
        contactDetails: {
          address: newResource.address,
          phone: newResource.phone,
          email: newResource.email,
          website: newResource.website,
          description: newResource.description
        },
        zipcode: newResource.zipcode
      }
      
      await createResource(resourcePayload)
      setIsAddResourceOpen(false)
      setNewResource({
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
      // Refresh resources after creating a new one
      fetchResources()
      toast({
        title: "Resource created",
        description: "The resource has been successfully created",
      })
    } catch (error) {
      console.error("Failed to create resource:", error)
      toast({
        title: "Failed to create resource",
        description: "There was an error creating the resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreatingResource(false)
    }
  }

  // Update isAdmin check to be case-insensitive
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'
  
  // Debug user role
  console.log('User role:', user?.role)
  console.log('Is admin?', isAdmin)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#333333]">Find Resources</h1>
          <p className="text-[#555555] text-base">Search for resources by name, category, or location</p>
        </div>
        
        {/* Add Resource button visible to all authenticated users */}
        {user && (
          <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
            <DialogTrigger asChild>
              <button 
                className="ml-auto py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center transition-colors ease-in-out"
                type="button"
              >
                <Plus className="h-5 w-5 mr-2 stroke-[2.5]" />
                Add New Resource
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
                <DialogDescription>
                  Create a new resource to add to the directory.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateResource}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={newResource.name}
                      onChange={handleInputChange}
                      placeholder="Resource name"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category *
                    </Label>
                    <select
                      id="category"
                      name="category"
                      value={newResource.category}
                      onChange={handleInputChange}
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="zipcode" className="text-right">
                      Zipcode *
                    </Label>
                    <Input
                      id="zipcode"
                      name="zipcode"
                      value={newResource.zipcode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={newResource.address}
                      onChange={handleInputChange}
                      placeholder="123 Main St, City, State"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={newResource.phone}
                      onChange={handleInputChange}
                      placeholder="(123) 456-7890"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newResource.email}
                      onChange={handleInputChange}
                      placeholder="contact@example.com"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="website" className="text-right">
                      Website
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      value={newResource.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <select
                      id="status"
                      name="status"
                      value={newResource.status}
                      onChange={handleInputChange}
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="LIMITED">Limited</option>
                      <option value="UNAVAILABLE">Unavailable</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newResource.description}
                      onChange={handleInputChange}
                      placeholder="Describe this resource..."
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                </div>
                {createError && (
                  <p className="text-destructive text-sm mt-2">{createError}</p>
                )}
                {createSuccess && (
                  <p className="text-green-600 text-sm mt-2">{createSuccess}</p>
                )}
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddResourceOpen(false)}
                    disabled={creatingResource}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingResource}>
                    {creatingResource ? "Creating..." : "Create Resource"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#555555]" />
              <Input
                placeholder="Search resources..."
                className="pl-10 h-[48px] border-[#CCCCCC] focus:border-[#007BFF] focus:ring-[#007BFF]"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full sm:w-[180px]">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#555555]" />
              <Input
                placeholder="Zipcode"
                className={`pl-10 h-[48px] border-[#CCCCCC] focus:border-[#007BFF] focus:ring-[#007BFF] ${
                  zipcodeError ? 'border-red-500' : ''
                }`}
                value={zipcode}
                onChange={handleZipcodeChange}
              />
            </div>
            {zipcodeError && (
              <p className="text-sm text-red-500 mt-1">{zipcodeError}</p>
            )}
          </div>
          <div className="w-full sm:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto h-[48px] border-[#CCCCCC]">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Resources</SheetTitle>
                  <SheetDescription>Narrow down resources by category and availability</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Categories</h3>
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryChange(category)}
                          className="h-5 w-5 rounded border-[#CCCCCC] text-[#007BFF]"
                        />
                        <Label htmlFor={`category-${category}`} className="text-[#555555]">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Availability Status</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-available"
                        checked={statusFilter.includes("AVAILABLE")}
                        onCheckedChange={() => handleStatusChange("AVAILABLE")}
                        className="h-5 w-5 rounded border-[#CCCCCC] text-[#28A745]"
                      />
                      <Label htmlFor="status-available" className="text-[#555555]">
                        Available
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-limited"
                        checked={statusFilter.includes("LIMITED")}
                        onCheckedChange={() => handleStatusChange("LIMITED")}
                        className="h-5 w-5 rounded border-[#CCCCCC] text-[#FFC107]"
                      />
                      <Label htmlFor="status-limited" className="text-[#555555]">
                        Limited
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-unavailable"
                        checked={statusFilter.includes("UNAVAILABLE")}
                        onCheckedChange={() => handleStatusChange("UNAVAILABLE")}
                        className="h-5 w-5 rounded border-[#CCCCCC] text-[#DC3545]"
                      />
                      <Label htmlFor="status-unavailable" className="text-[#555555]">
                        Unavailable
                      </Label>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#666666]">{filteredResources.length} resources found</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-[#666666]">Loading resources...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* Zipcode Prompt */}
      {!zipcode && !loading && !error && filteredResources.length === 0 && (
        <div className="mb-4 text-center">
          <p className="text-[#666666] text-sm">Enter a zipcode to filter resources by location, or browse all available resources below</p>
        </div>
      )}

      {/* Resources List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  )
}

interface ResourceCardProps {
  resource: ResourceType
}

function ResourceCard({ resource }: ResourceCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editableDetails, setEditableDetails] = useState({
    name: resource.name,
    category: resource.category,
    status: resource.status,
    contactDetails: {
      ...resource.contactDetails,
      description: resource.contactDetails?.description || ""
    }
  })

  // Check if resource is saved on mount
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const savedResources = await getSavedResources();
        setIsSaved(savedResources.some(r => r.id === resource.id));
      } catch (err) {
        console.error('Error checking saved status:', err);
      }
    };
    checkSavedStatus();
  }, [resource.id]);

  const handleSaveToggle = async () => {
    try {
      setIsSaving(true);
      if (isSaved) {
        await unsaveResource(resource.id);
        setIsSaved(false);
      } else {
        await saveResource(resource.id);
        setIsSaved(true);
      }
    } catch (err: any) {
      console.error('Error toggling save:', err);
      setError(err.response?.data?.message || 'Failed to update save status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof ResourceType['contactDetails']) => {
    setEditableDetails({
      ...editableDetails,
      contactDetails: {
        ...editableDetails.contactDetails,
        [field]: e.target.value
      }
    })
  }

  // Map backend uppercase status values to frontend lowercase values
  const normalizedStatus = resource.status.toLowerCase() as 'available' | 'limited' | 'unavailable';
  
  const statusColors = {
    available: "text-[#28A745] bg-[#28A74510]",
    limited: "text-[#FFC107] bg-[#FFC10710]",
    unavailable: "text-[#DC3545] bg-[#DC354510]",
  }

  const statusText = {
    available: "Available",
    limited: "Limited Availability",
    unavailable: "Unavailable",
  }
  
  // Format date or use fallback
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    
    try {
      // Check if it's already in a readable format
      if (dateString.includes('ago') || dateString.includes('day') || dateString.includes('hour')) {
        return dateString;
      }
      
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;
      
      // Format date as MM/DD/YYYY
      return new Intl.DateTimeFormat('en-US').format(date);
    } catch (e) {
      return dateString;
    }
  }

  // Extract contact info if available
  const contactDetails = resource.contactDetails || {};
  const address = contactDetails.address || "";
  const phone = contactDetails.phone || "";
  const email = contactDetails.email || "";
  const website = contactDetails.website || "";

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await updateResourceDetails(resource.id, {
        contactDetails: editableDetails.contactDetails
      })
      setIsEditing(false)
      // Refresh the page to get updated data
      window.location.reload()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="flex flex-col h-full border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg font-bold text-[#333333] truncate">{resource.name}</CardTitle>
            <CardDescription className="text-sm text-[#666666] truncate">{resource.category}</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusColors[normalizedStatus]}`}>
              {statusText[normalizedStatus]}
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4 text-[#666666] hover:text-[#007BFF]" />
                  <span className="sr-only">Edit resource</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Resource</DialogTitle>
                  <DialogDescription>
                    Make changes to the resource details below.
                  </DialogDescription>
                </DialogHeader>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editableDetails.contactDetails.description}
                      onChange={(e) => handleInputChange(e, 'description')}
                      placeholder="Enter a description of the resource..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={editableDetails.contactDetails.address || ""}
                      onChange={(e) => handleInputChange(e, 'address')}
                      placeholder="Enter address..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={editableDetails.contactDetails.phone || ""}
                      onChange={(e) => handleInputChange(e, 'phone')}
                      placeholder="Enter phone number..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={editableDetails.contactDetails.email || ""}
                      onChange={(e) => handleInputChange(e, 'email')}
                      placeholder="Enter email..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={editableDetails.contactDetails.website || ""}
                      onChange={(e) => handleInputChange(e, 'website')}
                      placeholder="Enter website URL..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleSaveToggle}
              disabled={isSaving}
            >
              <Star 
                className={`h-4 w-4 ${
                  isSaved ? 'text-[#FFC107] fill-current' : 'text-[#CCCCCC]'
                } hover:text-[#FFC107]`} 
              />
              <span className="sr-only">{isSaved ? 'Unsave' : 'Save'} resource</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0">
        {resource.notes && resource.notes.length > 0 && (
          <p className="text-sm text-[#555555] mb-3 line-clamp-2">
            {typeof resource.notes[0] === 'string' 
              ? resource.notes[0] 
              : resource.notes[0]?.content || ''}
          </p>
        )}
        
        <div className="space-y-2 text-sm">
          {address && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 text-[#666666] mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-[#555555] line-clamp-2">{address}</span>
            </div>
          )}
          
          {phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-[#666666] mr-2 flex-shrink-0" />
              <span className="text-[#555555] truncate">{phone}</span>
            </div>
          )}
          
          {website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 text-[#666666] mr-2 flex-shrink-0" />
              <a href={website.startsWith('http') ? website : `https://${website}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-[#007BFF] hover:underline truncate">
                {website}
              </a>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 flex justify-between items-center gap-4 border-t border-[#EEEEEE]">
        <div className="text-xs text-[#999999] truncate">
          Updated {formatDate(resource.lastUpdated)}
        </div>
        <Button variant="outline" size="sm" className="text-xs h-8 whitespace-nowrap flex-shrink-0" asChild>
          <Link href={`/app/resources/${resource.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Categories for filtering
const categories = [
  "housing",
  "food",
  "healthcare",
  "employment",
  "legal",
  "transportation",
  "childcare",
  "substance-abuse"
]