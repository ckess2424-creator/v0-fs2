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

  /* ---------------- LOAD / SAVE ---------------- */

  useEffect(() => {
    const saved = localStorage.getItem("finance-data");
    if (saved) setFinanceData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("finance-data", JSON.stringify(financeData));
  }, [financeData]);

  /* ---------------- TRANSACTIONS ---------------- */

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

  function deleteTransaction(id) {
    setFinanceData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  }

  /* ---------------- PAYSLIPS ---------------- */

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

  function deletePayslip(id) {
    setFinanceData(prev => ({
      ...prev,
      payslips: prev.payslips.filter(p => p.id !== id)
    }));
  }

  /* ---------------- ANALYTICS (OPTION B) ---------------- */

  const income = financeData.transactions
    .filter(t => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = financeData.transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const savings = income - expenses;

  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

  const monthlyGoal = 2000; // you can later make this editable
  const goalProgress = (savings / monthlyGoal) * 100;

  const accountKeys = Object.keys(financeData.accounts);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400">
          Finance Intelligence System
        </h1>
        <p className="text-gray-400">
          Track • Analyze • Improve
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {["overview", "accounts", "transactions", "payslips", "insights"].map(t => (
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

      {/* ACCOUNTS HISTORY */}
      {tab === "accounts" && (
        <div className="space-y-4">
          {accountKeys.map(k => (
            <div key={k} className="bg-zinc-900 p-4 rounded-xl">
              <p className="text-gray-400">{k}</p>
              <p className="text-blue-400 text-xl">${financeData.accounts[k]}</p>
            </div>
          ))}
        </div>
      )}

      {/* TRANSACTIONS + DELETE */}
      {tab === "transactions" && (
        <div className="space-y-4">

          {/* ADD */}
          <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
            <input
              className="bg-zinc-800 p-2 rounded w-full"
              placeholder="Amount"
              value={txForm.amount}
              onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
            />

            <button onClick={addTransaction} className="bg-purple-500 px-4 py-2 rounded">
              Add Transaction
            </button>
          </div>

          {/* HISTORY */}
          <div className="bg-zinc-900 p-4 rounded-xl">
            {financeData.transactions.map(t => (
              <div key={t.id} className="flex justify-between border-b border-zinc-700 py-1">
                <span>
                  {t.type === "deposit" ? "+" : "-"} ${t.amount}
                </span>

                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="text-red-400"
                >
                  delete
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* PAYSLIPS + DELETE */}
      {tab === "payslips" && (
        <div className="space-y-4">

          <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
            <input
              className="bg-zinc-800 p-2 rounded w-full"
              placeholder="Gross"
              value={payForm.gross}
              onChange={e => setPayForm({ ...payForm, gross: e.target.value })}
            />

            <button onClick={addPayslip} className="bg-green-500 px-4 py-2 rounded">
              Add Payslip
            </button>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl">
            {financeData.payslips.map(p => (
              <div key={p.id} className="flex justify-between border-b border-zinc-700 py-1">
                <span>${p.net}</span>
                <button onClick={() => deletePayslip(p.id)} className="text-red-400">
                  delete
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* INSIGHTS (OPTION B) */}
      {tab === "insights" && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">

          <h2 className="text-purple-300 font-bold">Financial Intelligence</h2>

          <p>Savings Rate: {savingsRate}%</p>
          <p>Monthly Goal Progress: {goalProgress.toFixed(1)}%</p>

          <p>
            {savingsRate > 20
              ? "Strong savings month"
              : savingsRate > 0
              ? "Moderate savings"
              : "Overspending detected"}
          </p>

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
