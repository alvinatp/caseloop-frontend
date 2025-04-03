"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Search, Star } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "../context/AuthContext"
import * as resourceService from "../services/resources"
import { Resource } from "../services/resources"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recent");
  const { user } = useAuth();
  const router = useRouter();

  // Fetch recent resources
  const fetchRecentResources = async () => {
    try {
      setLoading(true);
      // Get resources updated in the last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentUpdates = await resourceService.getRecentUpdates(oneWeekAgo.toISOString());
      setRecentResources(recentUpdates);
    } catch (error) {
      console.error("Failed to fetch recent resources:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved resources
  const fetchSavedResources = async () => {
    try {
      setLoading(true);
      const saved = await resourceService.getSavedResources();
      setSavedResources(saved);
    } catch (error) {
      console.error("Failed to fetch saved resources:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (activeTab === "recent") {
      fetchRecentResources();
    } else {
      fetchSavedResources();
    }
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (searchQuery) {
      // Check if the input looks like a zipcode (5 digits)
      if (/^\d{5}(-\d{4})?$/.test(searchQuery)) {
        searchParams.append('zipcode', searchQuery);
      } else {
        searchParams.append('query', searchQuery);
      }
    }
    router.push(`/app/resources?${searchParams.toString()}`);
  };

  // Handle enter key press for search
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle resource save/unsave
  const handleResourceSaveToggle = (resourceId: number, isSaved: boolean) => {
    console.log(`Resource ${resourceId} ${isSaved ? 'saved' : 'unsaved'}`);
    
    // Refresh the appropriate list based on the current tab
    if (activeTab === "recent") {
      fetchRecentResources();
    } else {
      fetchSavedResources();
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#333333]">
          Welcome back, {user?.fullName || user?.username || 'Case Manager'}
        </h1>
        <p className="text-[#555555] text-base">
          Find and update resources to help your clients get the support they need.
        </p>
      </div>

      {/* Airbnb-style Search Bar */}
      <div className="w-full flex justify-center mb-12">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-full shadow-lg border border-gray-200 flex items-center p-1 pr-2 transition-all hover:shadow-xl focus-within:shadow-xl focus-within:border-blue-100">
            <div className="flex-1 flex items-center pl-6 pr-4 py-2" style={{ paddingLeft: '12px' }}>
              <Search className="h-5 w-5 text-[#007BFF] mr-10 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search resources by name, category, or zipcode"
                className="w-full border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none text-gray-800 placeholder:text-gray-500 h-auto"
                style={{ paddingLeft: '12px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button 
              onClick={handleSearch}
              className="rounded-full bg-[#007BFF] hover:bg-[#0056D2] px-6 h-10 flex items-center gap-2 transition-colors"
              style={{ color: 'white', fill: 'white' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span style={{ color: 'white' }}>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="border-b mb-6">
          <TabsTrigger
            value="recent"
            className="text-[#555555] data-[state=active]:text-[#007BFF] data-[state=active]:border-b-2 data-[state=active]:border-[#007BFF]"
          >
            Recently Updated
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="text-[#555555] data-[state=active]:text-[#007BFF] data-[state=active]:border-b-2 data-[state=active]:border-[#007BFF]"
          >
            Saved Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007BFF]"></div>
            </div>
          ) : recentResources.length === 0 ? (
            <div className="text-center my-12">
              <p className="text-[#666666]">No resources have been updated recently.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap mx-[-8px]">
                {recentResources.map((resource) => (
                  <div key={resource.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2">
                    <ResourceCard 
                      resource={resource} 
                      onSaveToggle={handleResourceSaveToggle}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button variant="outline" className="border-[#007BFF] text-[#007BFF] hover:bg-blue-50" asChild>
                  <Link href="/app/resources">
                    View All Resources <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007BFF]"></div>
            </div>
          ) : savedResources.length === 0 ? (
            <div className="text-center my-12">
              <p className="text-[#666666]">You don't have any saved resources yet.</p>
              <p className="text-[#666666] mt-2">Star resources to save them for quick access.</p>
            </div>
          ) : (
            <div className="flex flex-wrap mx-[-8px]">
              {savedResources.map((resource) => (
                <div key={resource.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2">
                  <ResourceCard 
                    resource={resource} 
                    onSaveToggle={handleResourceSaveToggle}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ResourceCardProps {
  resource: Resource;
  onSaveToggle?: (resourceId: number, isSaved: boolean) => void;
}

function ResourceCard({ resource, onSaveToggle }: ResourceCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();

  // Check if resource is saved on mount
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const savedResources = await resourceService.getSavedResources();
        setIsSaved(savedResources.some(r => r.id === resource.id));
      } catch (err) {
        console.error('Error checking saved status:', err);
      }
    };
    checkSavedStatus();
  }, [resource.id]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    // Prevent the click from navigating to the resource detail page
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsSaving(true);
      if (isSaved) {
        await resourceService.unsaveResource(resource.id);
        setIsSaved(false);
        // Notify parent component
        if (onSaveToggle) {
          onSaveToggle(resource.id, false);
        }
      } else {
        await resourceService.saveResource(resource.id);
        setIsSaved(true);
        // Notify parent component
        if (onSaveToggle) {
          onSaveToggle(resource.id, true);
        }
      }
    } catch (err: any) {
      console.error('Error toggling save:', err);
      setError(err.response?.data?.message || 'Failed to update save status');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCardClick = () => {
    router.push(`/app/resources/${resource.id}`);
  };

  const statusColors = {
    AVAILABLE: "text-[#28A745] bg-[#28A74510]",
    LIMITED: "text-[#FFC107] bg-[#FFC10710]",
    UNAVAILABLE: "text-[#DC3545] bg-[#DC354510]",
  }

  const statusText = {
    AVAILABLE: "Available",
    LIMITED: "Limited",
    UNAVAILABLE: "Unavailable",
  }

  // Format the lastUpdated date in a human-readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    
    try {
      if (dateString.includes('ago') || dateString.includes('day') || dateString.includes('hour')) {
        return dateString;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return new Intl.DateTimeFormat('en-US').format(date);
    } catch (e) {
      return dateString;
    }
  }

  return (
    <Card 
      className="h-full border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="p-3 pb-1">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-bold text-[#333333] line-clamp-2">{resource.name}</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 p-0 ml-1 flex-shrink-0"
            onClick={handleSaveToggle}
            disabled={isSaving}
            aria-label={isSaved ? 'Unsave resource' : 'Save resource'}
          >
            <Star className={`h-4 w-4 ${isSaved ? 'text-[#FFC107] fill-current' : 'text-[#CCCCCC]'} hover:text-[#FFC107]`} />
          </Button>
        </div>
        <CardDescription className="text-sm text-[#666666] mt-1">{resource.category}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-1 pb-3 flex-grow flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[resource.status]}`}>
            {statusText[resource.status]}
          </span>
        </div>
        <p className="text-xs text-[#999999]">Updated {formatDate(resource.lastUpdated)}</p>
      </CardContent>
    </Card>
  )
}

