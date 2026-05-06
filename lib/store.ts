"use client"

import { useCallback, useEffect, useState } from "react"
import type { Account, BalanceHistoryEntry, Expense, FinanceData, Payslip } from "./types"

const STORAGE_KEY = "expense-tracker-data"

const defaultData: FinanceData = {
  expenses: [],
  accounts: [
    {
      id: "us-checking",
      name: "US Checking",
      type: "checking",
      currency: "USD",
      balance: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "us-savings",
      name: "US Savings",
      type: "savings",
      currency: "USD",
      balance: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "il-account",
      name: "Israeli Account",
      type: "checking",
      currency: "ILS",
      balance: 0,
      lastUpdated: new Date().toISOString(),
    },
  ],
  payslips: [],
  balanceHistory: [],
}

function loadData(): FinanceData {
  if (typeof window === "undefined") return defaultData
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Ensure default accounts exist
      const hasUSChecking = parsed.accounts?.some((a: Account) => a.id === "us-checking")
      const hasUSSavings = parsed.accounts?.some((a: Account) => a.id === "us-savings")
      const hasILAccount = parsed.accounts?.some((a: Account) => a.id === "il-account")
      
      if (!hasUSChecking || !hasUSSavings || !hasILAccount) {
        const accounts = [...(parsed.accounts || [])]
        if (!hasUSChecking) accounts.push(defaultData.accounts[0])
        if (!hasUSSavings) accounts.push(defaultData.accounts[1])
        if (!hasILAccount) accounts.push(defaultData.accounts[2])
        parsed.accounts = accounts
      }
      
      return {
        expenses: parsed.expenses || [],
        accounts: parsed.accounts || defaultData.accounts,
        payslips: parsed.payslips || [],
        balanceHistory: parsed.balanceHistory || [],
      }
    }
  } catch {
    console.error("Error loading data from localStorage")
  }
  return defaultData
}

function saveData(data: FinanceData) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    console.error("Error saving data to localStorage")
  }
}

export function useFinanceData() {
  const [data, setData] = useState<FinanceData>(defaultData)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setData(loadData())
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      saveData(data)
    }
  }, [data, isLoaded])

  const addExpense = useCallback((expense: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
    }))
  }, [])

  const updateExpense = useCallback((id: string, expense: Partial<Expense>) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...expense } : e)),
    }))
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }))
  }, [])

  const updateAccountBalance = useCallback((id: string, balance: number, note?: string) => {
    const now = new Date().toISOString()
    const historyEntry: BalanceHistoryEntry = {
      id: crypto.randomUUID(),
      accountId: id,
      balance,
      date: now,
      note,
    }
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === id ? { ...a, balance, lastUpdated: now } : a
      ),
      balanceHistory: [...prev.balanceHistory, historyEntry],
    }))
  }, [])

  const deleteBalanceHistoryEntry = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      balanceHistory: prev.balanceHistory.filter((h) => h.id !== id),
    }))
  }, [])

  const getBalanceHistory = useCallback((accountId: string) => {
    return data.balanceHistory
      .filter((h) => h.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [data.balanceHistory])

  const addPayslip = useCallback((payslip: Omit<Payslip, "id" | "createdAt">) => {
    const newPayslip: Payslip = {
      ...payslip,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setData((prev) => ({
      ...prev,
      payslips: [...prev.payslips, newPayslip],
    }))
  }, [])

  const updatePayslip = useCallback((id: string, payslip: Partial<Payslip>) => {
    setData((prev) => ({
      ...prev,
      payslips: prev.payslips.map((p) => (p.id === id ? { ...p, ...payslip } : p)),
    }))
  }, [])

  const deletePayslip = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      payslips: prev.payslips.filter((p) => p.id !== id),
    }))
  }, [])

  return {
    data,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    updateAccountBalance,
    deleteBalanceHistoryEntry,
    getBalanceHistory,
    addPayslip,
    updatePayslip,
    deletePayslip,
  }
}

export function formatCurrency(amount: number, currency: "USD" | "ILS"): string {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "he-IL", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [year, month] = key.split("-").map(Number)
  return { year, month }
}
