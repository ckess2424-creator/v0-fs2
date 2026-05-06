"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PiggyBank, Wallet, Edit2, History, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Account, BalanceHistoryEntry } from "@/lib/types"
import { formatCurrency } from "@/lib/store"

interface AccountCardProps {
  account: Account
  balanceHistory: BalanceHistoryEntry[]
  onUpdateBalance: (id: string, balance: number, note?: string) => void
  onDeleteHistoryEntry: (id: string) => void
}

export function AccountCard({ account, balanceHistory, onUpdateBalance, onDeleteHistoryEntry }: AccountCardProps) {
  const [open, setOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [balance, setBalance] = useState(account.balance.toString())
  const [note, setNote] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateBalance(account.id, parseFloat(balance) || 0, note.trim() || undefined)
    setOpen(false)
    setNote("")
  }

  const Icon = account.type === "savings" ? PiggyBank : Wallet

  // Calculate change from previous balance
  const getBalanceChange = (current: BalanceHistoryEntry, index: number, history: BalanceHistoryEntry[]) => {
    if (index >= history.length - 1) return null
    const previous = history[index + 1]
    return current.balance - previous.balance
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8">
        <div className="w-full h-full rounded-full bg-primary/5" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {account.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="size-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(account.balance, account.currency)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Updated{" "}
              {new Date(account.lastUpdated).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {/* History Button */}
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                >
                  <History className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Balance History</DialogTitle>
                  <DialogDescription>
                    View the history of balance changes for {account.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-auto max-h-[400px]">
                  {balanceHistory.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No balance history yet. Update your balance to start tracking.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                          <TableHead>Note</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {balanceHistory.map((entry, index) => {
                          const change = getBalanceChange(entry, index, balanceHistory)
                          return (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium">
                                {new Date(entry.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(entry.balance, account.currency)}
                              </TableCell>
                              <TableCell className="text-right">
                                {change !== null ? (
                                  <span
                                    className={`inline-flex items-center gap-1 font-mono text-sm ${
                                      change > 0
                                        ? "text-green-500"
                                        : change < 0
                                        ? "text-red-500"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {change > 0 ? (
                                      <TrendingUp className="size-3" />
                                    ) : change < 0 ? (
                                      <TrendingDown className="size-3" />
                                    ) : (
                                      <Minus className="size-3" />
                                    )}
                                    {change > 0 ? "+" : ""}
                                    {formatCurrency(change, account.currency)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Initial</span>
                                )}
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate text-muted-foreground">
                                {entry.note || "-"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => onDeleteHistoryEntry(entry.id)}
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Button */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => {
                    setBalance(account.balance.toString())
                    setNote("")
                  }}
                >
                  <Edit2 className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Balance</DialogTitle>
                  <DialogDescription>
                    Enter the current balance for {account.name}. This will be saved in the balance history.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="balance">
                      Balance ({account.currency})
                    </Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      placeholder={account.currency === "USD" ? "$0.00" : "₪0.00"}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="note">
                      Note (optional)
                    </Label>
                    <Textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g., Paycheck deposit, Transfer from savings..."
                      rows={2}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Update Balance</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Show last change if available */}
        {balanceHistory.length >= 2 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Last change</span>
              {(() => {
                const change = balanceHistory[0].balance - balanceHistory[1].balance
                return (
                  <span
                    className={`inline-flex items-center gap-1 font-mono ${
                      change > 0
                        ? "text-green-500"
                        : change < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {change > 0 ? (
                      <TrendingUp className="size-3" />
                    ) : change < 0 ? (
                      <TrendingDown className="size-3" />
                    ) : (
                      <Minus className="size-3" />
                    )}
                    {change > 0 ? "+" : ""}
                    {formatCurrency(change, account.currency)}
                  </span>
                )
              })()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
