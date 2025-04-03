"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileJson, Upload, FileUp, File } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import axios from "axios"

export default function ScraperPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    category: "food",
    zipcode: "94103"
  })
  
  const [loading, setLoading] = useState(false)
  const [csvLoading, setCsvLoading] = useState(false)
  const [error, setError] = useState("")
  const [csvError, setCsvError] = useState("")
  const [csvSuccess, setCsvSuccess] = useState("")
  const [results, setResults] = useState<any[] | null>(null)
  const [activeTab, setActiveTab] = useState("scraper")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResults(null)
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/scraper`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.data.results) {
        setResults(response.data.results)
      }
    } catch (err: any) {
      console.error("Error running scraper:", err)
      setError(err.response?.data?.message || "Failed to run scraper. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setCsvFile(files[0])
      setCsvError("")
    }
  }
  
  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!csvFile) {
      setCsvError("Please select a CSV file to upload")
      return
    }
    
    setCsvLoading(true)
    setCsvError("")
    setCsvSuccess("")
    
    // Create form data
    const formData = new FormData()
    formData.append('file', csvFile)
    
    try {
      // Import resources from the CSV file
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources/import-csv`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      
      setCsvSuccess(`Successfully imported ${response.data.createdCount || 0} resources`)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setCsvFile(null)
    } catch (err: any) {
      console.error("Error importing CSV:", err)
      setCsvError(err.response?.data?.message || "Failed to import CSV. Please check your file format and try again.")
    } finally {
      setCsvLoading(false)
    }
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Resource Management</h1>
      
      <Tabs defaultValue="scraper" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="scraper">Web Scraper</TabsTrigger>
          <TabsTrigger value="csv">CSV Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scraper" className="mt-4">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Web Scraper</CardTitle>
                <CardDescription>
                  Scrape resources from findhelp.org to import into the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="food, housing, health, etc."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipcode">Zipcode</Label>
                    <Input
                      id="zipcode"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleChange}
                      placeholder="94103"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scraping...
                      </>
                    ) : (
                      "Run Scraper"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {results && (
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>
                    Found {results.length} resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div key={result.id || index} className="p-4 border rounded-lg">
                        <h3 className="text-lg font-bold">{result.name}</h3>
                        <p className="text-sm text-gray-500">{result.category}</p>
                        {result.address && <p className="mt-2">{result.address}</p>}
                        {result.phone && <p><strong>Phone:</strong> {result.phone}</p>}
                        {result.website && (
                          <p>
                            <strong>Website:</strong>{" "}
                            <a href={result.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              {result.website}
                            </a>
                          </p>
                        )}
                        {result.descriptions && <p className="mt-2 italic">{result.descriptions}</p>}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        // Create a JSON blob and download it
                        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'scraped-resources.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <FileJson className="h-4 w-4" />
                      Download JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="csv" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>
                Import resources from a CSV file into the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {csvError && (
                <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
                  <AlertDescription>{csvError}</AlertDescription>
                </Alert>
              )}
              
              {csvSuccess && (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>{csvSuccess}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleCsvUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="flex-1"
                      required
                    />
                    <Button type="submit" disabled={csvLoading || !csvFile}>
                      {csvLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <FileUp className="mr-2 h-4 w-4" />
                          Import
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="border p-4 rounded-md bg-gray-50">
                  <h3 className="font-medium text-sm mb-2">CSV Format Requirements:</h3>
                  <p className="text-sm text-gray-600 mb-2">Your CSV file should include the following columns:</p>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                    <li><strong>Program</strong> - The program name</li>
                    <li><strong>Organization</strong> - The organization name</li>
                    <li><strong>Services Offered</strong> - Description of services provided</li>
                    <li><strong>Who They Serve</strong> - Target audience</li>
                    <li><strong>Next Steps / Contact & Location</strong> - Contact details and location information</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-2">
                    The system will automatically extract address, phone, email, and website information from the contact details.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {csvFile ? `Selected: ${csvFile.name}` : 'No file selected'}
                  </span>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 