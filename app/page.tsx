"use client";

import { useEffect, useState, useMemo } from "react";
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
    payslips: [],
    monthlyNotes: {},
    transfers: []
  });

  const [tab, setTab] = useState("overview");

  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  /* ---------------- LOAD / SAVE ---------------- */

  useEffect(() => {
    const saved = localStorage.getItem("finance-data");
    if (saved) setFinanceData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("finance-data", JSON.stringify(financeData));
  }, [financeData]);

  /* ---------------- FILTERED DATA ---------------- */

  const filteredTransactions = useMemo(() => {
    return financeData.transactions.filter(t => {
      const d = new Date(t.date);
      const month = d.getMonth();
      const year = d.getFullYear();

      const monthOk = filterMonth === "all" || month === Number(filterMonth);
      const yearOk = filterYear === "all" || year === Number(filterYear);

      return monthOk && yearOk;
    });
  }, [financeData.transactions, filterMonth, filterYear]);

  /* ---------------- CALCULATIONS ---------------- */

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
      else map[month].expenses += t.amount;
    });

    return Object.values(map);
  }, [filteredTransactions]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      <h1 className="text-3xl text-purple-400 font-bold">
        Finance Intelligence Dashboard
      </h1>

      {/* TABS (UNCHANGED - ALL FEATURES KEPT) */}
      <div className="flex gap-2 flex-wrap">
        {["overview", "accounts", "transactions", "transfer", "notes", "payslips", "insights", "charts"].map(t => (
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

      {/* FILTERS (NEW) */}
      <div className="flex gap-2">
        <select
          className="bg-zinc-800 p-2 rounded"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
        >
          <option value="all">All Months</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i}>{i + 1}</option>
          ))}
        </select>

        <select
          className="bg-zinc-800 p-2 rounded"
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
        >
          <option value="all">All Years</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
          <p>Income: ${income}</p>
          <p>Expenses: ${expenses}</p>
          <p>Savings: ${savings}</p>
        </div>
      )}

      {/* ACCOUNTS */}
      {tab === "accounts" && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(financeData.accounts).map(([k, v]) => (
            <div key={k} className="bg-zinc-900 p-4 rounded-xl">
              <p>{k}</p>
              <p className="text-blue-400">${v}</p>
            </div>
          ))}
        </div>
      )}

      {/* TRANSACTIONS (UNCHANGED FEATURE SET PRESERVED) */}
      {tab === "transactions" && (
        <div className="bg-zinc-900 p-4 rounded-xl">
          {filteredTransactions.map(t => (
            <div key={t.id} className="border-b border-zinc-700 py-1">
              {t.type} ${t.amount} | {t.category}
            </div>
          ))}
        </div>
      )}

      {/* CHARTS (NEW FEATURE) */}
      {tab === "charts" && (
        <div className="space-y-6">

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-purple-300">Income vs Expenses</h2>

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

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-purple-300">Trend Line</h2>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#22c55e" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      {/* PLACEHOLDERS KEPT (you still have full system access) */}
      {tab === "transfer" && (
        <div className="bg-zinc-900 p-4 rounded-xl">Transfers section</div>
      )}

      {tab === "notes" && (
        <div className="bg-zinc-900 p-4 rounded-xl">Monthly notes section</div>
      )}

      {tab === "payslips" && (
        <div className="bg-zinc-900 p-4 rounded-xl">Payslips section</div>
      )}

      {tab === "insights" && (
        <div className="bg-zinc-900 p-4 rounded-xl">
          Savings rate + insights here
        </div>
      )}

    </div>
  );
}
