"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "./supabase"
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
async function loadData(): Promise<FinanceData> {
  try {
    const [
      expensesResult,
      accountsResult,
      payslipsResult,
      balanceHistoryResult,
    ] = await Promise.all([
      supabase.from("expenses").select("*"),
      supabase.from("accounts").select("*"),
      supabase.from("payslips").select("*"),
      supabase.from("balance_history").select("*"),
    ])

    return {
      expenses: expensesResult.data || [],
      accounts:
        accountsResult.data?.length
          ? accountsResult.data.map((a) => ({
              ...a,
              lastUpdated: a.last_updated,
            }))
          : defaultData.accounts,

      payslips:
        payslipsResult.data?.map((p) => ({
          ...p,
          createdAt: p.created_at,
        })) || [],

      balanceHistory:
        balanceHistoryResult.data?.map((h) => ({
          ...h,
          accountId: h.account_id,
        })) || [],
    }
  } catch (error) {
    console.error("Error loading Supabase data", error)
    return defaultData
  }
}
export function useFinanceData() {
  const [data, setData] = useState<FinanceData>(defaultData)
  const [isLoaded, setIsLoaded] = useState(false)

 useEffect(() => {
  async function fetchData() {
    const loadedData = await loadData()
    setData(loadedData)
    setIsLoaded(true)
  }

  fetchData()
}, [])

  const addExpense = useCallback(async (expense: Omit<Expense, "id" | "createdAt">) => {
  const newExpense = {
    ...expense,
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert([newExpense])
    .select()

  if (error) {
    console.error("Failed to add expense:", error)
    return
  }

  const inserted = data?.[0]

  if (!inserted) return

  // convert DB format → frontend format
  const formattedExpense = {
    ...inserted,
    createdAt: inserted.created_at,
  }

  setData((prev) => ({
    ...prev,
    expenses: [...prev.expenses, formattedExpense],
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
