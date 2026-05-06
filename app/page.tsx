"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

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

  const [filter, setFilter] = useState({
    month: "all",
    year: "all"
  });

  const [txForm, setTxForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    account: "us_checking"
  });

  const [transferForm, setTransferForm] = useState({
    from: "us_checking",
    to: "us_savings",
    amount: ""
  });

  /* ---------------- LOAD / SAVE ---------------- */

  useEffect(() => {
    const saved = localStorage.getItem("finance-data");
    if (saved) setFinanceData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("finance-data", JSON.stringify(financeData));
  }, [financeData]);

  /* ---------------- ADD TRANSACTION ---------------- */

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

    setTxForm({ amount: "", type: "expense", category: "", account: "us_checking" });
  }

  /* ---------------- TRANSFER BETWEEN ACCOUNTS ---------------- */

  function transfer() {
    const amount = parseFloat(transferForm.amount);
    if (!amount) return;

    setFinanceData(prev => {
      const updated = { ...prev.accounts };

      updated[transferForm.from] -= amount;
      updated[transferForm.to] += amount;

      const tx = {
        id: Date.now(),
        type: "transfer",
        amount,
        from: transferForm.from,
        to: transferForm.to,
        date: new Date().toISOString()
      };

      return {
        ...prev,
        accounts: updated,
        transactions: [...prev.transactions, tx]
      };
    });

    setTransferForm({ from: "us_checking", to: "us_savings", amount: "" });
  }

  /* ---------------- FILTERED DATA ---------------- */

  const filteredTransactions = useMemo(() => {
    return financeData.transactions.filter(t => {
      const d = new Date(t.date);

      if (filter.month !== "all" && d.getMonth() !== parseInt(filter.month)) return false;
      if (filter.year !== "all" && d.getFullYear() !== parseInt(filter.year)) return false;

      return true;
    });
  }, [financeData.transactions, filter]);

  /* ---------------- METRICS ---------------- */

  const income = filteredTransactions
    .filter(t => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const savings = income - expenses;

  /* ---------------- CHART DATA ---------------- */

  const chartData = useMemo(() => {
    const map = {};

    filteredTransactions.forEach(t => {
      const month = new Date(t.date).getMonth();

      if (!map[month]) {
        map[month] = { month, income: 0, expenses: 0 };
      }

      if (t.type === "deposit") map[month].income += t.amount;
      if (t.type === "expense") map[month].expenses += t.amount;
    });

    return Object.values(map);
  }, [filteredTransactions]);

  const accounts = financeData.accounts;

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400">
          Finance Control Center
        </h1>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {["overview", "transactions", "transfer", "charts"].map(t => (
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
          <Card title="Income" value={income} />
          <Card title="Expenses" value={expenses} />
          <Card title="Savings" value={savings} />
        </div>
      )}

      {/* TRANSACTIONS */}
      {tab === "transactions" && (
        <div className="space-y-4">

          {/* ADD */}
          <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
            <input
              className="bg-zinc-800 p-2 w-full rounded"
              placeholder="Amount"
              value={txForm.amount}
              onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
            />

            <button onClick={addTransaction} className="bg-purple-500 px-4 py-2 rounded">
              Add Transaction
            </button>
          </div>

          {/* LIST */}
          <div className="bg-zinc-900 p-4 rounded-xl">
            {filteredTransactions.map(t => (
              <div key={t.id} className="border-b border-zinc-700 py-1">
                {t.type} - ${t.amount}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TRANSFER */}
      {tab === "transfer" && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">

          <select
            className="bg-zinc-800 p-2 w-full"
            value={transferForm.from}
            onChange={e => setTransferForm({ ...transferForm, from: e.target.value })}
          >
            <option value="us_checking">US Checking</option>
            <option value="us_savings">US Savings</option>
            <option value="il_account">Israel</option>
          </select>

          <select
            className="bg-zinc-800 p-2 w-full"
            value={transferForm.to}
            onChange={e => setTransferForm({ ...transferForm, to: e.target.value })}
          >
            <option value="us_checking">US Checking</option>
            <option value="us_savings">US Savings</option>
            <option value="il_account">Israel</option>
          </select>

          <input
            className="bg-zinc-800 p-2 w-full"
            placeholder="Amount"
            value={transferForm.amount}
            onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })}
          />

          <button onClick={transfer} className="bg-green-500 px-4 py-2 rounded">
            Transfer
          </button>

        </div>
      )}

      {/* CHARTS */}
      {tab === "charts" && (
        <div className="space-y-4">

          {/* FILTERS */}
          <div className="flex gap-2">
            <select
              className="bg-zinc-800 p-2"
              onChange={e => setFilter({ ...filter, month: e.target.value })}
            >
              <option value="all">All Months</option>
              <option value="0">Jan</option>
              <option value="1">Feb</option>
              <option value="2">Mar</option>
              <option value="3">Apr</option>
            </select>

            <select
              className="bg-zinc-800 p-2"
              onChange={e => setFilter({ ...filter, year: e.target.value })}
            >
              <option value="all">All Years</option>
              <option value="2026">2026</option>
            </select>
          </div>

          {/* BAR */}
          <div className="bg-zinc-900 p-4 rounded-xl">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#22c55e" />
                <Bar dataKey="expenses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

    </div>
  );
}

/* CARD */
function Card({ title, value }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl">
      <p className="text-gray-400">{title}</p>
      <p className="text-purple-400 text-xl">${value}</p>
    </div>
  );
}
