// src/components/Income.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import './Income.css';

function Income() {
  const [income, setIncome] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [form, setForm] = useState({
    type: 'Salary', // default option (avoid placeholder value)
    amount: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/transactions');
      const all = Array.isArray(res.data) ? res.data : [];

      // Filter transactions where category === 'Income'
      const incomeData = all.filter(tx => tx.category === 'Income');

      setIncome(incomeData);

      const total = incomeData.reduce((acc, curr) => {
        const amt = parseFloat(curr.amount);
        return acc + (Number.isFinite(amt) ? amt : 0);
      }, 0);

      setTotalIncome(total);
    } catch (error) {
      console.error('Error fetching income', error);
      setIncome([]);
      setTotalIncome(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!form.amount || !form.date || !form.type) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/transactions', {
        category: 'Income',         // IMPORTANT: ensures dashboard can detect income
        type: form.type,
        amount: parseFloat(form.amount),
        date: form.date
      });

      // Reset form and refresh list
      setForm({ type: 'Salary', amount: '', date: '' });
      fetchIncome();
    } catch (error) {
      console.error('Error posting income', error);
      alert('Failed to post income. Check console for details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income?')) return;

    try {
      await axios.delete(`http://localhost:8080/api/transactions/${id}`);
      fetchIncome();
    } catch (error) {
      console.error('Error deleting income', error);
      alert('Failed to delete income. Check console for details.');
    }
  };

  return (
    <div className="income-container">
      <div className="income-form">
        <h3>Post new Income</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Type
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <option value="Salary">Salary</option>
              <option value="Bonus">Bonus</option>
              <option value="Gift">Gift</option>
              <option value="Freelance">Freelance</option>
              <option value="Other Income">Other Income</option>
            </select>
          </label>

          <label>
            Amount
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              value={form.amount}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
            />
          </label>

          <label>
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit">Post Income</button>
        </form>
      </div>

      <div className="income-summary">
        <h3>Total Income: ₹{Number(totalIncome).toFixed(2)}</h3>
        {loading && <p>Loading incomes...</p>}
      </div>

      <div className="past-incomes">
        <h3>Past Incomes</h3>
        <div className="income-cards">
          {income.length === 0 ? (
            <p>No income records found.</p>
          ) : (
            income.map((incomeItem) => (
              <div className="income-card" key={incomeItem.id}>
                <h4>{incomeItem.type}: ₹{Number(incomeItem.amount).toFixed(2)}</h4>
                <p>Date: {incomeItem.date ? moment(incomeItem.date).format('DD-MM-YYYY') : 'N/A'}</p>
                <button onClick={() => handleDelete(incomeItem.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Income;