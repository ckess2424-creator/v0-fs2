"use client";

import { useEffect, useMemo, useState } from "react";

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

  /* ---------------- ANALYTICS ENGINE ---------------- */

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const monthlyTx = financeData.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const monthlyPayslips = financeData.payslips.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const income = monthlyTx
    .filter(t => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = monthlyTx
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const payslipIncome = monthlyPayslips.reduce((s, p) => s + p.net, 0);

  const savings = payslipIncome - expenses;

  /* ---------------- ACCOUNT INSIGHT ---------------- */

  const accountStats = useMemo(() => {
    const stats = {
      us: 0,
      il: 0
    };

    financeData.transactions.forEach(t => {
      if (t.account.includes("us")) {
        stats.us += t.type === "deposit" ? t.amount : -t.amount;
      } else {
        stats.il += t.type === "deposit" ? t.amount : -t.amount;
      }
    });

    return stats;
  }, [financeData]);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400">
          Finance Intelligence Dashboard
        </h1>
        <p className="text-gray-400">
          Income • Spending • Payslips • Savings analysis
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
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card title="Spending" value={expenses} color="red" />
            <Card title="Payslip Income" value={payslipIncome} color="green" />
            <Card title="Savings" value={savings} color="blue" />
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-purple-300 font-bold">
              Did you save this month?
            </h2>
            <p className="text-xl mt-2">
              {savings >= 0 ? "✅ Yes" : "❌ No"}
            </p>
          </div>
        </>
      )}

      {/* ACCOUNTS */}
      {tab === "accounts" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-blue-400">US Net</h2>
            <p>${accountStats.us}</p>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-yellow-400">Israel Net</h2>
            <p>${accountStats.il}</p>
          </div>
        </div>
      )}

      {/* TRANSACTIONS */}
      {tab === "transactions" && (
        <div className="bg-zinc-900 p-4 rounded-xl">
          {monthlyTx.map(t => (
            <div key={t.id} className="border-b border-zinc-700 py-1">
              {t.type === "deposit" ? "+" : "-"} ${t.amount} | {t.category}
            </div>
          ))}
        </div>
      )}

      {/* PAYSLIPS */}
      {tab === "payslips" && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">

          <h2 className="text-purple-300 font-bold">Add Payslip</h2>

          <input className="bg-zinc-800 p-2 rounded w-full"
            placeholder="Gross"
            value={payForm.gross}
            onChange={e => setPayForm({ ...payForm, gross: e.target.value })}
          />

          <input className="bg-zinc-800 p-2 rounded w-full"
            placeholder="Tax"
            value={payForm.tax}
            onChange={e => setPayForm({ ...payForm, tax: e.target.value })}
          />

          <button onClick={addPayslip} className="bg-green-500 px-4 py-2 rounded">
            Add Payslip
          </button>

          {monthlyPayslips.map(p => (
            <div key={p.id} className="border-b border-zinc-700 py-1">
              Gross: ${p.gross} | Net: ${p.net} | {p.country}
            </div>
          ))}
        </div>
      )}

      {/* INSIGHTS */}
      {tab === "insights" && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">

          <h2 className="text-purple-300 font-bold">Monthly Insights</h2>

          <p>Income (Payslips): ${payslipIncome}</p>
          <p>Spending: ${expenses}</p>
          <p>Savings: ${savings}</p>

          <hr className="border-zinc-700" />

          <p>
            {savings >= 0
              ? "You are financially positive this month"
              : "You are overspending compared to income"}
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
