// src/components/Expense.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import './Expense.css';

function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [form, setForm] = useState({
    type: 'Food', // default option
    amount: '',
    date: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/transactions');
      const all = Array.isArray(res.data) ? res.data : [];

      // Filter only "Expense" category
      const expenseData = all.filter(tx => tx.category === 'Expense');

      setExpenses(expenseData);

      const total = expenseData.reduce((acc, curr) => {
        const amt = parseFloat(curr.amount);
        return acc + (Number.isFinite(amt) ? amt : 0);
      }, 0);

      setTotalExpense(total);
    } catch (error) {
      console.error('Error fetching expenses', error);
      setExpenses([]);
      setTotalExpense(0);
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

    if (!form.amount || !form.date || !form.type) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/transactions', {
        category: 'Expense', // IMPORTANT for dashboard filtering
        type: form.type,
        amount: parseFloat(form.amount),
        date: form.date
      });

      setForm({ type: 'Food', amount: '', date: '' });
      fetchExpenses();
    } catch (error) {
      console.error('Error posting expense', error);
      alert('Failed to post expense. Check console for details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await axios.delete(`http://localhost:8080/api/transactions/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense', error);
      alert('Failed to delete expense. Check console for details.');
    }
  };

  return (
    <div className="expense-container">
      <div className="expense-form">
        <h3>Post new Expense</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Type
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other Expense">Other Expense</option>
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

          <button type="submit">Post Expense</button>
        </form>
      </div>

      <div className="expense-summary">
        <h3>Total Expense: ₹{Number(totalExpense).toFixed(2)}</h3>
        {loading && <p>Loading expenses...</p>}
      </div>

      <div className="past-expenses">
        <h3>Past Expenses</h3>
        <div className="expense-cards">
          {expenses.length === 0 ? (
            <p>No expense records found.</p>
          ) : (
            expenses.map((expenseItem) => (
              <div className="expense-card" key={expenseItem.id}>
                <h4>{expenseItem.type}: ₹{Number(expenseItem.amount).toFixed(2)}</h4>
                <p>Date: {expenseItem.date ? moment(expenseItem.date).format('DD-MM-YYYY') : 'N/A'}</p>
                <button onClick={() => handleDelete(expenseItem.id)} className="delete-btn">
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

export default Expense;