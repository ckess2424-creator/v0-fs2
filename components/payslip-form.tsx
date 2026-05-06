"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { Currency, Payslip } from "@/lib/types"
import { MONTHS } from "@/lib/types"

interface PayslipFormProps {
  onSubmit: (payslip: Omit<Payslip, "id" | "createdAt">) => void
}

export function PayslipForm({ onSubmit }: PayslipFormProps) {
  const [open, setOpen] = useState(false)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [month, setMonth] = useState(`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`)
  const [currency, setCurrency] = useState<Currency>("USD")
  const [grossSalary, setGrossSalary] = useState("")
  const [tax, setTax] = useState("")
  const [socialSecurity, setSocialSecurity] = useState("")
  const [healthInsurance, setHealthInsurance] = useState("")
  const [pension, setPension] = useState("")
  const [other, setOther] = useState("")

  const calculateNet = () => {
    const gross = parseFloat(grossSalary) || 0
    const deductions =
      (parseFloat(tax) || 0) +
      (parseFloat(socialSecurity) || 0) +
      (parseFloat(healthInsurance) || 0) +
      (parseFloat(pension) || 0) +
      (parseFloat(other) || 0)
    return gross - deductions
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!grossSalary) return

    onSubmit({
      month,
      currency,
      grossSalary: parseFloat(grossSalary),
      netSalary: calculateNet(),
      deductions: {
        tax: parseFloat(tax) || 0,
        socialSecurity: parseFloat(socialSecurity) || 0,
        healthInsurance: parseFloat(healthInsurance) || 0,
        pension: parseFloat(pension) || 0,
        other: parseFloat(other) || 0,
      },
    })

    // Reset form
    setMonth(`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`)
    setCurrency("USD")
    setGrossSalary("")
    setTax("")
    setSocialSecurity("")
    setHealthInsurance("")
    setPension("")
    setOther("")
    setOpen(false)
  }

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Add Payslip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Payslip</DialogTitle>
          <DialogDescription>
            Enter your payslip details to track income and deductions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="month">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) =>
                    MONTHS.map((m, i) => (
                      <SelectItem
                        key={`${year}-${i + 1}`}
                        value={`${year}-${String(i + 1).padStart(2, "0")}`}
                      >
                        {m} {year}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="ILS">ILS (₪)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="grossSalary">Gross Salary (Before Tax)</Label>
            <Input
              id="grossSalary"
              type="number"
              step="0.01"
              min="0"
              value={grossSalary}
              onChange={(e) => setGrossSalary(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="border-t border-border pt-4">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Deductions
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tax">Income Tax</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="socialSecurity">Social Security</Label>
              <Input
                id="socialSecurity"
                type="number"
                step="0.01"
                min="0"
                value={socialSecurity}
                onChange={(e) => setSocialSecurity(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="healthInsurance">Health Insurance</Label>
              <Input
                id="healthInsurance"
                type="number"
                step="0.01"
                min="0"
                value={healthInsurance}
                onChange={(e) => setHealthInsurance(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pension">Pension</Label>
              <Input
                id="pension"
                type="number"
                step="0.01"
                min="0"
                value={pension}
                onChange={(e) => setPension(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="other">Other Deductions</Label>
            <Input
              id="other"
              type="number"
              step="0.01"
              min="0"
              value={other}
              onChange={(e) => setOther(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Net Salary (After Tax)</span>
              <span className="text-xl font-bold font-mono text-primary">
                {currency === "USD" ? "$" : "₪"}
                {calculateNet().toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Add Payslip</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
