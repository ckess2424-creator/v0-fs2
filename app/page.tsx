"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [financeData, setFinanceData] = useState({
    accounts: {
      us_checking: 0,
      us_savings: 0,
      il_account: 0
    },
    transactions: [],
    payslips: []
  });

  const [tab, setTab] = useState("overview");

  const [txForm, setTxForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    account: "us_checking"
  });

  const [payForm, setPayForm] = useState({
    gross: "",
    tax: "",
    country: "US",
    source: ""
  });

  // LOAD DATA
  useEffect(() => {
    const saved = localStorage.getItem("finance-data");
    if (saved) setFinanceData(JSON.parse(saved));
  }, []);

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem("finance-data", JSON.stringify(financeData));
  }, [financeData]);

  // ADD TRANSACTION
  function addTransaction() {
    if (!txForm.amount) return;

    const tx = {
      id: Date.now(),
      type: txForm.type,
      amount: parseFloat(txForm.amount),
      category: txForm.category || "General",
      account: txForm.account,
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
        ...prev,
        accounts: updated,
        transactions: [...prev.transactions, tx]
      };
    });

    setTxForm({ type: "expense", amount: "", category: "", account: "us_checking" });
  }

  // ADD PAYSLIP
  function addPayslip() {
    if (!payForm.gross) return;

    const gross = parseFloat(payForm.gross);
    const tax = parseFloat(payForm.tax || 0);
    const net = gross - tax;

    const slip = {
      id: Date.now(),
      gross,
      tax,
      net,
      country: payForm.country,
      source: payForm.source || "Employer",
      date: new Date().toISOString()
    };

    setFinanceData(prev => ({
      ...prev,
      payslips: [...prev.payslips, slip]
    }));

    setPayForm({ gross: "", tax: "", country: "US", source: "" });
  }

  const income = financeData.transactions
    .filter(t => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = financeData.transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const savings = income - expenses;

  const accountKeys = Object.keys(financeData.accounts);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400">
          Finance Dashboard
        </h1>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {["overview", "accounts", "transactions", "payslips"].map(t => (
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
        <div className="grid grid-cols-3 gap-4">
          <Card title="Income" value={income} color="green" />
          <Card title="Expenses" value={expenses} color="red" />
          <Card title="Savings" value={savings} color="blue" />
        </div>
      )}

      {/* ACCOUNTS */}
      {tab === "accounts" && (
        <div className="grid grid-cols-3 gap-4">
          {accountKeys.map(k => (
            <div key={k} className="bg-zinc-900 p-4 rounded-xl">
              <p className="text-gray-400">{k}</p>
              <p className="text-blue-400 text-xl">
                ${financeData.accounts[k]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TRANSACTIONS (FIXED — INPUT IS HERE) */}
      {tab === "transactions" && (
        <div className="space-y-4">

          {/* ADD FORM */}
          <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
            <h2 className="text-purple-300 font-bold">Add Transaction</h2>

            <input
              className="bg-zinc-800 p-2 rounded w-full"
              placeholder="Amount"
              value={txForm.amount}
              onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
            />

            <select
              className="bg-zinc-800 p-2 rounded w-full"
              value={txForm.type}
              onChange={e => setTxForm({ ...txForm, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="deposit">Deposit</option>
            </select>

            <input
              className="bg-zinc-800 p-2 rounded w-full"
              placeholder="Category"
              value={txForm.category}
              onChange={e => setTxForm({ ...txForm, category: e.target.value })}
            />

            <select
              className="bg-zinc-800 p-2 rounded w-full"
              value={txForm.account}
              onChange={e => setTxForm({ ...txForm, account: e.target.value })}
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

          {/* LIST */}
          <div className="bg-zinc-900 p-4 rounded-xl">
            {financeData.transactions.map(t => (
              <div key={t.id} className="border-b border-zinc-700 py-1">
                {t.type === "deposit" ? "+" : "-"} ${t.amount} | {t.category}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* PAYSLIPS */}
      {tab === "payslips" && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">

          <h2 className="text-purple-300 font-bold">Add Payslip</h2>

          <input
            className="bg-zinc-800 p-2 rounded w-full"
            placeholder="Gross"
            value={payForm.gross}
            onChange={e => setPayForm({ ...payForm, gross: e.target.value })}
          />

          <input
            className="bg-zinc-800 p-2 rounded w-full"
            placeholder="Tax"
            value={payForm.tax}
            onChange={e => setPayForm({ ...payForm, tax: e.target.value })}
          />

          <button
            onClick={addPayslip}
            className="bg-green-500 px-4 py-2 rounded"
          >
            Add Payslip
          </button>

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
