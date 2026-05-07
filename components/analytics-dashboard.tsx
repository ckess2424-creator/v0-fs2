"use client"

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#eab308",
]

export function AnalyticsDashboard({
  expenses,
  payslips,
}: {
  expenses: any[]
  payslips: any[]
}) {

  /* ---------------- CATEGORY DATA ---------------- */

  const categoryMap: Record<string, number> = {}

  expenses.forEach((expense) => {
    const category = expense.category || "Other"

    if (!categoryMap[category]) {
      categoryMap[category] = 0
    }

    categoryMap[category] += expense.amount
  })

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }))

  /* ---------------- MONTHLY DATA ---------------- */

  const monthlyMap: Record<string, { expenses: number; income: number }> = {}

  expenses.forEach((expense) => {
    const date = new Date(expense.date)
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`

    if (!monthlyMap[month]) {
      monthlyMap[month] = {
        expenses: 0,
        income: 0,
      }
    }

    monthlyMap[month].expenses += expense.amount
  })

  payslips.forEach((pay) => {
    const date = new Date(pay.date)
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`

    if (!monthlyMap[month]) {
      monthlyMap[month] = {
        expenses: 0,
        income: 0,
      }
    }

    monthlyMap[month].income += pay.netIncome || pay.net || 0
  })

  const monthlyData = Object.entries(monthlyMap).map(([month, values]) => ({
    month,
    expenses: values.expenses,
    income: values.income,
    savings: values.income - values.expenses,
  }))

  /* ---------------- TOTALS ---------------- */

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  )

  const totalIncome = payslips.reduce(
    (sum, p) => sum + (p.netIncome || p.net || 0),
    0
  )

  const totalSavings = totalIncome - totalExpenses

  return (
    <div className="space-y-6">

      {/* TOP CARDS */}

      <div className="grid md:grid-cols-3 gap-4">

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              ${totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold text-red-400">
              ${totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Total Savings</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold text-purple-400">
              ${totalSavings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* LINE CHART */}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Monthly Financial Trends</CardTitle>
        </CardHeader>

        <CardContent className="h-[350px]">

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="savings"
                stroke="#8b5cf6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>

        </CardContent>
      </Card>

      {/* CATEGORY BREAKDOWN */}

      <div className="grid lg:grid-cols-2 gap-6">

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>

          <CardContent className="h-[350px]">

            <ResponsiveContainer width="100%" height="100%">

              <PieChart>

                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </CardContent>
        </Card>

        {/* BAR CHART */}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Savings Per Month</CardTitle>
          </CardHeader>

          <CardContent className="h-[350px]">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={monthlyData}>
                <CartesianGrid stroke="#333" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="savings"
                  fill="#8b5cf6"
                />

              </BarChart>

            </ResponsiveContainer>

          </CardContent>
        </Card>

      </div>
    </div>
  )
}
