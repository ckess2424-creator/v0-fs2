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
import { useFinanceData, formatCurrency, getMonthKey, parseMonthKey } from "@/lib/store"
import { MONTHS } from "@/lib/types"
import { useAuth } from "./auth-screen"
import { DollarSign, Receipt, Wallet, Calendar, TrendingUp, TrendingDown, LogOut, PiggyBank } from "lucide-react"

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

  const [selectedPeriod, setSelectedPeriod] = useState<string>(currentMonthKey)
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly")

  // Generate available periods
  const availablePeriods = useMemo(() => {
    const periods: { key: string; label: string }[] = []
    const years = new Set<number>()
    
    // Get years from expenses
    data.expenses.forEach((e) => {
      const date = new Date(e.date)
      years.add(date.getFullYear())
    })
    
    // Add current year
    years.add(currentYear)
    
    // Generate months for each year
    Array.from(years)
      .sort((a, b) => b - a)
      .forEach((year) => {
        for (let month = 11; month >= 0; month--) {
          const key = `${year}-${String(month + 1).padStart(2, "0")}`
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

  // Filter expenses based on selected period
  const filteredExpenses = useMemo(() => {
    if (viewMode === "yearly") {
      const year = parseInt(selectedPeriod)
      return data.expenses.filter((e) => {
        const date = new Date(e.date)
        return date.getFullYear() === year
      })
    } else {
      const { year, month } = parseMonthKey(selectedPeriod)
      return data.expenses.filter((e) => {
        const date = new Date(e.date)
        return date.getFullYear() === year && date.getMonth() + 1 === month
      })
    }
  }, [data.expenses, selectedPeriod, viewMode])

  const usdExpenses = filteredExpenses.filter((e) => e.currency === "USD")
  const ilsExpenses = filteredExpenses.filter((e) => e.currency === "ILS")

  const usdTotal = usdExpenses.reduce((sum, e) => sum + e.amount, 0)
  const ilsTotal = ilsExpenses.reduce((sum, e) => sum + e.amount, 0)

  const usAccounts = data.accounts.filter((a) => a.currency === "USD")
  const ilAccount = data.accounts.find((a) => a.currency === "ILS")

  const totalUSBalance = usAccounts.reduce((sum, a) => sum + a.balance, 0)
  const totalILBalance = ilAccount?.balance || 0

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Expense Tracker</h1>
                <p className="text-sm text-muted-foreground">Track your spending across accounts</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4 mr-2" />
              Lock
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="expenses" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="expenses" className="gap-1.5">
                <Receipt className="size-4" />
                <span className="hidden sm:inline">Expenses</span>
              </TabsTrigger>
              <TabsTrigger value="accounts" className="gap-1.5">
                <Wallet className="size-4" />
                <span className="hidden sm:inline">Accounts</span>
              </TabsTrigger>
              <TabsTrigger value="payslips" className="gap-1.5">
                <DollarSign className="size-4" />
                <span className="hidden sm:inline">Payslips</span>
              </TabsTrigger>
              <TabsTrigger value="savings" className="gap-1.5">
                <PiggyBank className="size-4" />
                <span className="hidden sm:inline">Savings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="expenses" className="space-y-6">
            {/* Period Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <Select
                  value={viewMode}
                  onValueChange={(v) => {
                    setViewMode(v as "monthly" | "yearly")
                    if (v === "yearly") {
                      setSelectedPeriod(currentYear.toString())
                    } else {
                      setSelectedPeriod(currentMonthKey)
                    }
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>

                {viewMode === "monthly" ? (
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePeriods.map((p) => (
                        <SelectItem key={p.key} value={p.key}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="size-4" />
                    USD Spending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{formatCurrency(usdTotal, "USD")}</div>
                  <div className="text-xs text-muted-foreground mt-1">{usdExpenses.length} expenses</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="size-4" />
                    ILS Spending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{formatCurrency(ilsTotal, "ILS")}</div>
                  <div className="text-xs text-muted-foreground mt-1">{ilsExpenses.length} expenses</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    US Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-primary">{formatCurrency(totalUSBalance, "USD")}</div>
                  <div className="text-xs text-muted-foreground mt-1">2 accounts</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    IL Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono text-primary">{formatCurrency(totalILBalance, "ILS")}</div>
                  <div className="text-xs text-muted-foreground mt-1">1 account</div>
                </CardContent>
              </Card>
            </div>

            {/* Expense Sections */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* American Account */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">USD $</Badge>
                    <h2 className="font-semibold">American Account</h2>
                  </div>
                  <ExpenseForm defaultCurrency="USD" onSubmit={addExpense} />
                </div>
                <SpendingSummary expenses={filteredExpenses} currency="USD" title="Category Breakdown" />
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recent Expenses</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ExpenseTable expenses={usdExpenses} onDelete={deleteExpense} />
                  </CardContent>
                </Card>
              </div>

              {/* Israeli Account */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">ILS ₪</Badge>
                    <h2 className="font-semibold">Israeli Account</h2>
                  </div>
                  <ExpenseForm defaultCurrency="ILS" onSubmit={addExpense} />
                </div>
                <SpendingSummary expenses={filteredExpenses} currency="ILS" title="Category Breakdown" />
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recent Expenses</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ExpenseTable expenses={ilsExpenses} onDelete={deleteExpense} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Badge variant="outline" className="font-mono">USD $</Badge>
                American Accounts
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

            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Badge variant="outline" className="font-mono">ILS ₪</Badge>
                Israeli Account
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {ilAccount && (
                  <AccountCard
                    account={ilAccount}
                    balanceHistory={getBalanceHistory(ilAccount.id)}
                    onUpdateBalance={updateAccountBalance}
                    onDeleteHistoryEntry={deleteBalanceHistoryEntry}
                  />
                )}
              </div>
            </div>

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total USD</div>
                    <div className="text-3xl font-bold font-mono text-primary">
                      {formatCurrency(totalUSBalance, "USD")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total ILS</div>
                    <div className="text-3xl font-bold font-mono text-primary">
                      {formatCurrency(totalILBalance, "ILS")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payslips" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Payslip Tracker</h2>
                <p className="text-sm text-muted-foreground">Track and compare your income before and after taxes</p>
              </div>
              <PayslipForm onSubmit={addPayslip} />
            </div>

            <PayslipCompare payslips={data.payslips} onDelete={deletePayslip} />
          </TabsContent>

          <TabsContent value="savings" className="space-y-6">
            {/* Period Selector for Savings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Savings Overview</h2>
                <p className="text-sm text-muted-foreground">Compare your income vs expenses to see what you saved</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <Select
                  value={viewMode}
                  onValueChange={(v) => {
                    setViewMode(v as "monthly" | "yearly")
                    if (v === "yearly") {
                      setSelectedPeriod(currentYear.toString())
                    } else {
                      setSelectedPeriod(currentMonthKey)
                    }
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>

                {viewMode === "monthly" ? (
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePeriods.map((p) => (
                        <SelectItem key={p.key} value={p.key}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <SavingsSummary 
              expenses={data.expenses} 
              payslips={data.payslips} 
              selectedPeriod={selectedPeriod}
              viewMode={viewMode}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
