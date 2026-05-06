"use client";

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

  /* ---------------- LOAD / SAVE ---------------- */

  useEffect(() => {
    const saved = localStorage.getItem("finance-data");
    if (saved) setFinanceData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("finance-data", JSON.stringify(financeData));
  }, [financeData]);

  /* ---------------- CURRENT MONTH DATA ---------------- */

  const now = new Date();

  const monthlyTx = financeData.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth();
  });

  const monthlyPayslips = financeData.payslips.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === now.getMonth();
  });

  const income = monthlyTx
    .filter(t => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = monthlyTx
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const payslipIncome = monthlyPayslips.reduce((s, p) => s + p.net, 0);

  const savings = payslipIncome - expenses;

  /* ---------------- MONTHLY HISTORY ---------------- */

  const monthlyData = useMemo(() => {
    const map = {};

    financeData.transactions.forEach(t => {
      const key = new Date(t.date).getMonth();
      if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 };

      if (t.type === "deposit") map[key].income += t.amount;
      else map[key].expenses += t.amount;
    });

    return Object.values(map);
  }, [financeData]);

  /* ---------------- CHART DATA ---------------- */

  const chartData = [
    { name: "Income", value: income },
    { name: "Expenses", value: expenses },
    { name: "Savings", value: savings }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400">
          Finance Analytics Dashboard
        </h1>
        <p className="text-gray-400">
          Real financial insights + charts
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {["overview", "charts", "insights"].map(t => (
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

      {/* CHARTS */}
      {tab === "charts" && (
        <div className="space-y-6">

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-purple-300 mb-2">This Month Breakdown</h2>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl">
            <h2 className="text-purple-300 mb-2">Monthly Trend</h2>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
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

      {/* INSIGHTS */}
      {tab === "insights" && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">

          <h2 className="text-purple-300 font-bold">Insights</h2>

          <p>Income (Payslips): ${payslipIncome}</p>
          <p>Spending: ${expenses}</p>
          <p>Savings: ${savings}</p>

          <hr className="border-zinc-700" />

          <p>
            {savings >= 0
              ? "✅ You are saving money this month"
              : "❌ You are overspending this month"}
          </p>

          <p>
            Savings Rate:{" "}
            {payslipIncome > 0
              ? ((savings / payslipIncome) * 100).toFixed(1)
              : 0}
            %
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
