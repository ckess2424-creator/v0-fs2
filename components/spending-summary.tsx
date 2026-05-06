"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Expense } from "@/lib/types"
import { formatCurrency } from "@/lib/store"
import { EXPENSE_CATEGORIES } from "@/lib/types"

interface SpendingSummaryProps {
  expenses: Expense[]
  currency: "USD" | "ILS"
  title: string
}

const categoryColors: Record<string, string> = {
  Housing: "bg-blue-500",
  Utilities: "bg-yellow-500",
  Food: "bg-green-500",
  Transportation: "bg-orange-500",
  Healthcare: "bg-red-500",
  Entertainment: "bg-purple-500",
  Shopping: "bg-pink-500",
  Education: "bg-indigo-500",
  Travel: "bg-cyan-500",
  Other: "bg-gray-500",
}

export function SpendingSummary({ expenses, currency, title }: SpendingSummaryProps) {
  const filteredExpenses = expenses.filter((e) => e.currency === currency)
  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const categoryTotals = EXPENSE_CATEGORIES.map((category) => {
    const categoryExpenses = filteredExpenses.filter((e) => e.category === category)
    const amount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
    return { category, amount, count: categoryExpenses.length }
  })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Badge variant="outline" className="font-mono">
            {currency}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-mono mb-4">
          {formatCurrency(total, currency)}
        </div>

        {categoryTotals.length > 0 ? (
          <div className="space-y-3">
            {categoryTotals.map(({ category, amount, count }) => {
              const percentage = total > 0 ? (amount / total) * 100 : 0
              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${categoryColors[category]}`} />
                      <span>{category}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </div>
                    <span className="font-mono">{formatCurrency(amount, currency)}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${categoryColors[category]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">No expenses this period</div>
        )}
      </CardContent>
    </Card>
  )
}
