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
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

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
  const [statements, setStatements] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [expenseCategoryData, setExpenseCategoryData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [filteredStatements, setFilteredStatements] = useState([]);
  const [suggestions, setSuggestions] = useState({ expenseSuggestion: '', incomeSuggestion: '' });
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch all bank statements
  const fetchStatements = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/bankstatements");
      setStatements(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching statements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive filtered data based on date range (or everything by default)
  useEffect(() => {
    let filtered = statements;

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
      if ((tx.amount || 0) >= 0) {
        dataMap[dateKey].Income += tx.amount || 0;
      } else {
        dataMap[dateKey].Expense += Math.abs(tx.amount || 0);
      }
    });
    const mergedData = Object.values(dataMap).sort(
      (a, b) => moment(a.date, "DD-MM-YYYY") - moment(b.date, "DD-MM-YYYY")
    );
    setCombinedData(mergedData);

    // Totals
    const totalInc = filtered
      .filter((t) => (t.amount || 0) > 0)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExp = filtered
      .filter((t) => (t.amount || 0) < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    setTotalIncome(totalInc);
    setTotalExpense(totalExp);

    // Pie Chart aggregation
    const expenseByCategory = {};
    filtered
      .filter((t) => (t.amount || 0) < 0)
      .forEach((tx) => {
        const cat = tx.category || "Other";
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Math.abs(tx.amount || 0);
      });

    const pieData = Object.entries(expenseByCategory).map(([key, value]) => ({
      name: key,
      value,
    }));
    setExpenseCategoryData(pieData);

    // Table: sort by date (newest first) and store filtered list
    const sortedForTable = [...filtered].sort(
      (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()
    );
    setFilteredStatements(sortedForTable);
  }, [statements, filterStart, filterEnd]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploading(true);
      const res = await axios.post('http://localhost:8080/api/bankstatements/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res?.data) {
        setSuggestions({
          expenseSuggestion: res.data.expenseSuggestion || '',
          incomeSuggestion: res.data.incomeSuggestion || ''
        });
      }
      setFile(null);
      await fetchStatements();
    } catch (err) {
      console.error('Upload failed', err);
      const msg = err?.response?.data?.error || err?.message || 'Upload failed';
      alert(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this statement entry?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/bankstatements/${id}`);
      await fetchStatements();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  const handleToggle = (id) => {
    setSelectedIds((prev) => (
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    ));
  };

  const handleToggleAll = () => {
    if (selectedIds.length === filteredStatements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStatements.map((s) => s.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected entr${selectedIds.length === 1 ? 'y' : 'ies'}?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => axios.delete(`http://localhost:8080/api/bankstatements/${id}`)));
      setSelectedIds([]);
      await fetchStatements();
    } catch (err) {
      console.error('Bulk delete failed', err);
      alert('Bulk delete failed');
    }
  };

  const exportAsImage = async () => {
    const dash = document.querySelector('.dashboard-container');
    if (!dash) return;
    const canvas = await html2canvas(dash, { scale: 2, useCORS: true });
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, 'dashboard.jpg');
    }, 'image/jpeg', 0.95);
  };

  const exportAsPdf = async () => {
    const dash = document.querySelector('.dashboard-container');
    if (!dash) return;
    const canvas = await html2canvas(dash, { scale: 2, useCORS: true });
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const form = new FormData();
      form.append('image', new File([blob], 'dashboard.jpg', { type: 'image/jpeg' }));
      try {
        const res = await axios.post('http://localhost:8080/api/export/pdf?filename=dashboard.pdf', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          responseType: 'blob'
        });
        saveAs(res.data, 'dashboard.pdf');
      } catch (e) {
        console.error('PDF export failed', e);
        alert('Failed to export PDF');
      }
    }, 'image/jpeg', 0.95);
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <div style={{display:'flex', gap:12, marginBottom:10}}>
        <button onClick={exportAsImage}>Download JPG</button>
        <button onClick={exportAsPdf}>Download PDF</button>
      </div>

      <div className="upload-bar">
        <form onSubmit={handleUpload}>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button type="submit" disabled={uploading || !file}>{uploading ? 'Uploading...' : 'Upload CSV'}</button>
        </form>
      </div>
      
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

      {(suggestions.expenseSuggestion || suggestions.incomeSuggestion) && (
        <div className="suggestions">
          {suggestions.expenseSuggestion && <p>{suggestions.expenseSuggestion}</p>}
          {suggestions.incomeSuggestion && <p>{suggestions.incomeSuggestion}</p>}
        </div>
      )}

      <div className="charts-container">
        {/* Table (left) + Pie (right) */}
        <div className="chart-box table-box">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <h3>Bank Statements</h3>
            <button onClick={handleBulkDelete} disabled={selectedIds.length===0} className="delete-btn">
              {selectedIds.length>0 ? `Delete Selected (${selectedIds.length})` : 'Delete Selected'}
            </button>
          </div>
          {filteredStatements.length === 0 ? (
            <p className="no-data">No statements found.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      <input type="checkbox" onChange={handleToggleAll} checked={selectedIds.length===filteredStatements.length && filteredStatements.length>0} />
                    </th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStatements.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => handleToggle(s.id)} />
                      </td>
                      <td>{s.date ? moment(s.date).format('DD-MM-YYYY') : 'N/A'}</td>
                      <td>{s.description}</td>
                      <td>{s.category}</td>
                      <td>{Number(s.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        {/* Bar Chart (bottom, full width) */}
        <div className="chart-box bar-chart-box">
          <h3>Overall Income vs Expense</h3>
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
      </div>
    </div>
  );
}

export default Dashboard;