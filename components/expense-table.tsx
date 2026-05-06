"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Trash2 } from "lucide-react"
import type { Expense } from "@/lib/types"
import { formatCurrency } from "@/lib/store"

interface ExpenseTableProps {
  expenses: Expense[]
  onDelete: (id: string) => void
}

const categoryColors: Record<string, string> = {
  Housing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Utilities: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Food: "bg-green-500/20 text-green-400 border-green-500/30",
  Transportation: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Healthcare: "bg-red-500/20 text-red-400 border-red-500/30",
  Entertainment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Shopping: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Education: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Travel: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

export function ExpenseTable({ expenses, onDelete }: ExpenseTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground text-sm">No expenses recorded</div>
        <div className="text-muted-foreground/60 text-xs mt-1">
          Add your first expense to start tracking
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground">Date</TableHead>
          <TableHead className="text-muted-foreground">Description</TableHead>
          <TableHead className="text-muted-foreground">Category</TableHead>
          <TableHead className="text-muted-foreground text-right">Amount</TableHead>
          <TableHead className="text-muted-foreground w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedExpenses.map((expense) => (
          <TableRow key={expense.id} className="border-border">
            <TableCell className="text-muted-foreground font-mono text-sm">
              {new Date(expense.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </TableCell>
            <TableCell className="font-medium">{expense.description}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={`${categoryColors[expense.category]} border`}
              >
                {expense.category}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono font-semibold">
              {formatCurrency(expense.amount, expense.currency)}
            </TableCell>
            <TableCell>
              <AlertDialog open={deleteId === expense.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(expense.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this expense? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDelete(expense.id)
                        setDeleteId(null)
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
