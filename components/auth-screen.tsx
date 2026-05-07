"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"

const AUTH_KEY = "expense-tracker-auth"
const SESSION_KEY = "expense-tracker-session"

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "expense-tracker-salt")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

interface AuthScreenProps {
  onAuthenticated: () => void
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isNewUser, setIsNewUser] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY)
    setIsNewUser(!storedAuth)
    
    // Check if there's an active session
    const session = sessionStorage.getItem(SESSION_KEY)
    if (session && storedAuth) {
      onAuthenticated()
    }
    setIsLoading(false)
  }, [onAuthenticated])

  const handleSetup = async () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    const hashedPassword = await hashPassword(password)
    localStorage.setItem(AUTH_KEY, hashedPassword)
    localStorage.setItem(SESSION_KEY, "authenticated")
    onAuthenticated()
  }

  const handleLogin = async () => {
    const storedHash = localStorage.getItem(AUTH_KEY)
    const hashedInput = await hashPassword(password)

    if (hashedInput === storedHash) {
      localStorage.setItem(SESSION_KEY, "authenticated")
      onAuthenticated()
    } else {
      setError("Incorrect password")
      setPassword("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (isNewUser) {
      handleSetup()
    } else {
      handleLogin()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">
              {isNewUser ? "Secure Your Data" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="mt-2">
              {isNewUser
                ? "Create a password to protect your financial information"
                : "Enter your password to access your expense tracker"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isNewUser ? "Create a password" : "Enter your password"}
                  className="pl-10 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {isNewUser && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button type="submit" className="w-full">
              {isNewUser ? "Create Password & Continue" : "Unlock"}
            </Button>

            {isNewUser && (
              <p className="text-xs text-muted-foreground text-center">
                Your password is stored locally and encrypted. Make sure to remember it as there is no recovery option.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function useAuth() {
  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    window.location.reload()
  }

  const resetPassword = () => {
    if (confirm("This will delete all your data and reset your password. Are you sure?")) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  return { logout, resetPassword }
}
