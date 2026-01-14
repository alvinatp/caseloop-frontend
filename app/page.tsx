"use client"

import { useState, FormEvent, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, X, Menu, Diamond, Circle, Hexagon, Star, Lock, Sun, Moon, Check, Loader2, Github, Database, Zap, Cloud, Home, Heart, Stethoscope, Bus } from "lucide-react"
import { useRouter } from "next/navigation"
import createGlobe from "cobe"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "./context/AuthContext"

// Logo Component
function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M94.7921 26.6665C77.6433 26.6665 61.7972 35.8153 53.2228 50.6665L22.4308 104C13.8564 118.851 13.8564 137.149 22.4308 152L53.2228 205.333C61.7972 220.184 77.6433 229.333 94.7921 229.333H156.376C173.525 229.333 189.371 220.184 197.945 205.333L228.737 152C237.312 137.149 237.312 118.851 228.737 104L197.945 50.6665C189.371 35.8153 173.525 26.6665 156.376 26.6665H94.7921ZM156.376 58.6665H117.886C111.728 58.6665 107.88 65.3326 110.963 70.6633C120.478 87.1102 130.015 103.545 139.516 120C142.374 124.95 142.374 131.049 139.516 136C130.015 152.455 120.478 168.889 110.963 185.336C107.88 190.667 111.728 197.333 117.886 197.333H156.376C162.092 197.333 167.375 194.284 170.233 189.333L201.025 136C203.883 131.049 203.883 124.95 201.025 120L170.233 66.6665C167.375 61.7161 162.092 58.6665 156.376 58.6665Z"
        fill="currentColor"
      />
    </svg>
  )
}


// Email Verification Modal (for Stand Up for Kids users)
function EmailVerificationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email) { setError("Please enter your email address"); return }
    if (!email.endsWith("@standupforkids.org")) {
      setError("Access is restricted to Stand Up for Kids employees and volunteers. Please use your @standupforkids.org email address.")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setError("Unable to verify email at this time. Please contact your administrator for access.")
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 z-10 chunky-card">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600">
          <X className="h-5 w-5" />
        </button>
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">Verify Your Access</h2>
          <p className="text-neutral-500 text-sm">
            CaseLoop is currently available exclusively to Stand Up for Kids employees and volunteers.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-email">Organization Email</Label>
            <Input id="verify-email" type="email" placeholder="yourname@standupforkids.org" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" />
          </div>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}
          <Button type="submit" className="w-full h-12 rounded-2xl bg-teal-500 hover:bg-teal-600" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
        <p className="text-xs text-neutral-400 text-center mt-4">Don't have an @standupforkids.org email? Contact your supervisor.</p>
      </div>
    </div>
  )
}

// Request Access Modal (for external organizations)
function RequestAccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", organization: "", role: "" })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.name || !form.email || !form.organization) {
      setError("Please fill in all required fields")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  const handleClose = () => {
    setForm({ name: "", email: "", organization: "", role: "" })
    setSubmitted(false)
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 z-10 chunky-card">
        <button onClick={handleClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600">
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-teal-500" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">Request Submitted</h2>
            <p className="text-neutral-500 text-sm">
              Thanks for your interest in CaseLoop! We'll reach out to {form.email} when we're ready to expand access.
            </p>
            <Button onClick={handleClose} className="mt-6 rounded-xl bg-teal-500 hover:bg-teal-600">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-display mb-2">Request Early Access</h2>
              <p className="text-neutral-500 text-sm">
                Interested in bringing CaseLoop to your organization? Let us know and we'll be in touch.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" placeholder="Jane Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="jane@organization.org" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input id="organization" placeholder="Your nonprofit or agency" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Your Role (optional)</Label>
                <Input id="role" placeholder="Case Manager, Director, etc." value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="h-11 rounded-xl" />
              </div>
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}
              <Button type="submit" className="w-full h-11 rounded-xl bg-teal-500 hover:bg-teal-600" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : "Submit Request"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// Login Modal
function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!loginForm.username || !loginForm.password) { setError("Please enter both username and password"); return }
    try {
      setLoading(true); setError("")
      await login({ username: loginForm.username, password: loginForm.password })
      onClose()
      router.push('/app')
    } catch (err: any) { setError("Invalid username or password") }
    finally { setLoading(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 z-10 chunky-card">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600">
          <X className="h-5 w-5" />
        </button>
        <div className="text-center mb-6">
          <p className="font-bold font-display text-2xl mb-4">CaseLoop</p>
          <h2 className="text-xl font-medium">Sign in to your account</h2>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full h-12 rounded-xl" placeholder="username" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Password</Label>
              <button type="button" className="text-xs text-neutral-500 hover:underline">Forgot password?</button>
            </div>
            <Input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full h-12 rounded-xl" />
          </div>
          <Button type="submit" className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 rounded-2xl" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <Separator className="my-4" />
        <Button variant="secondary" className="w-full h-12 rounded-2xl" disabled>
          Continue with Google
        </Button>
      </div>
    </div>
  )
}

