"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowRight, TrendingDown, TrendingUp, Trash2 } from "lucide-react"
import type { Payslip } from "@/lib/types"
import { formatCurrency } from "@/lib/store"
import { MONTHS } from "@/lib/types"

interface PayslipCompareProps {
  payslips: Payslip[]
  onDelete: (id: string) => void
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-")
  return `${MONTHS[parseInt(month) - 1]} ${year}`
}

export function PayslipCompare({ payslips, onDelete }: PayslipCompareProps) {
  const sortedPayslips = [...payslips].sort((a, b) => b.month.localeCompare(a.month))
  const [leftId, setLeftId] = useState<string | null>(sortedPayslips[1]?.id || null)
  const [rightId, setRightId] = useState<string | null>(sortedPayslips[0]?.id || null)

  const leftPayslip = payslips.find((p) => p.id === leftId)
  const rightPayslip = payslips.find((p) => p.id === rightId)

  if (payslips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground text-sm">No payslips recorded</div>
        <div className="text-muted-foreground/60 text-xs mt-1">
          Add your first payslip to start tracking income
        </div>
      </div>
    )
  }

  const renderDiff = (left: number | undefined, right: number | undefined, currency: "USD" | "ILS") => {
    if (left === undefined || right === undefined) return null
    const diff = right - left
    const percentChange = left !== 0 ? ((diff / left) * 100).toFixed(1) : "0"
    
    if (diff === 0) return <span className="text-muted-foreground">No change</span>
    
    return (
      <span className={diff > 0 ? "text-green-400" : "text-red-400"}>
        {diff > 0 ? <TrendingUp className="inline size-3 mr-1" /> : <TrendingDown className="inline size-3 mr-1" />}
        {diff > 0 ? "+" : ""}{formatCurrency(diff, currency)} ({diff > 0 ? "+" : ""}{percentChange}%)
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Select value={leftId || ""} onValueChange={setLeftId}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select payslip" />
          </SelectTrigger>
          <SelectContent>
            {sortedPayslips.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {formatMonth(p.month)} ({p.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <ArrowRight className="size-5 text-muted-foreground hidden sm:block" />
        
        <Select value={rightId || ""} onValueChange={setRightId}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select payslip" />
          </SelectTrigger>
          <SelectContent>
            {sortedPayslips.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {formatMonth(p.month)} ({p.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {leftPayslip && rightPayslip && leftPayslip.currency === rightPayslip.currency ? (
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gross Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-mono">{formatCurrency(leftPayslip.grossSalary, leftPayslip.currency)}</div>
                  <div className="text-xs text-muted-foreground">{formatMonth(leftPayslip.month)}</div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
                <div className="text-right">
                  <div className="text-lg font-mono">{formatCurrency(rightPayslip.grossSalary, rightPayslip.currency)}</div>
                  <div className="text-xs text-muted-foreground">{formatMonth(rightPayslip.month)}</div>
                </div>
              </div>
              <div className="mt-2 text-sm">
                {renderDiff(leftPayslip.grossSalary, rightPayslip.grossSalary, leftPayslip.currency)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-mono text-primary">{formatCurrency(leftPayslip.netSalary, leftPayslip.currency)}</div>
                  <div className="text-xs text-muted-foreground">{formatMonth(leftPayslip.month)}</div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
                <div className="text-right">
                  <div className="text-lg font-mono text-primary">{formatCurrency(rightPayslip.netSalary, rightPayslip.currency)}</div>
                  <div className="text-xs text-muted-foreground">{formatMonth(rightPayslip.month)}</div>
                </div>
              </div>
              <div className="mt-2 text-sm">
                {renderDiff(leftPayslip.netSalary, rightPayslip.netSalary, leftPayslip.currency)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(["tax", "socialSecurity", "healthInsurance", "pension", "other"] as const).map((key) => {
                  const labels = {
                    tax: "Income Tax",
                    socialSecurity: "Social Security",
                    healthInsurance: "Health Insurance",
                    pension: "Pension",
                    other: "Other",
                  }
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{labels[key]}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono">{formatCurrency(leftPayslip.deductions[key], leftPayslip.currency)}</span>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <span className="font-mono">{formatCurrency(rightPayslip.deductions[key], rightPayslip.currency)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : leftPayslip && rightPayslip ? (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-muted-foreground">
              Cannot compare payslips with different currencies. Please select payslips with the same currency.
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">All Payslips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedPayslips.map((payslip) => (
              <div
                key={payslip.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div>
                  <div className="font-medium">{formatMonth(payslip.month)}</div>
                  <div className="text-sm text-muted-foreground">
                    Gross: {formatCurrency(payslip.grossSalary, payslip.currency)} • Net: {formatCurrency(payslip.netSalary, payslip.currency)}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Payslip</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this payslip for {formatMonth(payslip.month)}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(payslip.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
