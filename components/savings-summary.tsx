"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/store"
import { MONTHS, type Currency, type Expense, type Payslip } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus, PiggyBank, AlertCircle, DollarSign } from "lucide-react"

interface SavingsSummaryProps {
  expenses: Expense[]
  payslips: Payslip[]
  selectedPeriod: string
  viewMode: "monthly" | "yearly"
}

interface MonthlySavings {
  month: string
  monthLabel: string
  income: number
  expenses: number
  savings: number
}

interface CurrencyTotals {
  income: number
  expenses: number
  savings: number
}

function CurrencySavingsSection({
  title,
  currency,
  currencySymbol,
  payslips,
  expenses,
  selectedPeriod,
  viewMode,
}: {
  title: string
  currency: Currency
  currencySymbol: string
  payslips: Payslip[]
  expenses: Expense[]
  selectedPeriod: string
  viewMode: "monthly" | "yearly"
}) {
  const filteredPayslips = useMemo(() => payslips.filter((p) => p.currency === currency), [payslips, currency])
  const filteredExpenses = useMemo(() => expenses.filter((e) => e.currency === currency), [expenses, currency])

  const savingsData = useMemo(() => {
    if (viewMode === "monthly") {
      const [year, monthNum] = selectedPeriod.split("-").map(Number)
      const monthKey = selectedPeriod

      const monthPayslips = filteredPayslips.filter((p) => p.month === monthKey)
      const monthExpenses = filteredExpenses.filter((e) => {
        const date = new Date(e.date)
        return date.getFullYear() === year && date.getMonth() + 1 === monthNum
      })

      const income = monthPayslips.reduce((sum, p) => sum + p.netSalary, 0)
      const expenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0)

      return [
        {
          month: monthKey,
          monthLabel: `${MONTHS[monthNum - 1]} ${year}`,
          income,
          expenses: expenseTotal,
          savings: income - expenseTotal,
        },
      ]
    } else {
      const year = parseInt(selectedPeriod)
      const monthsData: MonthlySavings[] = []

      for (let month = 1; month <= 12; month++) {
        const monthKey = `${year}-${String(month).padStart(2, "0")}`

        const monthPayslips = filteredPayslips.filter((p) => p.month === monthKey)
        const monthExpenses = filteredExpenses.filter((e) => {
          const date = new Date(e.date)
          return date.getFullYear() === year && date.getMonth() + 1 === month
        })

        if (monthPayslips.length > 0 || monthExpenses.length > 0) {
          const income = monthPayslips.reduce((sum, p) => sum + p.netSalary, 0)
          const expenseTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0)

          monthsData.push({
            month: monthKey,
            monthLabel: MONTHS[month - 1],
            income,
            expenses: expenseTotal,
            savings: income - expenseTotal,
          })
        }
      }

      return monthsData
    }
  }, [filteredExpenses, filteredPayslips, selectedPeriod, viewMode])

  const totals = useMemo(() => {
    return savingsData.reduce(
      (acc, month) => ({
        income: acc.income + month.income,
        expenses: acc.expenses + month.expenses,
        savings: acc.savings + month.savings,
      }),
      { income: 0, expenses: 0, savings: 0 }
    )
  }, [savingsData])

  const savingsRate = totals.income > 0 ? (totals.savings / totals.income) * 100 : 0

  const renderSavingsValue = (amount: number) => {
    if (amount > 0) {
      return (
        <span className="text-primary flex items-center gap-1">
          <TrendingUp className="size-3" />
          +{formatCurrency(amount, currency)}
        </span>
      )
    } else if (amount < 0) {
      return (
        <span className="text-destructive flex items-center gap-1">
          <TrendingDown className="size-3" />
          {formatCurrency(amount, currency)}
        </span>
      )
    }
    return (
      <span className="text-muted-foreground flex items-center gap-1">
        <Minus className="size-3" />
        {formatCurrency(0, currency)}
      </span>
    )
  }

  const hasNoData = savingsData.length === 0 || (totals.income === 0 && totals.expenses === 0)

  if (hasNoData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="size-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">({currencySymbol})</span>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="size-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No data for this period</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add {currency} payslips and expenses to see your savings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="size-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm text-muted-foreground">({currencySymbol})</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Income (Net)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-primary">{formatCurrency(totals.income, currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">From payslips</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono text-destructive">
              -{formatCurrency(totals.expenses, currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <PiggyBank className="size-3" />
              Net Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">{renderSavingsValue(totals.savings)}</div>
            <p className="text-xs text-muted-foreground mt-1">{totals.savings >= 0 ? "You saved!" : "Overspent"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold font-mono ${savingsRate >= 0 ? "text-primary" : "text-destructive"}`}>
              {savingsRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {savingsRate >= 20 ? "Great!" : savingsRate >= 0 ? "Keep saving" : "Review budget"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown Table for yearly view */}
      {viewMode === "yearly" && savingsData.length > 1 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Income</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savingsData.map((month) => {
                  const monthRate = month.income > 0 ? (month.savings / month.income) * 100 : 0
                  return (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.monthLabel}</TableCell>
                      <TableCell className="text-right font-mono text-primary">
                        {month.income > 0 ? formatCurrency(month.income, currency) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive">
                        {month.expenses > 0 ? `-${formatCurrency(month.expenses, currency)}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {month.income > 0 || month.expenses > 0 ? renderSavingsValue(month.savings) : "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${monthRate >= 0 ? "text-primary" : "text-destructive"}`}
                      >
                        {month.income > 0 ? `${monthRate.toFixed(1)}%` : "-"}
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-mono font-bold text-primary">
                    {formatCurrency(totals.income, currency)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-destructive">
                    -{formatCurrency(totals.expenses, currency)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">{renderSavingsValue(totals.savings)}</TableCell>
                  <TableCell
                    className={`text-right font-mono font-bold ${savingsRate >= 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {savingsRate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Single month detailed view */}
      {viewMode === "monthly" && savingsData.length === 1 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">{savingsData[0].monthLabel} Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground text-sm">Net Income from Payslips</span>
              <span className="font-mono text-primary font-medium">
                {formatCurrency(savingsData[0].income, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground text-sm">Total Expenses</span>
              <span className="font-mono text-destructive font-medium">
                -{formatCurrency(savingsData[0].expenses, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Net Savings</span>
              <span className="font-mono text-lg font-bold">{renderSavingsValue(savingsData[0].savings)}</span>
            </div>
            {savingsData[0].income > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Savings Rate</p>
                <p
                  className={`text-2xl font-bold font-mono ${savingsRate >= 0 ? "text-primary" : "text-destructive"}`}
                >
                  {savingsRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {savingsRate >= 30
                    ? "Excellent savings!"
                    : savingsRate >= 20
                      ? "Good savings rate"
                      : savingsRate >= 10
                        ? "Moderate savings"
                        : savingsRate >= 0
                          ? "Low savings"
                          : "Overspending"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function SavingsSummary({ expenses, payslips, selectedPeriod, viewMode }: SavingsSummaryProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* American Account Section */}
      <CurrencySavingsSection
        title="American Account"
        currency="USD"
        currencySymbol="$"
        payslips={payslips}
        expenses={expenses}
        selectedPeriod={selectedPeriod}
        viewMode={viewMode}
      />

      {/* Israeli Account Section */}
      <CurrencySavingsSection
        title="Israeli Account"
        currency="ILS"
        currencySymbol="₪"
        payslips={payslips}
        expenses={expenses}
        selectedPeriod={selectedPeriod}
        viewMode={viewMode}
      />
    </div>
  )
}
