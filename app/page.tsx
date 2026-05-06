"use client";

import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [financeData, setFinanceData] = useState({
    accounts: {
      us_checking: 0,
      us_savings: 0,
      il_account: 0
    },
    transactions: []
  });

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    account: "us_checking",
    country: "US"
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // LOAD
  useEffect(() => {
    const saved = localStorage.getItem("finance-data");
    if (saved) setFinanceData(JSON.parse(saved));
  }, []);

  // SAVE
  useEffect(() => {
    localStorage.setItem("finance-data", JSON.stringify(financeData));
  }, [financeData]);

  // ADD TRANSACTION
  function addTransaction() {
    if (!form.amount) return;

    const tx = {
      id: Date.now(),
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.category || "General",
      account: form.account,
      country: form.country,
      date: new Date().toISOString()
    };

    setFinanceData(prev => {
      const updatedAccounts = { ...prev.accounts };

      if (tx.type === "deposit") {
        updatedAccounts[tx.account] += tx.amount;
      } else {
        updatedAccounts[tx.account] -= tx.amount;
      }

      return {
        accounts: updatedAccounts,
        transactions: [...prev.transactions, tx]
      };
    });

    setForm({
      type: "expense",
      amount: "",
      category: "",
      account: "us_checking",
      country: "US"
    });
  }

  // FILTER TIME
  const filteredTx = financeData.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  // CALCULATIONS
  const income = filteredTx.filter(t => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = filteredTx.filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const balance = income - expenses;

  // ACCOUNT BREAKDOWN
  const accountKeys = Object.keys(financeData.accounts);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400">
          Finance System
        </h1>
        <p className="text-gray-400">
          Multi-account tracking (US + Israel)
        </p>
      </div>

      {/* ACCOUNTS */}
      <div className="grid grid-cols-3 gap-4">
        {accountKeys.map(key => (
          <div key={key} className="bg-zinc-900 p-4 rounded-xl">
            <p className="text-gray-400">{key}</p>
            <p className="text-blue-400 text-xl">
              ${financeData.accounts[key]}
            </p>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Income" value={income} color="green" />
        <Card title="Expenses" value={expenses} color="red" />
        <Card title="Net" value={balance} color="blue" />
      </div>

      {/* INPUT */}
      <div className="bg-zinc-900 p-4 rounded-xl space-y-2">

        <select
          className="w-full p-2 bg-zinc-800 rounded"
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
        >
          <option value="expense">Expense</option>
          <option value="deposit">Deposit</option>
        </select>

        <input
          className="w-full p-2 bg-zinc-800 rounded"
          placeholder="Amount"
          value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
        />

        <input
          className="w-full p-2 bg-zinc-800 rounded"
          placeholder="Category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        />

        <select
          className="w-full p-2 bg-zinc-800 rounded"
          value={form.account}
          onChange={e => setForm({ ...form, account: e.target.value })}
        >
          <option value="us_checking">US Checking</option>
          <option value="us_savings">US Savings</option>
          <option value="il_account">Israel Account</option>
        </select>

        <button
          onClick={addTransaction}
          className="bg-purple-500 px-4 py-2 rounded"
        >
          Add Transaction
        </button>
      </div>

      {/* MONTH FILTER */}
      <div className="flex gap-2">
        <input
          className="bg-zinc-800 p-2 rounded"
          type="number"
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
        />

        <input
          className="bg-zinc-800 p-2 rounded"
          type="number"
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
        />
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-zinc-900 p-4 rounded-xl">
        <h2 className="text-purple-300 font-bold mb-2">Transactions</h2>

        {filteredTx.map(t => (
          <div key={t.id} className="border-b border-zinc-700 py-1">
            {t.type === "deposit" ? "+" : "-"} ${t.amount} | {t.category} | {t.account}
          </div>
        ))}
      </div>

    </div>
  );
}

/* COMPONENT */
function Card({ title, value, color }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl">
      <p className="text-gray-400">{title}</p>
      <p className={`text-${color}-400 text-xl`}>${value}</p>
    </div>
  );
}
