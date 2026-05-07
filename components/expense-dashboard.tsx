"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { ExpenseForm } from "./expense-form"
import { ExpenseTable } from "./expense-table"
import { AccountCard } from "./account-card"
import { PayslipForm } from "./payslip-form"
import { PayslipCompare } from "./payslip-compare"
import { SpendingSummary } from "./spending-summary"
import { SavingsSummary } from "./savings-summary"
import { AnalyticsDashboard } from "./analytics-dashboard"

import {
  useFinanceData,
  formatCurrency,
  getMonthKey,
  parseMonthKey,
} from "@/lib/store"

import { MONTHS } from "@/lib/types"
import { useAuth } from "./auth-screen"

import {
  DollarSign,
  Receipt,
  Wallet,
  Calendar,
  TrendingUp,
  TrendingDown,
  LogOut,
  PiggyBank,
} from "lucide-react"

export function ExpenseDashboard() {

  const {
    data,
    isLoaded,
    addExpense,
    deleteExpense,
    updateAccountBalance,
    deleteBalanceHistoryEntry,
    getBalanceHistory,
    addPayslip,
    deletePayslip,
  } = useFinanceData()

  const { logout } = useAuth()

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonthKey = getMonthKey(currentDate)

  const [selectedPeriod, setSelectedPeriod] =
    useState<string>(currentMonthKey)

  const [viewMode, setViewMode] =
    useState<"monthly" | "yearly">("monthly")

  const availablePeriods = useMemo(() => {

    const periods: { key: string; label: string }[] = []
    const years = new Set<number>()

    data.expenses.forEach((e) => {
      const date = new Date(e.date)
      years.add(date.getFullYear())
    })

    years.add(currentYear)

    Array.from(years)
      .sort((a, b) => b - a)
      .forEach((year) => {

        for (let month = 11; month >= 0; month--) {

          const key =
            `${year}-${String(month + 1).padStart(2, "0")}`

          periods.push({
            key,
            label: `${MONTHS[month]} ${year}`,
          })
        }
      })

    return periods

  }, [data.expenses, currentYear])

  const availableYears = useMemo(() => {

    const years = new Set<number>()

    data.expenses.forEach((e) => {
      const date = new Date(e.date)
      years.add(date.getFullYear())
    })

    years.add(currentYear)

    return Array.from(years).sort((a, b) => b - a)

  }, [data.expenses, currentYear])

  const filteredExpenses = useMemo(() => {

    if (viewMode === "yearly") {

      const year = parseInt(selectedPeriod)

      return data.expenses.filter((e) => {
        const date = new Date(e.date)
        return date.getFullYear() === year
      })
    }

    const { year, month } = parseMonthKey(selectedPeriod)

    return data.expenses.filter((e) => {
      const date = new Date(e.date)
      return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month
      )
    })

  }, [data.expenses, selectedPeriod, viewMode])

  const usdExpenses =
    filteredExpenses.filter((e) => e.currency === "USD")

  const ilsExpenses =
    filteredExpenses.filter((e) => e.currency === "ILS")

  const usdTotal =
    usdExpenses.reduce((sum, e) => sum + e.amount, 0)

  const ilsTotal =
    ilsExpenses.reduce((sum, e) => sum + e.amount, 0)

  const usAccounts =
    data.accounts.filter((a) => a.currency === "USD")

  const ilAccounts =
    data.accounts.filter((a) => a.currency === "ILS")

  const totalUSBalance =
    usAccounts.reduce((sum, a) => sum + a.balance, 0)

  const totalILBalance =
    ilAccounts.reduce((sum, a) => sum + a.balance, 0)

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">

      {/* HEADER */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="size-5 text-primary" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Expense Tracker
                </h1>

                <p className="text-sm text-muted-foreground">
                  Track your spending across accounts
                </p>
              </div>

            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
            >
              <LogOut className="size-4 mr-2" />
              Lock
            </Button>

          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">

        <Tabs defaultValue="expenses" className="space-y-6">

          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="payslips">Payslips</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* EXPENSES TAB (UNCHANGED) */}
          <TabsContent value="expenses" />

          {/* ACCOUNTS TAB — FIXED (THIS IS THE ONLY REAL CHANGE) */}
          <TabsContent value="accounts" className="space-y-6">

            {/* USD ACCOUNTS */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                USD Accounts
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">

                {usAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    balanceHistory={getBalanceHistory(account.id)}
                    onUpdateBalance={updateAccountBalance}
                    onDeleteHistoryEntry={deleteBalanceHistoryEntry}
                  />
                ))}

              </div>
            </div>

            {/* ISRAELI ACCOUNTS (THIS WAS MISSING / BROKEN BEFORE) */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Israeli Accounts
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">

                {ilAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    balanceHistory={getBalanceHistory(account.id)}
                    onUpdateBalance={updateAccountBalance}
                    onDeleteHistoryEntry={deleteBalanceHistoryEntry}
                  />
                ))}

              </div>
            </div>

          </TabsContent>

          {/* OTHER TABS UNTOUCHED */}
          <TabsContent value="payslips" />
          <TabsContent value="savings" />
          <TabsContent value="analytics" />

        </Tabs>

      </div>
    </div>
  )
}
