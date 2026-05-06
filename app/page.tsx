"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [financeData, setFinanceData] = useState({
    expenses: [],
    deposits: []
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: "",
    country: "US"
  });

  const [depositForm, setDepositForm] = useState({
    amount: "",
    source: "",
    country: "US"
  });

  // LOAD DATA
  useEffect(() => {
    const saved = localStorage.getItem("finance-data");
    if (saved) {
      setFinanceData(JSON.parse(saved));
    }
  }, []);

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem("finance-data", JSON.stringify(financeData));
  }, [financeData]);

  // ADD EXPENSE
  function addExpense() {
    if (!expenseForm.amount) return;

    const newExpense = {
      id: Date.now(),
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category || "Other",
      country: expenseForm.country,
      date: new Date().toISOString()
    };

    setFinanceData(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }));

    setExpenseForm({ amount: "", category: "", country: "US" });
  }

  // ADD DEPOSIT
  function addDeposit() {
    if (!depositForm.amount) return;

    const newDeposit = {
      id: Date.now(),
      amount: parseFloat(depositForm.amount),
      source: depositForm.source || "Income",
      country: depositForm.country,
      date: new Date().toISOString()
    };

    setFinanceData(prev => ({
      ...prev,
      deposits: [...prev.deposits, newDeposit]
    }));

    setDepositForm({ amount: "", source: "", country: "US" });
  }

  // FILTER BY MONTH
  const filteredExpenses = financeData.expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const filteredDeposits = financeData.deposits.filter(d => {
    const dDate = new Date(d.date);
    return dDate.getMonth() === selectedMonth && dDate.getFullYear() === selectedYear;
  });

  // TOTALS
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalDeposits = filteredDeposits.reduce((sum, d) => sum + d.amount, 0);
  const balance = totalDeposits - totalExpenses;

  const savedMoney = balance >= 0;

  // COUNTRY SPLIT
  const usExpenses = filteredExpenses.filter(e => e.country === "US");
  const ilExpenses = filteredExpenses.filter(e => e.country === "IL");

  const usIncome = filteredDeposits.filter(d => d.country === "US");
  const ilIncome = filteredDeposits.filter(d => d.country === "IL");

  const usNet =
    usIncome.reduce((s, d) => s + d.amount, 0) -
    usExpenses.reduce((s, e) => s + e.amount, 0);

  const ilNet =
    ilIncome.reduce((s, d) => s + d.amount, 0) -
    ilExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400">
          Finance Tracker
        </h1>

        <p className="text-gray-400">
          {savedMoney ? "📈 You saved money this month" : "📉 You spent more than you earned"}
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Income" value={totalDeposits} color="green" />
        <Card title="Expenses" value={totalExpenses} color="red" />
        <Card title="Balance" value={balance} color="blue" />
      </div>

      {/* FILTER */}
      <div className="flex gap-2">
        <input
          className="bg-zinc-800 p-2 rounded"
          type="number"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          placeholder="Month (0-11)"
        />

        <input
          className="bg-zinc-800 p-2 rounded"
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          placeholder="Year"
        />
      </div>

      {/* FORMS */}
      <div className="grid grid-cols-2 gap-6">

        {/* EXPENSE */}
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
          <h2 className="text-red-400 font-bold">Add Expense</h2>

          <input
            className="w-full p-2 bg-zinc-800 rounded"
            placeholder="Amount"
            value={expenseForm.amount}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, amount: e.target.value })
            }
          />

          <input
            className="w-full p-2 bg-zinc-800 rounded"
            placeholder="Category"
            value={expenseForm.category}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, category: e.target.value })
            }
          />

          <select
            className="w-full p-2 bg-zinc-800 rounded"
            value={expenseForm.country}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, country: e.target.value })
            }
          >
            <option value="US">US</option>
            <option value="IL">Israel</option>
          </select>

          <button
            onClick={addExpense}
            className="bg-red-500 px-4 py-2 rounded"
          >
            Add Expense
          </button>
        </div>

        {/* INCOME */}
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
          <h2 className="text-green-400 font-bold">Add Income</h2>

          <input
            className="w-full p-2 bg-zinc-800 rounded"
            placeholder="Amount"
            value={depositForm.amount}
            onChange={(e) =>
              setDepositForm({ ...depositForm, amount: e.target.value })
            }
          />

          <input
            className="w-full p-2 bg-zinc-800 rounded"
            placeholder="Source"
            value={depositForm.source}
            onChange={(e) =>
              setDepositForm({ ...depositForm, source: e.target.value })
            }
          />

          <select
            className="w-full p-2 bg-zinc-800 rounded"
            value={depositForm.country}
            onChange={(e) =>
              setDepositForm({ ...depositForm, country: e.target.value })
            }
          >
            <option value="US">US</option>
            <option value="IL">Israel</option>
          </select>

          <button
            onClick={addDeposit}
            className="bg-green-500 px-4 py-2 rounded"
          >
            Add Income
          </button>
        </div>
      </div>

      {/* LISTS */}
      <div className="grid grid-cols-2 gap-6">

        <List title="Expenses" items={filteredExpenses} sign="-" color="red" />
        <List title="Income" items={filteredDeposits} sign="+" color="green" />

      </div>

      {/* COUNTRY BREAKDOWN */}
      <div className="grid grid-cols-2 gap-6">

        <div className="bg-zinc-900 p-4 rounded-xl">
          <h2 className="text-blue-400 font-bold">US Net</h2>
          <p>${usNet}</p>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl">
          <h2 className="text-yellow-400 font-bold">Israel Net</h2>
          <p>${ilNet}</p>
        </div>

      </div>

    </div>
  );
}

/* COMPONENTS */
function Card({ title, value, color }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl">
      <p className="text-gray-400">{title}</p>
      <p className={`text-${color}-400 text-xl`}>${value}</p>
    </div>
  );
}

function List({ title, items, sign, color }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl">
      <h2 className={`text-${color}-400 font-bold mb-2`}>{title}</h2>

      {items.map((i) => (
        <div key={i.id} className="border-b border-zinc-700 py-1">
          {sign} ${i.amount} — {i.category || i.source}
        </div>
      ))}
    </div>
  );
}
