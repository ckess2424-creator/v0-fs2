"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [financeData, setFinanceData] = useState({
    accounts: {
      us_checking: 0,
      us_savings: 0,
      il_account: 0
    },
    transactions: []
  });

  const [tab, setTab] = useState("overview");

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    account: "us_checking"
  });

  useEffect(() => {
    const saved = localStorage.getItem("finance-data");
    if (saved) setFinanceData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("finance-data", JSON.stringify(financeData));
  }, [financeData]);

  function addTransaction() {
    if (!form.amount) return;

    const tx = {
      id: Date.now(),
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.category || "General",
      account: form.account,
      date: new Date().toISOString()
    };

    setFinanceData(prev => {
      const updated = { ...prev.accounts };

      if (tx.type === "deposit") {
        updated[tx.account] += tx.amount;
      } else {
        updated[tx.account] -= tx.amount;
      }

      return {
        accounts: updated,
        transactions: [...prev.transactions, tx]
      };
    });

    setForm({ type: "expense", amount: "", category: "", account: "us_checking" });
  }

  const income = financeData.transactions
    .filter(t => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = financeData.transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const net = income - expenses;

  const accountList = [
    { key: "us_checking", label: "US Checking" },
    { key: "us_savings", label: "US Savings" },
    { key: "il_account", label: "Israel Account" }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400">
          Finance Dashboard
        </h1>
        <p className="text-gray-400">
          Track income, expenses, and accounts in one place
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {["overview", "accounts", "transactions"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t ? "bg-purple-500" : "bg-zinc-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card title="Income" value={income} color="green" />
            <Card title="Expenses" value={expenses} color="red" />
            <Card title="Net" value={net} color="blue" />
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-purple-300 font-bold mb-2">
              Quick Add Transaction
            </h2>

            <div className="grid gap-2">
              <select
                className="bg-zinc-800 p-2 rounded"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="expense">Expense</option>
                <option value="deposit">Deposit</option>
              </select>

              <input
                className="bg-zinc-800 p-2 rounded"
                placeholder="Amount"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />

              <input
                className="bg-zinc-800 p-2 rounded"
                placeholder="Category"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              />

              <select
                className="bg-zinc-800 p-2 rounded"
                value={form.account}
                onChange={e => setForm({ ...form, account: e.target.value })}
              >
                {accountList.map(a => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </select>

              <button
                onClick={addTransaction}
                className="bg-purple-500 px-4 py-2 rounded"
              >
                Add Transaction
              </button>
            </div>
          </div>
        </>
      )}

      {/* ACCOUNTS */}
      {tab === "accounts" && (
        <div className="grid grid-cols-3 gap-4">
          {accountList.map(a => (
            <div key={a.key} className="bg-zinc-900 p-4 rounded-xl">
              <p className="text-gray-400">{a.label}</p>
              <p className="text-blue-400 text-xl">
                ${financeData.accounts[a.key]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TRANSACTIONS */}
      {tab === "transactions" && (
        <div className="bg-zinc-900 p-4 rounded-xl">
          <h2 className="text-purple-300 font-bold mb-2">All Transactions</h2>

          {financeData.transactions.map(t => (
            <div key={t.id} className="border-b border-zinc-700 py-1">
              {t.type === "deposit" ? "+" : "-"} ${t.amount} | {t.category} | {t.account}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

/* CARD */
function Card({ title, value, color }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl">
      <p className="text-gray-400">{title}</p>
      <p className={`text-${color}-400 text-xl`}>${value}</p>
    </div>
  );
}
