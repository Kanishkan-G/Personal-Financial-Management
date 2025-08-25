import React, { useEffect, useState } from "react";
import FadeContent from "./FadeContent";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import moment from "moment";
import "./Dashboard.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28EFF",
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
];

function Dashboard() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [expenseCategoryData, setExpenseCategoryData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStart, setFilterStart] = useState(""); // Format: "YYYY-MM-DD"
  const [filterEnd, setFilterEnd] = useState("");

  // Fetch all transactions only once
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("http://localhost:8080/api/transactions");
        setAllTransactions(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Derive filtered data based on date range (or everything by default)
  useEffect(() => {
    let filtered = allTransactions;

    if (filterStart) {
      filtered = filtered.filter((tx) =>
        moment(tx.date).isSameOrAfter(filterStart, "day")
      );
    }
    if (filterEnd) {
      filtered = filtered.filter((tx) =>
        moment(tx.date).isSameOrBefore(filterEnd, "day")
      );
    }

    // Prepare for BarChart
    const dataMap = {};
    filtered.forEach((tx) => {
      const dateKey = moment(tx.date).format("DD-MM-YYYY");
      if (!dataMap[dateKey]) {
        dataMap[dateKey] = { date: dateKey, Income: 0, Expense: 0 };
      }
      if (tx.category === "Income") {
        dataMap[dateKey].Income += tx.amount || 0;
      } else if (tx.category === "Expense") {
        dataMap[dateKey].Expense += tx.amount || 0;
      }
    });
    const mergedData = Object.values(dataMap).sort(
      (a, b) => moment(a.date, "DD-MM-YYYY") - moment(b.date, "DD-MM-YYYY")
    );
    setCombinedData(mergedData);

    // Totals
    const totalInc = filtered
      .filter((t) => t.category === "Income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExp = filtered
      .filter((t) => t.category === "Expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    setTotalIncome(totalInc);
    setTotalExpense(totalExp);

    // Pie Chart aggregation
    const expenseByCategory = {};
    filtered
      .filter((t) => t.category === "Expense")
      .forEach((tx) => {
        const cat = tx.type || "Other";
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + (tx.amount || 0);
      });

    const pieData = Object.entries(expenseByCategory).map(([key, value]) => ({
      name: key,
      value,
    }));
    setExpenseCategoryData(pieData);
  }, [allTransactions, filterStart, filterEnd]);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      {/* Date Range Filters */}
      <div className="date-filter-bar">
        <div className="date-filter-field">
          <label htmlFor="start-date" className="date-filter-label">Start Date</label>
          <input
            id="start-date"
            type="date"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            max={filterEnd || ""}
            className="date-filter-input"
          />
        </div>
        <div className="date-filter-field">
          <label htmlFor="end-date" className="date-filter-label">End Date</label>
          <input
            id="end-date"
            type="date"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            min={filterStart || ""}
            className="date-filter-input"
          />
        </div>
        {(filterStart || filterEnd) && (
          <button className="clear-btn" onClick={() => { setFilterStart(""); setFilterEnd(""); }}>
            Clear
          </button>
        )}
      </div>
      <div className="summary-cards fade-root">
        <FadeContent blur={true} duration={900} initialOpacity={0} className="card balance">
          <h3>Balance</h3>
          <p>₹{(totalIncome - totalExpense).toFixed(2)}</p>
        </FadeContent>
        <FadeContent blur={true} duration={1100} initialOpacity={0} className="card income">
          <h3>Total Income</h3>
          <p>₹{totalIncome.toFixed(2)}</p>
        </FadeContent>
        <FadeContent blur={true} duration={1300} initialOpacity={0} className="card expense">
          <h3>Total Expense</h3>
          <p>₹{totalExpense.toFixed(2)}</p>
        </FadeContent>
      </div>

      <div className="charts-container">
        {/* Bar Chart */}
        <div className="chart-box bar-chart-box">
          <h3>Overall Transactions</h3>
          {combinedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={combinedData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Income" fill="#4CAF50" name="Income" />
                <Bar dataKey="Expense" fill="#F44336" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No transaction data available</p>
          )}
        </div>

        {/* Pie Chart */}
        <div className="chart-box pie-chart-box">
          <h3>Expense Breakdown</h3>
          {expenseCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  fill="#8884d8"
                  label
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No expense category data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;