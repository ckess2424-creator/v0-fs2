export type Currency = "USD" | "ILS"

export type ExpenseCategory =
  | "Housing"
  | "Utilities"
  | "Food"
  | "Transportation"
  | "Healthcare"
  | "Entertainment"
  | "Shopping"
  | "Education"
  | "Travel"
  | "Other"

export interface Expense {
  id: string
  description: string
  amount: number
  currency: Currency
  category: ExpenseCategory
  date: string // ISO date string
  createdAt: string
}

export interface Account {
  id: string
  name: string
  type: "checking" | "savings"
  currency: Currency
  balance: number
  lastUpdated: string
}

export interface BalanceHistoryEntry {
  id: string
  accountId: string
  balance: number
  date: string // ISO date string
  note?: string
}

export interface Payslip {
  id: string
  name: string // Custom name/label for the payslip
  month: string // YYYY-MM format
  grossSalary: number
  netSalary: number
  currency: Currency
  deductions: {
    tax: number
    socialSecurity: number
    healthInsurance: number
    pension: number
    other: number
  }
  createdAt: string
}

export interface FinanceData {
  expenses: Expense[]
  accounts: Account[]
  payslips: Payslip[]
  balanceHistory: BalanceHistoryEntry[]
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Housing",
  "Utilities",
  "Food",
  "Transportation",
  "Healthcare",
  "Entertainment",
  "Shopping",
  "Education",
  "Travel",
  "Other",
]

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
