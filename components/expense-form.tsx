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
import type { Currency, Expense, ExpenseCategory } from "@/lib/types"
import { EXPENSE_CATEGORIES } from "@/lib/types"

interface ExpenseFormProps {
  defaultCurrency: Currency
  onSubmit: (expense: Omit<Expense, "id" | "createdAt">) => void
  trigger?: React.ReactNode
}

export function ExpenseForm({ defaultCurrency, onSubmit, trigger }: ExpenseFormProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<ExpenseCategory>("Other")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const handleSubmit = (e: React.FormEvent) => {
    console.log("🔥 FORM SUBMIT FIRED")
    e.preventDefault()
    if (!description || !amount || !category || !date) return

    onSubmit({
      description,
      amount: parseFloat(amount),
      currency: defaultCurrency,
      category,
      date,
    })

    setDescription("")
    setAmount("")
    setCategory("Other")
    setDate(new Date().toISOString().split("T")[0])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add {defaultCurrency === "USD" ? "American" : "Israeli"} Expense</DialogTitle>
          <DialogDescription>
            Add a new expense in {defaultCurrency === "USD" ? "USD" : "ILS"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount ({defaultCurrency})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={defaultCurrency === "USD" ? "$0.00" : "₪0.00"}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
