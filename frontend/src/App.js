import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/transactions");
      setTransactions(res.data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/transactions/summary");
      setSummary(res.data);
    } catch (error) {
      console.error("Error fetching summary", error);
    }
  };

  // Data for charts
  const incomeData = transactions
    .filter(t => t.type === "Income")
    .map(t => ({
      date: t.date,
      amount: t.amount,
    }));

  const expenseData = transactions
    .filter(t => t.type === "Expense")
    .map(t => ({
      date: t.date,
      amount: t.amount,
    }));

  return (
    <div className="container">
      <div className="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li>Dashboard</li>
          <li>Income</li>
          <li>Expense</li>
        </ul>
      </div>
      <div className="main-content">
        <div className="card overview">
          <div className="overview-item">
            <h3>Balance</h3>
            <p>₹{summary.balance}</p> {/* Changed to ₹ */}
          </div>
          <div className="overview-item">
            <h3>Total Income</h3>
            <p>₹{summary.totalIncome}</p> {/* Changed to ₹ */}
          </div>
          <div className="overview-item">
            <h3>Total Expense</h3>
            <p>₹{summary.totalExpenses}</p> {/* Changed to ₹ */}
          </div>
        </div>

        <div className="charts">
          <div className="chart">
            <h3>Income Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `₹${value}`} /> {/* Changed to ₹ */}
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="green" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart">
            <h3>Expense Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `₹${value}`} /> {/* Changed to ₹ */}
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="red" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="recent-history">
          <h3>Recent Transactions</h3>
          <ul>
            {transactions.slice(0, 5).map((t, index) => (
              <li key={index} className={t.type === "Income" ? "income" : "expense"}>
                {t.type === "Income" ? `+₹${t.amount}` : `-₹${t.amount}`} - {t.category} {/* Changed to ₹ */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;