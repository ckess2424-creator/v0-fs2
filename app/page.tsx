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
    payslips: [],
    monthlyNotes: {},
    transfers: []
  });

  const [tab, setTab] = useState("overview");

  /* ---------------- FORMS ---------------- */

  const [txForm, setTxForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    account: "us_checking"
  });

  const [transferForm, setTransferForm] = useState({
    from: "us_checking",
    to: "us_savings",
    amount: ""
  });

  const [noteForm, setNoteForm] = useState({
    month: new Date().getMonth(),
    text: ""
  });

  const [payForm, setPayForm] = useState({
    gross: "",
    tax: "",
    taxType: "",
    source: "",
    country: "US",
    date: ""
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
      category: txForm.category,
      description: txForm.description,
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

    setTxForm({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      account: "us_checking"
    });
  }

  /* ---------------- TRANSFERS ---------------- */

  function addTransfer() {
    if (!transferForm.amount) return;

    const amt = parseFloat(transferForm.amount);

    setFinanceData(prev => {
      const updated = { ...prev.accounts };

      updated[transferForm.from] -= amt;
      updated[transferForm.to] += amt;

      return {
        ...prev,
        accounts: updated,
        transfers: [
          ...prev.transfers,
          {
            id: Date.now(),
            from: transferForm.from,
            to: transferForm.to,
            amount: amt,
            date: new Date().toISOString()
          }
        ]
      };
    });

    setTransferForm({
      from: "us_checking",
      to: "us_savings",
      amount: ""
    });
  }

  /* ---------------- NOTES ---------------- */

  function saveNote() {
    setFinanceData(prev => ({
      ...prev,
      monthlyNotes: {
        ...prev.monthlyNotes,
        [noteForm.month]: noteForm.text
      }
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
      taxType: payForm.taxType,
      net,
      source: payForm.source,
      country: payForm.country,
      date: payForm.date || new Date().toISOString()
    };

    setFinanceData(prev => ({
      ...prev,
      payslips: [...prev.payslips, slip]
    }));

    setPayForm({
      gross: "",
      tax: "",
      taxType: "",
      source: "",
      country: "US",
      date: ""
    });
  }

  /* ---------------- CALCULATIONS ---------------- */

  const income = financeData.transactions
    .filter(t => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);

  const expenses = financeData.transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const savings = income - expenses;

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      <h1 className="text-3xl text-purple-400 font-bold">
        Finance OS (Phase 2)
      </h1>

      {/* TABS */}
      <div className="flex gap-2">
        {["overview", "transfer", "notes", "payslips"].map(t => (
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
        <div className="bg-zinc-900 p-4 rounded-xl">
          <p>Income: ${income}</p>
          <p>Expenses: ${expenses}</p>
          <p>Savings: ${savings}</p>
        </div>
      )}

      {/* TRANSFER */}
      {tab === "transfer" && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
          <h2 className="text-purple-300">Transfer Between Accounts</h2>

          <select
            value={transferForm.from}
            onChange={e =>
              setTransferForm({ ...transferForm, from: e.target.value })
            }
          >
            <option value="us_checking">US Checking</option>
            <option value="us_savings">US Savings</option>
            <option value="il_account">Israel</option>
          </select>

          <select
            value={transferForm.to}
            onChange={e =>
              setTransferForm({ ...transferForm, to: e.target.value })
            }
          >
            <option value="us_checking">US Checking</option>
            <option value="us_savings">US Savings</option>
            <option value="il_account">Israel</option>
          </select>

          <input
            placeholder="Amount"
            value={transferForm.amount}
            onChange={e =>
              setTransferForm({ ...transferForm, amount: e.target.value })
            }
          />

          <button onClick={addTransfer} className="bg-purple-500 px-4 py-2 rounded">
            Transfer
          </button>
        </div>
      )}

      {/* NOTES */}
      {tab === "notes" && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">

          <h2 className="text-purple-300">Monthly Notes</h2>

          <input
            placeholder="Month (0-11)"
            value={noteForm.month}
            onChange={e =>
              setNoteForm({ ...noteForm, month: e.target.value })
            }
          />

          <textarea
            placeholder="Why was this month expensive?"
            value={noteForm.text}
            onChange={e =>
              setNoteForm({ ...noteForm, text: e.target.value })
            }
          />

          <button onClick={saveNote} className="bg-green-500 px-4 py-2 rounded">
            Save Note
          </button>

        </div>
      )}

      {/* PAYSLIPS */}
      {tab === "payslips" && (
        <div className="bg-zinc-900 p-4 rounded-xl space-y-2">

          <h2 className="text-purple-300">Payslips</h2>

          <input placeholder="Gross" value={payForm.gross}
            onChange={e => setPayForm({ ...payForm, gross: e.target.value })}
          />

          <input placeholder="Tax" value={payForm.tax}
            onChange={e => setPayForm({ ...payForm, tax: e.target.value })}
          />

          <input placeholder="Tax Type" value={payForm.taxType}
            onChange={e => setPayForm({ ...payForm, taxType: e.target.value })}
          />

          <input placeholder="Source" value={payForm.source}
            onChange={e => setPayForm({ ...payForm, source: e.target.value })}
          />

          <button onClick={addPayslip} className="bg-green-500 px-4 py-2 rounded">
            Add Payslip
          </button>

        </div>
      )}

    </div>
  );
}
