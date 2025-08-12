// src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";
import "./Dashboard.css";

function Dashboard() {
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]); // ✅ Added for expenses
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0); // ✅ Added for expenses
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("http://localhost:8080/api/transactions");
        const transactions = Array.isArray(res.data) ? res.data : [];

        // ✅ Income processing (unchanged)
        const incomeList = transactions.filter(t => t.category === "Income");
        const incomeMap = {};
        incomeList.forEach(item => {
          const dateKey = moment(item.date).format("DD-MM-YYYY");
          incomeMap[dateKey] = (incomeMap[dateKey] || 0) + (item.amount || 0);
        });
        const aggregatedIncome = Object.keys(incomeMap).map(date => ({
          date,
          amount: incomeMap[date],
        }));
        aggregatedIncome.sort((a, b) =>
          moment(a.date, "DD-MM-YYYY") - moment(b.date, "DD-MM-YYYY")
        );
        setIncomeData(aggregatedIncome);
        setTotalIncome(
          incomeList.reduce((sum, item) => sum + (item.amount || 0), 0)
        );

        // ✅ Expense processing (new but separate)
        const expenseList = transactions.filter(t => t.category === "Expense");
        const expenseMap = {};
        expenseList.forEach(item => {
          const dateKey = moment(item.date).format("DD-MM-YYYY");
          expenseMap[dateKey] = (expenseMap[dateKey] || 0) + (item.amount || 0);
        });
        const aggregatedExpense = Object.keys(expenseMap).map(date => ({
          date,
          amount: expenseMap[date],
        }));
        aggregatedExpense.sort((a, b) =>
          moment(a.date, "DD-MM-YYYY") - moment(b.date, "DD-MM-YYYY")
        );
        setExpenseData(aggregatedExpense);
        setTotalExpense(
          expenseList.reduce((sum, item) => sum + (item.amount || 0), 0)
        );

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <div className="summary-cards">
        <div className="card balance">
          <h3>Balance</h3>
          <p>₹{(totalIncome - totalExpense).toFixed(2)}</p>
        </div>
        <div className="card income">
          <h3>Total Income</h3>
          <p>₹{totalIncome.toFixed(2)}</p>
        </div>
        <div className="card expense">
          <h3>Total Expense</h3>
          <p>₹{totalExpense.toFixed(2)}</p>
        </div>
      </div>

      <div className="charts">
        {/* ✅ Income Over Time (unchanged) */}
        <div className="chart-container">
          <h3>Income Over Time</h3>
          {incomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#4CAF50" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No income data available</p>
          )}
        </div>

        {/* ✅ Expense Over Time (new but separate) */}
        <div className="chart-container">
          <h3>Expense Over Time</h3>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#F44336" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No expense data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;