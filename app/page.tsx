"use client"

import { useState, FormEvent, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock, MapPin, FolderKanban, Clipboard, Smartphone, CheckCircle, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useAuth } from "./context/AuthContext"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ 
    fullName: "", 
    username: "", 
    password: "", 
    confirmPassword: "" 
  })
  const [activeTab, setActiveTab] = useState("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { login, register, isAuthenticated } = useAuth()
  const router = useRouter()

  // Use useEffect for navigation instead of direct conditional rendering
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/app')
    }
  }, [isAuthenticated, router])

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!loginForm.username || !loginForm.password) {
      setError("Please enter both username and password")
      return
    }
    
    try {
      setLoading(true)
      setError("")
      await login({
        username: loginForm.username,
        password: loginForm.password
      })
      // On success, the login function will redirect to /app
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Validation - only require username and password
    if (!registerForm.username || !registerForm.password || !registerForm.confirmPassword) {
      setError("Please fill in all required fields")
      return
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    
    try {
      setLoading(true)
      setError("")
      // Include fullName in registration data if provided
      await register({
        username: registerForm.username,
        password: registerForm.password,
        fullName: registerForm.fullName || undefined, // Only include if it has a value
        role: "CASE_MANAGER"
      })
      // On success, the register function will login and redirect to /app
    } catch (err: any) {
      console.error('Registration error details:', err.response?.data);
      if (err.response?.data?.errors) {
        // Handle validation errors from the API
        const errorMessages = err.response.data.errors.map((e: any) => 
          Object.values(e).join(': ')
        ).join(', ');
        setError(errorMessages || "Registration failed. Please try again.");
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/casesync-logo.png" alt="CaseSync Logo" width={110} height={25} priority />
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary">
              How it Works
            </Link>
            <Link href="#login" className="text-sm font-medium hover:text-primary">
              Login
            </Link>
            <Button asChild>
              <Link href="/app">Get Started</Link>
            </Button>
          </nav>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-background md:hidden">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src="/casesync-logo.png"
                    alt="CaseSync Logo"
                    width={100}
                    height={24}
                    priority
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="container grid gap-6 py-6">
                <Link
                  href="#features"
                  className="text-lg font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-lg font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How it Works
                </Link>
                <Link
                  href="#login"
                  className="text-lg font-medium hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Button className="w-full" onClick={() => setMobileMenuOpen(false)} asChild>
                  <Link href="/app">Get Started</Link>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="container flex-1 py-12 md:py-24 lg:py-32 mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                CaseSync: Up-to-date Resources for Case Managers
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-[700px] mb-8">
                Find reliable, current social service resources and share real-time updates with your network. Never
                waste time on outdated information again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/app">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative h-[350px] lg:h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Dashboard Preview"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-muted/50">
          <div className="container py-12 md:py-24 lg:py-32 mx-auto max-w-7xl px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Built for Case Managers</h2>
              <p className="text-muted-foreground text-lg mx-auto max-w-[700px]">
                Tools designed specifically to help you find and share reliable resource information.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Real-time Resource Updates",
                  description:
                    "See current availability status and share updates with other case managers in your network.",
                  icon: <Clock className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Location-based Search",
                  description: "Find resources near your clients with zipcode filtering and distance-based results.",
                  icon: <MapPin className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Resource Categories",
                  description: "Quickly filter by housing, food, healthcare, and other essential service categories.",
                  icon: <FolderKanban className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Case Manager Notes",
                  description: "Leave notes and updates about resources for other case managers to reference.",
                  icon: <Clipboard className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Mobile Friendly",
                  description: "Access resource information from anywhere, perfect for fieldwork and client meetings.",
                  icon: <Smartphone className="h-8 w-8 text-primary" />,
                },
                {
                  title: "Simple Verification",
                  description: "Easily verify and update resource information to keep the database current and reliable.",
                  icon: <CheckCircle className="h-8 w-8 text-primary" />,
                },
              ].map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full">
          <div className="container py-12 md:py-24 lg:py-32 mx-auto max-w-7xl px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="text-muted-foreground text-lg mx-auto max-w-[700px]">
                Get started in minutes with our simple three-step process.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Create an Account",
                  description: "Sign up for free and set up your profile in just a few clicks.",
                },
                {
                  step: "2",
                  title: "Configure Your Workspace",
                  description: "Customize your dashboard and settings to match your workflow.",
                },
                {
                  step: "3",
                  title: "Start Using the Platform",
                  description: "Invite your team and begin collaborating right away.",
                },
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center space-y-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Login/Signup Section */}
        <section id="login" className="w-full bg-muted/50">
          <div className="container py-12 md:py-24 lg:py-32 mx-auto max-w-7xl px-4">
            <div className="max-w-md mx-auto">
              <div className="text-center space-y-4 mb-8">
                <h2 className="text-3xl font-bold tracking-tighter">Access Your Account</h2>
                <p className="text-muted-foreground">Log in to your account or create a new one to get started.</p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <Tabs 
                    defaultValue="login" 
                    value={activeTab} 
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                        {error}
                      </div>
                    )}

                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username <span className="text-xs text-red-500">*</span></Label>
                          <Input 
                            id="username" 
                            value={loginForm.username}
                            onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                            placeholder="username" 
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password <span className="text-xs text-red-500">*</span></Label>
                            <Link href="#" className="text-sm text-primary hover:underline">
                              Forgot password?
                            </Link>
                          </div>
                          <Input 
                            id="password" 
                            type="password" 
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                            required
                          />
                        </div>
                        <Button className="w-full" type="submit" disabled={loading}>
                          {loading ? 'Logging in...' : 'Login'}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Full Name <span className="text-xs text-muted-foreground">(optional)</span></Label>
                          <Input 
                            id="signup-name" 
                            placeholder="John Doe" 
                            value={registerForm.fullName}
                            onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-username">Username <span className="text-xs text-red-500">*</span></Label>
                          <Input 
                            id="signup-username" 
                            placeholder="username" 
                            value={registerForm.username}
                            onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                            required
                          />
                          <p className="text-xs text-muted-foreground">Must be at least 3 characters long</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password <span className="text-xs text-red-500">*</span></Label>
                          <Input 
                            id="signup-password" 
                            type="password" 
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                            required
                          />
                          <p className="text-xs text-muted-foreground">Must be at least 6 characters long</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm">Confirm Password <span className="text-xs text-red-500">*</span></Label>
                          <Input 
                            id="signup-confirm" 
                            type="password" 
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                            required
                          />
                        </div>
                        <Button className="w-full" type="submit" disabled={loading}>
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full">
          <div className="container py-12 md:py-24 lg:py-32 mx-auto max-w-7xl px-4">
            <div className="rounded-lg bg-primary text-primary-foreground p-8 md:p-12 lg:p-16 text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Find Better Resources?
              </h2>
              <p className="text-lg mx-auto max-w-[700px] text-primary-foreground/90">
                Join other case managers who are sharing reliable, up-to-date resource information to better serve their
                clients.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="gap-2" asChild>
                  <Link href="/app">
                    Create Account <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t">
        <div className="container py-10 mx-auto max-w-7xl px-4 flex justify-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} CaseSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

