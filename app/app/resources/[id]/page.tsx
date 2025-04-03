"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Edit, MapPin, Phone, Save, Star, Globe, Info, CalendarDays, List } from "lucide-react"
import { format, parseISO } from 'date-fns'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/app/context/AuthContext"
import { getResourceById, updateResourceDetails, addResourceNote, saveResource, unsaveResource, getSavedResources, Resource } from "@/app/services/resources"

// Helper function to format date
const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy')
  } catch (e) {
    console.error('Error formatting date:', e)
    return dateString
  }
}

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const resourceId = params.id

  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for Update Status form
  const [updateStatus, setUpdateStatus] = useState<Resource['status']>('AVAILABLE')
  const [updateNote, setUpdateNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestRemoval, setSuggestRemoval] = useState(false)

  // State for Add Note form
  const [newNote, setNewNote] = useState("")
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  // State for Editing Details
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [editableContactDetails, setEditableContactDetails] = useState<Resource['contactDetails']>({})
  const [editableServices, setEditableServices] = useState<string[]>([])
  const [editableEligibility, setEditableEligibility] = useState<string[]>([])
  const [editableHours, setEditableHours] = useState<Array<{day: string, hours: string}>>([])
  const [newService, setNewService] = useState("")
  const [newEligibility, setNewEligibility] = useState("")
  const [newHourDay, setNewHourDay] = useState("")
  const [newHourTime, setNewHourTime] = useState("")
  const [isSavingDetails, setIsSavingDetails] = useState(false)

  // State for quick edit modal
  const [isEditingDialog, setIsEditingDialog] = useState(false)
  const [editableDetailsDialog, setEditableDetailsDialog] = useState<{
    contactDetails: Resource['contactDetails']
  }>({
    contactDetails: {}
  })
  const [isDialogSaving, setIsDialogSaving] = useState(false)

  // Success/error message state
  const [successMessage, setSuccessMessage] = useState("")

  // Add save state
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch resource data
  const fetchResource = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getResourceById(resourceId)
      setResource(data)
      setUpdateStatus(data.status)
      
      // Set up editable contact details
      const contactDetails = data.contactDetails || {}
      setEditableContactDetails(contactDetails)
      
      // Initialize service, eligibility and hours arrays from contact details
      setEditableServices(contactDetails.services || [])
      setEditableEligibility(contactDetails.eligibility || [])
      setEditableHours(contactDetails.hours || [])
      
      // Initialize dialog edit state
      setEditableDetailsDialog({
        contactDetails: { ...contactDetails }
      })
      
      // Check if this resource is saved
      try {
        const savedResources = await getSavedResources()
        setIsSaved(savedResources.some(r => r.id === parseInt(resourceId)))
      } catch (err) {
        console.error('Error checking saved status:', err)
      }
    } catch (err) {
      setError("Failed to load resource details")
      console.error("Error fetching resource:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResource()
  }, [resourceId])

  // Handle Status Update
  const handleSubmitUpdate = async () => {
    if (!resource) return;

    setIsSubmitting(true);
    try {
      const updatePayload = {
        status: updateStatus,
        suggest_removal: suggestRemoval
      };

      await updateResourceDetails(resourceId, updatePayload);

      // If a note was added with the status change, add it separately
      if (updateNote.trim()) {
        await addResourceNote(resourceId, { content: updateNote.trim() });
      }

      setUpdateNote("");
      setSuggestRemoval(false);
      setSuccessMessage("Resource status updated successfully!");
      await fetchResource();
    } catch (err) {
      setError("Failed to update resource status");
      console.error("Error updating resource status:", err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }

  // Handle Adding Standalone Note
  const handleSubmitNote = async () => {
    if (!newNote.trim() || !resource) return;

    setIsSubmittingNote(true);
    try {
      await addResourceNote(resourceId, { content: newNote.trim() });
      setNewNote("");
      setSuccessMessage("Note added successfully!");
      await fetchResource();
    } catch (err) {
      setError("Failed to add note");
      console.error("Error adding note:", err);
    } finally {
      setIsSubmittingNote(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }

  // Handle Editing Details
  const handleDetailChange = (field: keyof Resource['contactDetails'], value: any) => {
    setEditableContactDetails(prev => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    if (newService.trim()) {
      setEditableServices(prev => [...prev, newService.trim()]);
      handleDetailChange('services', [...editableServices, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    const newServices = editableServices.filter((_, i) => i !== index);
    setEditableServices(newServices);
    handleDetailChange('services', newServices);
  };

  const addEligibility = () => {
    if (newEligibility.trim()) {
      setEditableEligibility(prev => [...prev, newEligibility.trim()]);
      handleDetailChange('eligibility', [...editableEligibility, newEligibility.trim()]);
      setNewEligibility("");
    }
  };

  const removeEligibility = (index: number) => {
    const newEligibility = editableEligibility.filter((_, i) => i !== index);
    setEditableEligibility(newEligibility);
    handleDetailChange('eligibility', newEligibility);
  };

  const addHour = () => {
    if (newHourDay.trim() && newHourTime.trim()) {
      const newHour = { day: newHourDay.trim(), hours: newHourTime.trim() };
      setEditableHours(prev => [...prev, newHour]);
      handleDetailChange('hours', [...editableHours, newHour]);
      setNewHourDay("");
      setNewHourTime("");
    }
  };

  const removeHour = (index: number) => {
    const newHours = editableHours.filter((_, i) => i !== index);
    setEditableHours(newHours);
    handleDetailChange('hours', newHours);
  };

  // Handle Saving Edited Details
  const handleSaveDetails = async () => {
    if (!resource) return;
    setIsSavingDetails(true);
    try {
      await updateResourceDetails(resourceId, {
        contactDetails: editableContactDetails
      });
      setIsEditingDetails(false);
      setSuccessMessage("Resource details updated successfully!");
      await fetchResource();
    } catch (err) {
      setError("Failed to save resource details");
      console.error("Error saving details:", err);
    } finally {
      setIsSavingDetails(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Handle saving/unsaving resource
  const handleSaveToggle = async () => {
    if (!resource) return;
    
    try {
      setIsSaving(true)
      if (isSaved) {
        await unsaveResource(resourceId)
        setIsSaved(false)
        setSuccessMessage("Resource removed from saved list")
      } else {
        await saveResource(resourceId)
        setIsSaved(true)
        setSuccessMessage("Resource saved successfully")
      }
    } catch (err) {
      setError("Failed to update saved status")
      console.error("Error toggling save:", err)
    } finally {
      setIsSaving(false)
      setTimeout(() => setSuccessMessage(""), 3000)
    }
  }

  // Add this handler function before the return statement
  const handleStatusChange = (value: string) => {
    if (value === 'AVAILABLE' || value === 'LIMITED' || value === 'UNAVAILABLE') {
      setUpdateStatus(value);
    }
  };

  // Handle input change for the dialog edit
  const handleDialogInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Resource['contactDetails']) => {
    setEditableDetailsDialog({
      ...editableDetailsDialog,
      contactDetails: {
        ...editableDetailsDialog.contactDetails,
        [field]: e.target.value
      }
    });
  };

  // Handle save for the dialog edit
  const handleDialogSave = async () => {
    if (!resource) return;
    setIsDialogSaving(true);
    setError(null);
    try {
      await updateResourceDetails(resourceId, {
        contactDetails: editableDetailsDialog.contactDetails
      });
      setIsEditingDialog(false);
      setSuccessMessage("Resource details updated successfully!");
      await fetchResource();
    } catch (err) {
      setError("Failed to save resource details");
      console.error("Error saving details:", err);
    } finally {
      setIsDialogSaving(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-[#555555]">Loading resource details...</p>
        </div>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold text-[#333333]">Resource not found</h1>
          <p className="text-[#555555] mt-2">The resource you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4 bg-[#007BFF] hover:bg-[#0056D2]" asChild>
            <Link href="/app/resources">Back to Resources</Link>
          </Button>
        </div>
      </div>
    )
  }

  const statusColors: Record<Resource['status'], string> = {
    AVAILABLE: "text-[#28A745] bg-[#28A74510]",
    LIMITED: "text-[#FFC107] bg-[#FFC10710]",
    UNAVAILABLE: "text-[#DC3545] bg-[#DC354510]"
  }

  const statusText: Record<Resource['status'], string> = {
    AVAILABLE: "Available",
    LIMITED: "Limited Availability",
    UNAVAILABLE: "Unavailable"
  }

  const currentContactDetails = resource.contactDetails || {};
  const currentNotes = Array.isArray(resource.notes) ? resource.notes : [];

  return (
    <div className="p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/app/resources" className="flex items-center text-[#555555]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </Link>
        </Button>
      </div>

      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Resource Header Card */}
          <Card className="border border-[#E0E0E0] shadow-sm">
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-[#333333]">{resource.name}</CardTitle>
                  <CardDescription className="text-[#666666]">{resource.category}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={isEditingDialog} onOpenChange={setIsEditingDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-[#007BFF] text-[#007BFF] hover:bg-blue-50"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
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
                            value={editableDetailsDialog.contactDetails.description || ""}
                            onChange={(e) => handleDialogInputChange(e, 'description')}
                            placeholder="Enter a description of the resource..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <Input
                            value={editableDetailsDialog.contactDetails.address || ""}
                            onChange={(e) => handleDialogInputChange(e, 'address')}
                            placeholder="Enter address..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={editableDetailsDialog.contactDetails.phone || ""}
                            onChange={(e) => handleDialogInputChange(e, 'phone')}
                            placeholder="Enter phone number..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            value={editableDetailsDialog.contactDetails.email || ""}
                            onChange={(e) => handleDialogInputChange(e, 'email')}
                            placeholder="Enter email..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Website</Label>
                          <Input
                            value={editableDetailsDialog.contactDetails.website || ""}
                            onChange={(e) => handleDialogInputChange(e, 'website')}
                            placeholder="Enter website URL..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsEditingDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleDialogSave} disabled={isDialogSaving}>
                          {isDialogSaving ? (
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
                    onClick={handleSaveToggle}
                    disabled={isSaving}
                  >
                    <Star className={`h-5 w-5 ${isSaved ? 'text-[#FFC107] fill-current' : 'text-[#CCCCCC]'} hover:text-[#FFC107]`} />
                    <span className="sr-only">{isSaved ? 'Unsave' : 'Save'} resource</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[resource.status]}`}>
                  {statusText[resource.status]}
                </span>
              </div>
              <p className="text-[#555555] mb-4">{currentContactDetails.description || 'No description available.'}</p>
              <div className="grid gap-3 mt-4 text-sm">
                {currentContactDetails.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#666666]" />
                    <span className="text-[#555555]">{currentContactDetails.address}</span>
                  </div>
                )}
                {currentContactDetails.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#666666]" />
                    <span className="text-[#555555]">{currentContactDetails.phone}</span>
                  </div>
                )}
                {currentContactDetails.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#666666]" />
                    <a 
                      href={currentContactDetails.website.startsWith('http') ? currentContactDetails.website : `https://${currentContactDetails.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#007BFF] hover:underline"
                    >
                      {currentContactDetails.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#666666]" />
                  <span className="text-[#555555]">Last updated {formatDate(resource.lastUpdated)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="notes">
            <TabsList className="border-b">
              <TabsTrigger
                value="notes"
                className="text-[#555555] data-[state=active]:text-[#007BFF] data-[state=active]:border-b-2 data-[state=active]:border-[#007BFF]"
              >
                Case Manager Notes
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="text-[#555555] data-[state=active]:text-[#007BFF] data-[state=active]:border-b-2 data-[state=active]:border-[#007BFF]"
              >
                Additional Details
              </TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="mt-4">
              <Card className="border border-[#E0E0E0] shadow-sm">
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-lg font-bold text-[#333333]">Resource Updates</CardTitle>
                  <CardDescription className="text-[#666666]">
                    Recent updates and notes about this resource
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-3">

                  {/* Add Note Form - Always visible for easier commenting */}
                  <div className="mb-6 border-b pb-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10 mt-1">
                        <AvatarFallback>{user?.fullName ? user.fullName.charAt(0) : user?.username?.charAt(0) || 'CM'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder={`Comment as ${user?.fullName || user?.username || 'Case Manager'}...`}
                          className="mb-4 min-h-[40px] border-b border-l-0 border-r-0 border-t-0 rounded-none focus:ring-0 border-[#E0E0E0] hover:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#007BFF] resize-none px-3 placeholder:text-gray-500 text-[15px] pt-2 pb-1 rounded-md"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          onFocus={(e) => {
                            // Increase height a bit when focused
                            e.currentTarget.style.minHeight = '80px';
                          }}
                          onBlur={(e) => {
                            // Reset height when not focused and empty
                            if (!e.currentTarget.value) {
                              e.currentTarget.style.minHeight = '40px';
                            }
                          }}
                        />
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            className="mr-2"
                            onClick={() => setNewNote("")}
                            disabled={!newNote.trim() || isSubmittingNote}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-[#007BFF] hover:bg-[#0056D2]"
                            onClick={handleSubmitNote}
                            disabled={isSubmittingNote || !newNote.trim()}
                          >
                            {isSubmittingNote ? (
                              <>
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                                Submitting...
                              </>
                            ) : (
                              "Comment"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-medium text-[#333333] mb-4">Comments ({currentNotes.length})</h3>
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                    {currentNotes.length > 0 ? (
                      currentNotes.map((note, index) => (
                        <div key={index} className="flex gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{note.username ? note.username.charAt(0) : 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-[#333333]">{note.username || 'User'}</span>
                              <span className="text-xs text-[#999999]">{note.timestamp ? formatDate(note.timestamp) : 'Unknown'}</span>
                            </div>
                            <p className="text-sm text-[#555555]">{note.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">No comments yet. Be the first to add a note about this resource.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <Card className="border border-[#E0E0E0] shadow-sm">
                <CardHeader className="p-6 pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-bold text-[#333333]">Resource Details</CardTitle>
                      <CardDescription className="text-[#666666]">
                        Last updated: {formatDate(resource.lastUpdated)}
                      </CardDescription>
                    </div>
                    {isEditingDetails ? (
                      <Button 
                        className="bg-[#28A745] hover:bg-[#218838]" 
                        onClick={handleSaveDetails}
                        disabled={isSavingDetails}
                      >
                        {isSavingDetails ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-[#007BFF] text-[#007BFF] hover:bg-blue-50"
                        onClick={() => setIsEditingDetails(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-3">
                  <div className="space-y-6">
                    {/* Services Section */}
                    <div>
                      <h3 className="font-medium text-[#333333] mb-2">Services Offered</h3>
                      {isEditingDetails ? (
                        <div className="space-y-3">
                          <ul className="space-y-2">
                            {editableServices.map((service, index) => (
                              <li key={index} className="flex items-center justify-between">
                                <span className="text-[#555555]">{service}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#DC3545] hover:text-[#C82333] h-6 px-2"
                                  onClick={() => removeService(index)}
                                >
                                  Remove
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add new service"
                              value={newService}
                              onChange={(e) => setNewService(e.target.value)}
                              className="border-[#CCCCCC]"
                            />
                            <Button
                              onClick={addService}
                              disabled={!newService.trim()}
                              className="bg-[#007BFF] hover:bg-[#0056D2]"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <ul className="mt-2 list-disc list-inside text-[#555555]">
                          {editableServices.length > 0 ? (
                            editableServices.map((service, index) => (
                              <li key={index}>{service}</li>
                            ))
                          ) : (
                            <li className="text-gray-500">No services listed</li>
                          )}
                        </ul>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {/* Eligibility Section */}
                    <div>
                      <h3 className="font-medium text-[#333333] mb-2">Eligibility Requirements</h3>
                      {isEditingDetails ? (
                        <div className="space-y-3">
                          <ul className="space-y-2">
                            {editableEligibility.map((item, index) => (
                              <li key={index} className="flex items-center justify-between">
                                <span className="text-[#555555]">{item}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#DC3545] hover:text-[#C82333] h-6 px-2"
                                  onClick={() => removeEligibility(index)}
                                >
                                  Remove
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add new eligibility requirement"
                              value={newEligibility}
                              onChange={(e) => setNewEligibility(e.target.value)}
                              className="border-[#CCCCCC]"
                            />
                            <Button
                              onClick={addEligibility}
                              disabled={!newEligibility.trim()}
                              className="bg-[#007BFF] hover:bg-[#0056D2]"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <ul className="mt-2 list-disc list-inside text-[#555555]">
                          {editableEligibility.length > 0 ? (
                            editableEligibility.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))
                          ) : (
                            <li className="text-gray-500">No eligibility requirements listed</li>
                          )}
                        </ul>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {/* Hours Section */}
                    <div>
                      <h3 className="font-medium text-[#333333] mb-2">Hours of Operation</h3>
                      {isEditingDetails ? (
                        <div className="space-y-3">
                          <div className="space-y-3">
                            {editableHours.map((item, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  value={item.day}
                                  placeholder="Day"
                                  onChange={(e) => {
                                    const updatedHours = [...editableHours];
                                    updatedHours[index] = { ...item, day: e.target.value };
                                    setEditableHours(updatedHours);
                                    handleDetailChange('hours', updatedHours);
                                  }}
                                  className="border-[#CCCCCC] flex-1"
                                />
                                <Input
                                  value={item.hours}
                                  placeholder="Hours"
                                  onChange={(e) => {
                                    const updatedHours = [...editableHours];
                                    updatedHours[index] = { ...item, hours: e.target.value };
                                    setEditableHours(updatedHours);
                                    handleDetailChange('hours', updatedHours);
                                  }}
                                  className="border-[#CCCCCC] flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#DC3545] hover:text-[#C82333] h-9 px-2"
                                  onClick={() => removeHour(index)}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Day (e.g., Monday)"
                              value={newHourDay}
                              onChange={(e) => setNewHourDay(e.target.value)}
                              className="border-[#CCCCCC]"
                            />
                            <Input
                              placeholder="Hours (e.g., 9AM-5PM)"
                              value={newHourTime}
                              onChange={(e) => setNewHourTime(e.target.value)}
                              className="border-[#CCCCCC]"
                            />
                            <Button
                              onClick={addHour}
                              disabled={!newHourDay.trim() || !newHourTime.trim()}
                              className="bg-[#007BFF] hover:bg-[#0056D2]"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-1 text-[#555555]">
                          {editableHours.length > 0 ? (
                            editableHours.map((item, index) => (
                              <div key={index} className="flex gap-2">
                                <span className="font-medium min-w-[100px]">{item.day}:</span>
                                <span>{item.hours}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No hours of operation listed</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border border-[#E0E0E0] shadow-sm">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-lg font-bold text-[#333333]">Update Resource Status</CardTitle>
              <CardDescription className="text-[#666666]">Share updates with other case managers</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-3">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[#333333]">
                    Current Status
                  </Label>
                  <Select value={updateStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status" className="border-[#CCCCCC]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="LIMITED">Limited Availability</SelectItem>
                      <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-[#333333]">
                    Add Note
                  </Label>
                  <Textarea
                    id="note"
                    placeholder="Share important updates about this resource..."
                    className="h-[100px] border-[#CCCCCC]"
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="suggest-removal"
                    checked={suggestRemoval}
                    onCheckedChange={(checked) => setSuggestRemoval(checked === true)}
                  />
                  <Label htmlFor="suggest-removal" className="text-sm text-[#555555]">
                    Suggest removal (resource no longer exists)
                  </Label>
                </div>
                <Button
                  className="w-full bg-[#007BFF] hover:bg-[#0056D2]"
                  onClick={handleSubmitUpdate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Update"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



