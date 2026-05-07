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

  const [selectedPeriod, setSelectedPeriod] = useState<string>(currentMonthKey)

  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly")

  const [transferForm, setTransferForm] = useState({
    from: "",
    to: "",
    amount: "",
  })

  const [monthlyNotes, setMonthlyNotes] = useState<Record<string, string>>({})

  const [noteInput, setNoteInput] = useState("")

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

        return (
          date.getFullYear() === year &&
          date.getMonth() + 1 === month
        )
      })
    }
  }, [data.expenses, selectedPeriod, viewMode])

  const usdExpenses = filteredExpenses.filter(
    (e) => e.currency === "USD"
  )

  const ilsExpenses = filteredExpenses.filter(
    (e) => e.currency === "ILS"
  )

  const usdTotal = usdExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  )

  const ilsTotal = ilsExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  )

  const usAccounts = data.accounts.filter(
    (a) => a.currency === "USD"
  )

  const ilAccount = data.accounts.find(
    (a) => a.currency === "ILS"
  )

  const totalUSBalance = usAccounts.reduce(
    (sum, a) => sum + a.balance,
    0
  )

  const totalILBalance = ilAccount?.balance || 0

  function addTransfer() {
    const amount = parseFloat(transferForm.amount)

    if (!amount || !transferForm.from || !transferForm.to) return

    updateAccountBalance(transferForm.from, -amount)

    updateAccountBalance(transferForm.to, amount)

    setTransferForm({
      from: "",
      to: "",
      amount: "",
    })
  }

  function saveMonthlyNote() {
    setMonthlyNotes((prev) => ({
      ...prev,
      [selectedPeriod]: noteInput,
    }))

    setNoteInput("")
  }

  function addDetailedExpense(expense: any) {
    addExpense({
      ...expense,
      date: expense.date || new Date().toISOString(),
      notes: expense.notes || "",
      description: expense.description || "",
    })
  }

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
                <span className="hidden sm:inline">
                  Expenses
                </span>
              </TabsTrigger>

              <TabsTrigger value="accounts" className="gap-1.5">
                <Wallet className="size-4" />
                <span className="hidden sm:inline">
                  Accounts
                </span>
              </TabsTrigger>

              <TabsTrigger value="payslips" className="gap-1.5">
                <DollarSign className="size-4" />
                <span className="hidden sm:inline">
                  Payslips
                </span>
              </TabsTrigger>

              <TabsTrigger value="savings" className="gap-1.5">
                <PiggyBank className="size-4" />
                <span className="hidden sm:inline">
                  Savings
                </span>
              </TabsTrigger>

              <TabsTrigger value="transfers" className="gap-1.5">
                <Wallet className="size-4" />
                <span className="hidden sm:inline">
                  Transfers
                </span>
              </TabsTrigger>

            </TabsList>
          </div>

          <TabsContent value="expenses" className="space-y-6">

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
                    <SelectItem value="monthly">
                      Monthly
                    </SelectItem>

                    <SelectItem value="yearly">
                      Yearly
                    </SelectItem>
                  </SelectContent>
                </Select>

                {viewMode === "monthly" ? (
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
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
                  <Select
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem
                          key={year}
                          value={year.toString()}
                        >
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="size-4" />
                    USD Spending
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold font-mono">
                    {formatCurrency(usdTotal, "USD")}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    {usdExpenses.length} expenses
                  </div>
                </CardContent>
              </Card>

            </div>

            <div className="grid lg:grid-cols-2 gap-6">

              <div className="space-y-4">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      USD $
                    </Badge>

                    <h2 className="font-semibold">
                      American Account
                    </h2>
                  </div>

                  <ExpenseForm
                    defaultCurrency="USD"
                    onSubmit={addDetailedExpense}
                  />
                </div>

                <SpendingSummary
                  expenses={filteredExpenses}
                  currency="USD"
                  title="Category Breakdown"
                />

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Recent Expenses
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-0">
                    <ExpenseTable
                      expenses={usdExpenses}
                      onDelete={deleteExpense}
                    />
                  </CardContent>
                </Card>

              </div>

              <div className="space-y-4">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">

                    <Badge variant="outline" className="font-mono">
                      ILS ₪
                    </Badge>

                    <h2 className="font-semibold">
                      Israeli Account
                    </h2>

                  </div>

                  <ExpenseForm
                    defaultCurrency="ILS"
                    onSubmit={addDetailedExpense}
                  />
                </div>

                <SpendingSummary
                  expenses={filteredExpenses}
                  currency="ILS"
                  title="Category Breakdown"
                />

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Recent Expenses
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-0">
                    <ExpenseTable
                      expenses={ilsExpenses}
                      onDelete={deleteExpense}
                    />
                  </CardContent>
                </Card>

              </div>

            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">

            <div>
              <h2 className="text-lg font-semibold mb-4">
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

          </TabsContent>

          <TabsContent value="payslips" className="space-y-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Payslip Tracker
                </h2>

                <p className="text-sm text-muted-foreground">
                  Track and compare your income before and after taxes
                </p>
              </div>

              <PayslipForm onSubmit={addPayslip} />
            </div>

            <PayslipCompare
              payslips={data.payslips}
              onDelete={deletePayslip}
            />

          </TabsContent>

          <TabsContent value="transfers" className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>
                  Transfer Between Accounts
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">

                <Select
                  value={transferForm.from}
                  onValueChange={(v) =>
                    setTransferForm((prev) => ({
                      ...prev,
                      from: v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="From account" />
                  </SelectTrigger>

                  <SelectContent>
                    {data.accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({a.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={transferForm.to}
                  onValueChange={(v) =>
                    setTransferForm((prev) => ({
                      ...prev,
                      to: v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="To account" />
                  </SelectTrigger>

                  <SelectContent>
                    {data.accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({a.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <input
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded"
                  placeholder="Amount"
                  value={transferForm.amount}
                  onChange={(e) =>
                    setTransferForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                />

                <Button onClick={addTransfer}>
                  Transfer
                </Button>

              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="savings" className="space-y-6">

            <SavingsSummary
              expenses={data.expenses}
              payslips={data.payslips}
              selectedPeriod={selectedPeriod}
              viewMode={viewMode}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Monthly Notes
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">

                <textarea
                  className="w-full p-3 rounded bg-zinc-900 border border-zinc-700"
                  placeholder="Why was this month expensive?"
                  value={noteInput}
                  onChange={(e) =>
                    setNoteInput(e.target.value)
                  }
                />

                <Button onClick={saveMonthlyNote}>
                  Save Monthly Note
                </Button>

                {monthlyNotes[selectedPeriod] && (
                  <div className="rounded border border-zinc-700 p-3 text-sm text-muted-foreground">
                    {monthlyNotes[selectedPeriod]}
                  </div>
                )}

              </CardContent>
            </Card>

          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