// Marquee Component
function Marquee({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex overflow-hidden ${className}`}>
      <div className="flex w-fit animate-marquee" style={{ "--duration": "120s", "--gap": "2rem", gap: "2rem" } as any}>
        {children}
        {children}
      </div>
    </div>
  )
}

// Company Logo Icons
const LogoIcon = ({ name }: { name: string }) => {
  const icons: Record<string, JSX.Element> = {
    segment: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M2.5 5.5h19v2h-19zm0 5.5h19v2h-19zm0 5.5h19v2h-19z"/></svg>,
    discord: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>,
    spotify: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>,
    microsoft: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M0 0h11.377v11.377H0zm12.623 0H24v11.377H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z"/></svg>,
    netflix: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/></svg>,
    github: <Github className="h-5 w-5" />,
    database: <Database className="h-5 w-5" />,
    cloud: <Cloud className="h-5 w-5" />,
    zap: <Zap className="h-5 w-5" />,
  }
  return icons[name] || <Circle className="h-5 w-5" />
}

const partnerLogos = [
  { name: "Stand Up for Kids", src: "/suforkids.png", height: "h-12 sm:h-14" },
  { name: "UCI SOSEC", src: "/ucisosec.png", height: "h-8 sm:h-10" },
  { name: "HFLI", src: "/hfli.png", height: "h-14 sm:h-16" },
  { name: "OCSSA", src: "/ocssa.png", height: "h-12 sm:h-14" },
]

// Hero Features with tabs
function HeroFeatures() {
  const [activeFeature, setActiveFeature] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorLeft, setIndicatorLeft] = useState(0)

  const tabs = [
    { title: "Resource Database", description: "Comprehensive directory", icon: Diamond },
    { title: "Real-time Updates", description: "Live status tracking", icon: Circle },
    { title: "Location Search", description: "Find nearby resources", icon: Hexagon },
    { title: "Team Notes", description: "Collaborative insights", icon: Star },
  ]

  useEffect(() => {
    if (!containerRef.current) return
    const items = containerRef.current.querySelectorAll('.tab-item')
    const activeEl = items[activeFeature] as HTMLElement
    if (!activeEl) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()
    setIndicatorLeft(activeRect.left - containerRect.left + activeRect.width / 2)
  }, [activeFeature])

  // Soft button style matching Nuxt UI's variant="soft"
  const SoftButton = ({ active, children }: { active: boolean; children: React.ReactNode }) => (
    <button
      className={`
        h-10 w-10 rounded-lg flex items-center justify-center transition-colors
        ${active
          ? 'bg-teal-50 text-teal-400'
          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
        }
      `}
    >
      {children}
    </button>
  )

  return (
    <section ref={containerRef} className="relative">
      <div className="border-t border-neutral-200 w-full relative">
        <span className="w-8 h-px absolute top-0 -translate-x-1/2 bg-teal-500 transition-all duration-300" style={{ left: `${indicatorLeft}px` }} />
      </div>
      <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        <div className="grid md:grid-cols-4 grid-cols-[repeat(4,100%)] md:gap-4 gap-2 w-full">
          {tabs.map((tab, i) => (
            <div key={i} className="tab-item px-4 py-6 flex items-center flex-col justify-center gap-2 text-center cursor-pointer snap-center" onClick={() => setActiveFeature(i)}>
              <SoftButton active={activeFeature === i}>
                <tab.icon className="h-4 w-4" />
              </SoftButton>
              <p className="text-sm font-semibold">{tab.title}</p>
              <p className="text-sm text-neutral-500">{tab.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <Image src={`/dashboard-${activeFeature === 0 ? 'light-1' : activeFeature === 1 ? 'light-2' : activeFeature === 2 ? 'light-3' : 'light-4'}.jpg`} alt="Dashboard" width={1200} height={600} className="rounded-lg" />
      </div>
    </section>
  )
}

// Animated List Component - 96px items, 1500ms interval, 1000ms transition
function AnimatedList() {
  const [listPosition, setListPosition] = useState(0)

  const mockItems = [
    { id: 1, icon: Home, label: "Hope Harbor Emergency Shelter", badges: ["Verified", "Shelter"], status: "success", time: "2 beds", userName: "Sarah M.", date: "Updated 1 hour ago" },
    { id: 2, icon: Heart, label: "Community Food Pantry - Downtown", badges: ["Open Now", "Food"], status: "success", time: "Walk-in", userName: "James T.", date: "Updated 2 hours ago" },
    { id: 3, icon: Stethoscope, label: "Sunrise Medical Clinic", badges: ["Waitlist", "Medical"], status: "error", time: "Full", userName: "Maria L.", date: "Updated today" },
    { id: 4, icon: Bus, label: "Metro Transit Assistance Program", badges: ["Available", "Transport"], status: "success", time: "Same day", userName: "David K.", date: "Updated 3 hours ago" },
    { id: 5, icon: Home, label: "Safe Haven Family Housing", badges: ["Limited", "Housing"], status: "error", time: "1 unit", userName: "Emily R.", date: "Updated yesterday" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setListPosition(prev => {
        const newPos = prev - 96  // 96px per item
        if (Math.abs(newPos) >= mockItems.length * 96) return 0
        return newPos
      })
    }, 1500)  // 1500ms interval
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-64 bg-neutral-100 w-full p-8 overflow-hidden relative">
      <div className="transition-transform duration-1000" style={{ transform: `translateY(${listPosition}px)` }}>
        {[...mockItems, ...mockItems].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="chunky-card bg-white rounded-lg p-4 w-[120%] mb-4" style={{ height: '80px' }}>
            <div className="relative pl-8 flex gap-2">
              <item.icon className="absolute left-0 top-0 h-5 w-5 text-neutral-500" />
              <div className="flex-[2]">
                <p className="text-xs md:text-sm font-medium font-mono truncate">{item.label}</p>
                <div className="flex items-center gap-2 mt-2">
                  {item.badges.map((badge) => (
                    <span key={badge} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-600">{badge}</span>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <p className="text-xs md:text-sm font-medium font-mono capitalize">{item.status}</p>
                </div>
                <p className="text-neutral-500 text-xs ml-4 mt-2">{item.time}</p>
              </div>
              <div className="flex-1 hidden md:block">
                <p className="text-xs md:text-sm font-medium">{item.userName}</p>
                <p className="text-neutral-500 text-xs">{item.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute w-full bottom-0 left-0 h-20 bg-gradient-to-b from-transparent to-neutral-100" />
    </div>
  )
}

// RealtimeCollab with cursor animation
function RealtimeCollab() {
  const [showCursors, setShowCursors] = useState(false)
  const [emmaPos, setEmmaPos] = useState({ top: '2rem', left: '10rem' })
  const [alexPos, setAlexPos] = useState({ top: '4rem', left: '3rem' })
  const [userCursorPos, setUserCursorPos] = useState({ x: 0, y: 0 })
  const [showUserCursor, setShowUserCursor] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [emmaTyping, setEmmaTyping] = useState(false)
  const [alexTyping, setAlexTyping] = useState(false)
  const [emmaFocused, setEmmaFocused] = useState(-1)
  const [alexFocused, setAlexFocused] = useState(-1)
  const [emmaText, setEmmaText] = useState('')
  const [alexText, setAlexText] = useState('')
  const [emmaClicking, setEmmaClicking] = useState(false)
  const [alexClicking, setAlexClicking] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setUserCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  // Grid data - case manager spreadsheet style (7 rows x 3 cols = 21 cells)
  const gridData = [
    { label: "Client Name", value: "Johnson, M." },
    { label: "Case #", value: "2847" },
    { label: "Status", value: "" },
    { label: "Shelter", value: "Hope Harbor" },
    { label: "Beds Needed", value: "2" },
    { label: "Priority", value: "" },
    { label: "Food Assist", value: "Yes" },
    { label: "Medical", value: "Pending" },
    { label: "Transport", value: "No" },
    { label: "Phone", value: "(555) 123-4" },
    { label: "Intake Date", value: "01/12/25" },
    { label: "Notes", value: "" },
    { label: "Caseworker", value: "Sarah M." },
    { label: "Follow-up", value: "01/15/25" },
    { label: "Documents", value: "3 files" },
    { label: "Location", value: "Downtown" },
    { label: "Language", value: "English" },
    { label: "Family Size", value: "3" },
    { label: "Income", value: "SSI" },
    { label: "Referral", value: "211" },
    { label: "Veteran", value: "No" },
  ]

  useEffect(() => {
    setShowCursors(true)
    const runAnimation = async () => {
      while (true) {
        // Emma moves to Status field (row 1, col 3)
        setEmmaPos({ top: '1.5rem', left: '13rem' })
        await new Promise(r => setTimeout(r, 800))
        setEmmaClicking(true)
        await new Promise(r => setTimeout(r, 150))
        setEmmaClicking(false)
        setEmmaFocused(2)
        await new Promise(r => setTimeout(r, 300))
        setEmmaTyping(true)
        setEmmaText('Active')
        await new Promise(r => setTimeout(r, 600))
        setEmmaTyping(false)

        // Alex moves to Priority field (row 2, col 3)
        await new Promise(r => setTimeout(r, 400))
        setAlexPos({ top: '3rem', left: '13rem' })
        await new Promise(r => setTimeout(r, 600))
        setAlexClicking(true)
        await new Promise(r => setTimeout(r, 150))
        setAlexClicking(false)
        setAlexFocused(5)
        await new Promise(r => setTimeout(r, 300))
        setAlexTyping(true)
        setAlexText('High')
        await new Promise(r => setTimeout(r, 500))
        setAlexTyping(false)

        // Emma moves to Notes (row 4, col 3)
        await new Promise(r => setTimeout(r, 500))
        setEmmaPos({ top: '6rem', left: '13rem' })
        await new Promise(r => setTimeout(r, 600))
        setEmmaFocused(11)
        setEmmaClicking(true)
        await new Promise(r => setTimeout(r, 150))
        setEmmaClicking(false)
        await new Promise(r => setTimeout(r, 200))
        setEmmaTyping(true)
        setEmmaText('Needs housing')
        await new Promise(r => setTimeout(r, 800))
        setEmmaTyping(false)

        // Alex moves down to check Documents (row 5, col 3)
        await new Promise(r => setTimeout(r, 400))
        setAlexPos({ top: '7.5rem', left: '13rem' })
        await new Promise(r => setTimeout(r, 500))

        // Emma browses to Family Size (row 6, col 3)
        await new Promise(r => setTimeout(r, 300))
        setEmmaPos({ top: '9rem', left: '13rem' })
        await new Promise(r => setTimeout(r, 800))

        // Reset
        setEmmaFocused(-1)
        setAlexFocused(-1)
        setEmmaText('')
        setAlexText('')
        setEmmaPos({ top: '1.5rem', left: '10rem' })
        setAlexPos({ top: '4.5rem', left: '3rem' })
        await new Promise(r => setTimeout(r, 1500))
      }
    }
    runAnimation()
  }, [])

  return (
    <div
      ref={containerRef}
      className="h-64 relative p-8 overflow-hidden"
      style={{ cursor: showUserCursor ? 'none' : 'auto' }}
      onMouseEnter={() => setShowUserCursor(true)}
      onMouseLeave={() => setShowUserCursor(false)}
      onMouseMove={handleMouseMove}
    >
      {/* User Cursor - Blue (only shows on hover) */}
      {showUserCursor && (
        <div
          className="absolute z-30 pointer-events-none transition-transform duration-75"
          style={{ left: userCursorPos.x, top: userCursorPos.y }}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path d="M3 3L10.07 21.07L12.58 13.58L20.07 11.07L3 3Z" fill="url(#user-gradient)"/>
            <defs>
              <linearGradient id="user-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA"/>
                <stop offset="100%" stopColor="#3B82F6"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute top-5 -right-2 text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full shadow-lg font-medium">You</span>
        </div>
      )}

      {/* Alex Cursor - Emerald */}
      <div
        className={`absolute transition-all duration-300 z-20 ${showCursors ? 'opacity-100' : 'opacity-0'} ${alexClicking ? 'scale-90' : 'scale-100'}`}
        style={{ top: alexPos.top, left: alexPos.left }}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
          <path d="M3 3L10.07 21.07L12.58 13.58L20.07 11.07L3 3Z" fill="url(#alex-gradient)"/>
          <defs>
            <linearGradient id="alex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8DE9DE"/>
              <stop offset="100%" stopColor="#2dd4bf"/>
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute top-5 -right-4 text-[9px] bg-teal-500 text-white px-1.5 py-0.5 rounded-full shadow-lg font-medium">Alex</span>
      </div>

      {/* Emma Cursor - Purple */}
      <div
        className={`absolute transition-all duration-500 z-20 ${showCursors ? 'opacity-100' : 'opacity-0'} ${emmaClicking ? 'scale-90' : 'scale-100'}`}
        style={{ top: emmaPos.top, left: emmaPos.left }}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
          <path d="M3 3L10.07 21.07L12.58 13.58L20.07 11.07L3 3Z" fill="url(#emma-gradient)"/>
          <defs>
            <linearGradient id="emma-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7F68DC"/>
              <stop offset="100%" stopColor="#A798E9"/>
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute top-5 -right-8 text-[9px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full shadow-lg font-medium">Emma</span>
      </div>

      {/* Case Management Grid - 7 rows x 3 cols */}
      <div className="grid grid-cols-3 gap-2">
        {gridData.map((cell, i) => (
          <div
            key={i}
            className={`h-8 bg-white rounded-md chunky-card px-2 flex items-center text-[10px] transition-all ${
              emmaFocused === i
                ? 'ring-2 ring-purple-500/20 border-purple-400'
                : alexFocused === i
                  ? 'ring-2 ring-teal-500/20 border-teal-400'
                  : ''
            }`}
          >
            {emmaFocused === i && emmaText ? (
              <span className={`text-purple-600 ${emmaTyping ? 'animate-typing' : ''}`}>{emmaText}</span>
            ) : alexFocused === i && alexText ? (
              <span className={`text-teal-400 ${alexTyping ? 'animate-typing' : ''}`}>{alexText}</span>
            ) : (
              <span className="text-neutral-400 truncate">{cell.value || cell.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Security Animation
function SecurityAnimation() {
  // Ripple configuration - larger circles that fill the card
  const baseCircleSize = 80
  const spaceBetweenCircle = 50
  const numberOfCircles = 5
  const baseOpacity = 0.3
  const opacityDowngradeRatio = 0.04
  const waveSpeed = 100 // ms delay between each circle

  return (
    <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)]">
      {Array.from({ length: numberOfCircles }).map((_, index) => {
        const size = baseCircleSize + index * spaceBetweenCircle
        const opacity = baseOpacity - index * opacityDowngradeRatio
        const delay = index * waveSpeed
        const borderStyle = index === numberOfCircles - 1 ? 'dashed' : 'solid'

        return (
          <div
            key={index}
            className="absolute border-teal-500/60 bg-teal-100/30 rounded-full animate-ripple"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(1)',
              opacity: Math.max(opacity, 0.1),
              animationDelay: `${delay}ms`,
              borderWidth: '2px',
              borderStyle,
            }}
          />
        )
      })}
    </div>
  )
}

// Smart Referral Flow - case management workflow
function ReferralFlow() {
  const [step1, setStep1] = useState(0)
  const [step2, setStep2] = useState(0)
  const [step3, setStep3] = useState(0)
  // Edge states: 0 = inactive, 1 = animating, 2 = lit
  const [edge0, setEdge0] = useState(0) // before Client Need
  const [edge1, setEdge1] = useState(0) // between Client Need and Find Match
  const [edge2, setEdge2] = useState(0) // between Find Match and Refer Client
  const [edge3, setEdge3] = useState(0) // after Refer Client

  useEffect(() => {
    const runAnimation = async () => {
      while (true) {
        // Reset
        setStep1(0); setStep2(0); setStep3(0)
        setEdge0(0); setEdge1(0); setEdge2(0); setEdge3(0)
        await new Promise(r => setTimeout(r, 1000))

        // Edge 0 lights up, then Client Need activates
        setEdge0(1)
        await new Promise(r => setTimeout(r, 400))
        setEdge0(2)
        setStep1(1)
        await new Promise(r => setTimeout(r, 800))
        setStep1(2)

        // Edge 1 lights up, then Find Match activates
        setEdge1(1)
        await new Promise(r => setTimeout(r, 400))
        setEdge1(2)
        setStep2(1)
        await new Promise(r => setTimeout(r, 800))
        setStep2(2)

        // Edge 2 lights up, then Refer Client activates
        setEdge2(1)
        await new Promise(r => setTimeout(r, 400))
        setEdge2(2)
        setStep3(1)
        await new Promise(r => setTimeout(r, 800))
        setStep3(2)

        // Edge 3 lights up to complete the flow
        setEdge3(1)
        await new Promise(r => setTimeout(r, 400))
        setEdge3(2)

        await new Promise(r => setTimeout(r, 1500))
      }
    }
    runAnimation()
  }, [])

  const StepIcon = ({ step, Icon }: { step: number; Icon: any }) => {
    if (step === 0) return <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-neutral-400" />
    if (step === 1) return <Loader2 className="h-5 w-5 lg:h-6 lg:w-6 animate-spin text-teal-400" />
    return <Check className="h-5 w-5 lg:h-6 lg:w-6 text-teal-400" />
  }

  const Edge = ({ state }: { state: number }) => (
    <div className="w-full h-px relative z-0">
      {/* Base line */}
      <div className={`absolute inset-0 h-[2px] transition-colors duration-300 ${state === 2 ? 'bg-teal-400' : 'bg-neutral-300/50'}`} />
      {/* Animated shine */}
      {state === 1 && (
        <div className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-[shimmer_0.4s_ease-out_forwards]" />
      )}
    </div>
  )

  return (
    <div className="h-48 lg:h-64 bg-neutral-100 bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px] relative flex items-center overflow-hidden px-4">
      {/* Edge 0: Before Client Need */}
      <Edge state={edge0} />

      {/* Step 1: Client Need */}
      <div className={`chunky-card flex flex-col items-center justify-center gap-1.5 h-20 lg:h-24 px-4 lg:px-6 bg-white rounded-xl transition-all duration-300 relative z-10 shrink-0 ${step1 === 1 ? 'scale-105 ring-2 ring-teal-500/30' : ''} ${step1 === 2 ? 'bg-teal-50' : ''}`}>
        <StepIcon step={step1} Icon={Heart} />
        <p className="text-xs lg:text-sm font-medium text-center">Client Need</p>
      </div>

      {/* Edge 1: Between Client Need and Find Match */}
      <Edge state={edge1} />

      {/* Step 2: Match Resources */}
      <div className={`chunky-card flex flex-col items-center justify-center gap-1.5 h-20 lg:h-24 px-4 lg:px-6 bg-white rounded-xl transition-all duration-300 relative z-10 shrink-0 ${step2 === 1 ? 'scale-105 ring-2 ring-teal-500/30' : ''} ${step2 === 2 ? 'bg-teal-50' : ''}`}>
        <StepIcon step={step2} Icon={Database} />
        <p className="text-xs lg:text-sm font-medium text-center">Find Match</p>
      </div>

      {/* Edge 2: Between Find Match and Refer Client */}
      <Edge state={edge2} />

      {/* Step 3: Send Referral */}
      <div className={`chunky-card flex flex-col items-center justify-center gap-1.5 h-20 lg:h-24 px-4 lg:px-6 bg-white rounded-xl transition-all duration-300 relative z-10 shrink-0 ${step3 === 1 ? 'scale-105 ring-2 ring-teal-500/30' : ''} ${step3 === 2 ? 'bg-teal-50' : ''}`}>
        <StepIcon step={step3} Icon={ArrowRight} />
        <p className="text-xs lg:text-sm font-medium text-center">Refer Client</p>
      </div>

      {/* Edge 3: After Refer Client */}
      <Edge state={edge3} />
    </div>
  )
}

// Globe Component
function Globe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !canvasRef.current) return

    let phi = 0
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 0.4,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [0.9, 0.9, 0.9],
      markerColor: [45 / 255, 212 / 255, 191 / 255],
      glowColor: [1.2, 1.2, 1.2],
      markers: [
        { location: [14.5995, 120.9842], size: 0.03 },
        { location: [19.076, 72.8777], size: 0.1 },
        { location: [23.8103, 90.4125], size: 0.05 },
        { location: [30.0444, 31.2357], size: 0.07 },
        { location: [39.9042, 116.4074], size: 0.08 },
        { location: [-23.5505, -46.6333], size: 0.1 },
        { location: [19.4326, -99.1332], size: 0.1 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [34.6937, 135.5022], size: 0.05 },
        { location: [41.0082, 28.9784], size: 0.06 },
      ],
      onRender: (state) => {
        state.phi = phi
        phi += 0.003
      },
    })

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = '1'
    }, 100)

    return () => globe.destroy()
  }, [mounted])

  return (
    <canvas
      ref={canvasRef}
      className={`opacity-0 transition-opacity duration-1000 ease-in-out ${className}`}
      style={{ width: 600, height: 600, contain: 'layout paint size' }}
    />
  )
}

// Main Page
export default function LandingPage() {
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => { if (isAuthenticated) router.push('/app') }, [isAuthenticated, router])
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleGetStarted = (e: React.MouseEvent) => { e.preventDefault(); setShowVerificationModal(true) }
  const handleRequestAccess = (e: React.MouseEvent) => { e.preventDefault(); setShowRequestModal(true) }
  const handleSignIn = (e: React.MouseEvent) => { e.preventDefault(); setShowLoginModal(true) }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <EmailVerificationModal isOpen={showVerificationModal} onClose={() => setShowVerificationModal(false)} />
      <RequestAccessModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Navbar */}
      <div className="sticky w-full top-0 z-50 py-2 sm:py-4 px-2 sm:px-4">
        <nav className="relative">
          <div className={`mx-auto px-4 transition-all duration-500 ease-in-out ${scrolled ? 'max-w-3xl bg-white/90 rounded-3xl shadow-xl backdrop-blur py-4 ring-1 ring-neutral-100' : 'max-w-6xl py-2'}`}>
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <p className="font-bold font-display text-xl">CaseLoop</p>
              </Link>
              <div className="items-center justify-center gap-2 hidden md:flex">
                <Button variant="ghost" onClick={() => scrollToSection('partners')}>Partners</Button>
                <Button variant="ghost" onClick={() => scrollToSection('features')}>Features</Button>
                <Button variant="ghost" onClick={() => scrollToSection('access')}>Access</Button>
                <Button variant="ghost" onClick={() => scrollToSection('contact')}>Contact</Button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleSignIn} className="h-8 items-center justify-center relative mr-2 group hidden md:flex">
                  <div className="flex gap-4 items-center relative z-20">
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <span className="h-8 pointer-events-none z-10 w-8 group-hover:w-[130%] transition-all absolute top-0 -right-2 bg-neutral-200 rounded-full flex items-center justify-center" />
                </button>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            {mobileMenuOpen && (
              <div className="md:hidden mt-2 flex flex-col gap-2">
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('partners')}>Partners</Button>
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('features')}>Features</Button>
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('access')}>Access</Button>
                <Button variant="ghost" className="justify-start" onClick={() => scrollToSection('contact')}>Contact</Button>
                <Separator />
                <Button variant="ghost" className="justify-start" onClick={handleSignIn}>Sign In</Button>
                <Button variant="ghost" className="justify-start" onClick={handleGetStarted}>Create Account</Button>
              </div>
            )}
          </div>
        </nav>
      </div>

      <main>
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero */}
          <section className="py-20 sm:py-24">
            <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-8">
              <h1 className="text-4xl sm:text-7xl tracking-tight font-bold font-display">
                Supporting Youth at Godspeed
              </h1>
              <p className="text-base sm:text-xl text-neutral-500 leading-relaxed text-center text-balance max-w-3xl mx-auto">
                The modern way for case managers to find and share social service resources. Real-time updates, trusted information.
              </p>
              <div className="flex items-center gap-4 justify-center flex-col">
                <Button size="lg" onClick={handleGetStarted} className="h-12 rounded-2xl ring-4 ring-neutral-900/10 px-6 hover:ring-2 transition-shadow duration-300 bg-teal-500 hover:bg-teal-500">
                  Get Started
                </Button>
              </div>
            </div>
          </section>

          {/* Hero Features */}
          <HeroFeatures />

          {/* Logo Carousel */}
          <section id="partners" className="py-12 scroll-mt-24">
            <div className="relative mb-4 max-w-4xl mx-auto overflow-hidden">
              <div className="flex w-fit animate-marquee" style={{ "--duration": "15s", "--gap": "4rem", gap: "4rem" } as any}>
                {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, i) => (
                  <div key={`${logo.name}-${i}`} className="flex items-center justify-center shrink-0">
                    <Image src={logo.src} alt={logo.name} width={160} height={80} className={`${logo.height} w-auto object-contain`} />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
            </div>
            <h2 className="text-center text-sm text-neutral-500">Made in partnership with</h2>
          </section>

          {/* Bento Grid */}
          <section id="features" className="py-12 scroll-mt-24">
            <h2 className="text-center text-base/7 font-semibold text-teal-400">Built for case managers</h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance sm:text-5xl font-display">
              A modern take on resource management
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
              {/* Card 1 - Animated List (4 cols) */}
              <div className="flex p-px lg:col-span-4 w-full">
                <div className="overflow-hidden rounded-lg bg-neutral-50 bento-card max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem] w-full">
                  <AnimatedList />
                  <div className="p-10">
                    <h3 className="text-sm/4 font-semibold text-neutral-500">Resources</h3>
                    <p className="mt-2 text-lg font-bold font-display tracking-tight">Instant access to verified resources</p>
                    <p className="mt-2 max-w-lg text-sm/6 text-neutral-500">
                      A powerful resource management system that allows you to search, filter, and access verified social services instantly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 - RealtimeCollab (2 cols) */}
              <div className="flex p-px lg:col-span-2">
                <div className="overflow-hidden rounded-lg bg-neutral-50 bento-card lg:rounded-tr-[2rem]">
                  <RealtimeCollab />
                  <div className="p-10">
                    <h3 className="text-sm/4 font-semibold text-neutral-500">Live Updates</h3>
                    <p className="mt-2 text-lg font-bold font-display tracking-tight">Real-time collaboration</p>
                    <p className="mt-2 max-w-lg text-sm/6 text-neutral-500">
                      Connect with your team in real-time, see changes as they happen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 - Security (2 cols) */}
              <div className="flex p-px lg:col-span-2">
                <div className="overflow-hidden rounded-lg bg-neutral-50 bento-card lg:rounded-bl-[2rem] w-full">
                  <div className="relative flex h-64 w-full flex-col items-center justify-center overflow-hidden rounded-lg">
                    <div className="h-20 w-20 rounded-full z-10 flex items-center justify-center relative">
                      <Lock className="h-8 w-8 text-neutral-500" />
                    </div>
                    <SecurityAnimation />
                  </div>
                  <div className="p-10">
                    <h3 className="text-sm/4 font-semibold text-neutral-500">Privacy</h3>
                    <p className="mt-2 text-lg font-bold font-display tracking-tight">HIPAA-compliant security</p>
                    <p className="mt-2 max-w-lg text-sm/6 text-neutral-500">
                      Client data stays protected with role-based access and encryption.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4 - Smart Referrals (4 cols) */}
              <div className="flex p-px lg:col-span-4 w-full">
                <div className="overflow-hidden rounded-lg bg-neutral-50 bento-card max-lg:rounded-b-[2rem] lg:rounded-br-[2rem] w-full">
                  <ReferralFlow />
                  <div className="p-6 lg:p-10">
                    <h3 className="text-xs lg:text-sm/4 font-semibold text-neutral-500">Smart Referrals</h3>
                    <p className="mt-2 text-base lg:text-lg font-bold font-display tracking-tight">Streamlined client referrals</p>
                    <p className="mt-2 max-w-lg text-xs lg:text-sm/6 text-neutral-500">
                      Match clients to resources and send referrals with just a few clicks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Analytics */}
          <section className="py-20">
            <h2 className="text-center text-base/7 font-semibold text-teal-400">Powerful Insights</h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-2xl sm:text-4xl font-semibold tracking-tight text-balance sm:text-5xl font-display">
              Track resource usage and availability
            </p>
            <div className="h-auto sm:h-[600px] mt-16 shrink-0 overflow-hidden [mask-image:radial-gradient(white_30%,transparent_90%)]" style={{ perspective: '4000px' }}>
              <div style={{ transform: 'translateY(-40px) translateZ(-100px) rotateX(10deg) rotateY(20deg) rotateZ(-10deg)', transformStyle: 'preserve-3d' }} className="scale-150 sm:scale-100">
                <Image src="/chart-dashboard-light.jpg" alt="Analytics" width={1200} height={600} className="rounded-lg border border-neutral-200" />
              </div>
            </div>

          </section>

        </div>
      </main>

      {/* Globe Sunset Section + Footer */}
      <div className="relative">
        {/* Globe Section - positioned to create sunset effect */}
        <section className="relative flex flex-col items-center justify-center pt-20 pb-0 overflow-visible">

          {/* Access CTA - layered on top of globe */}
          <div id="access" className="scroll-mt-24 max-w-2xl mx-auto text-center relative z-10 px-4">
            <p className="text-sm font-semibold text-teal-500">Not with Stand Up for Kids?</p>
            <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight font-display">
              Interested in bringing CaseLoop to your organization?
            </p>
            <p className="mt-3 text-base text-neutral-500">
              Request early access to be notified when we expand to other nonprofits.
            </p>
            <div className="mt-5">
              <Button
                onClick={handleRequestAccess}
                className="rounded-xl bg-teal-500 hover:bg-teal-600 h-11 px-6"
              >
                Request Access
              </Button>
            </div>
          </div>

          {/* Globe container - behind footer */}
          <div className="relative w-full max-w-[600px] mx-auto mt-4 mb-[-300px] z-0">
            <Globe className="mx-auto !w-[600px] !h-[600px] !max-w-none" />
          </div>
        </section>

        {/* Footer - in front of globe */}
        <div className="p-4 pt-0 relative z-10">
          <footer id="contact" className="scroll-mt-24 bg-neutral-100 rounded-3xl overflow-hidden bento-card">
          <div className="mx-auto max-w-6xl px-6 pt-16 pb-8 sm:pt-24 lg:px-8 lg:pt-32">
            <div className="flex flex-col sm:flex-row justify-between gap-8">
              <div className="space-y-4">
                <Link href="/" className="flex items-center gap-2">
                  <p className="font-bold font-display text-xl text-neutral-900">CaseLoop</p>
                </Link>
                <p className="text-sm/6 text-balance text-neutral-600 max-w-xs">
                  The modern way for case managers to find and share social service resources.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
                <div>
                  <h3 className="text-sm/6 font-semibold text-neutral-900">Contact Us</h3>
                  <p className="mt-2 text-sm text-neutral-500 max-w-xs">
                    Have questions? Reach out to our team.
                  </p>
                  <a
                    href="mailto:contact@standupforkids.org"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-teal-500 hover:text-teal-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    contact@standupforkids.org
                  </a>
                </div>
                <div>
                  <h3 className="text-sm/6 font-semibold text-neutral-900">Legal</h3>
                  <ul className="mt-4 space-y-3">
                    <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900">Terms</a></li>
                    <li><a href="#" className="text-sm text-neutral-500 hover:text-neutral-900">Privacy</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-neutral-200 pt-8">
              <p className="text-sm/6 text-neutral-500">&copy; 2025 CaseLoop. All rights reserved.</p>
            </div>
          </div>
        </footer>
        </div>
      </div>
    </div>
  )
}
