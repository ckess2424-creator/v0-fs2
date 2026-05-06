"use client";

import { useEffect, useState, useMemo } from "react";

export default function Page() {
  const [financeData, setFinanceData] = useState({
    accounts: {
      us_checking: 0,
      us_savings: 0,
      il_account: 0
    },

    transactions: [],
    payslips: [],

    // 🆕 MONTH NOTES
    monthlyNotes: {},

    // 🆕 TRANSFERS
    transfers: []
  });

  const [tab, setTab] = useState("overview");

  const [txForm, setTxForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    account: "us_checking",
    date: ""
  });

  const [noteForm, setNoteForm] = useState({
    month: new Date().getMonth(),
    text: ""
  });

  const [transferForm, setTransferForm] = useState({
    from: "us_checking",
    to: "us_savings",
    amount: ""
  });

  const [payForm, setPayForm] = useState({
    gross: "",
    tax: "",
    taxType: "",
    country: "US",
    source: "",
    date: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("finance-data");
    if (saved) setFinanceData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("finance-data", JSON.stringify(financeData));
  }, [financeData]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl text-purple-400 font-bold">
        Finance OS (Upgraded)
      </h1>

      <p className="text-gray-400 mt-2">
        Phase 1 complete: data structure expanded
      </p>
    </div>
  );
}
