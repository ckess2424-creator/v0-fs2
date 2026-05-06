"use client"

import { useState } from "react"
import { ExpenseDashboard } from "@/components/expense-dashboard"
import { AuthScreen } from "@/components/auth-screen"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return <ExpenseDashboard />
}
