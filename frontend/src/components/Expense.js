// frontend/src/components/Expense.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment'; // Import moment.js for date formatting
import './Expense.css';

function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [form, setForm] = useState({
    type: 'Expense Type', // Default to 'Expense Type'
    amount: '',
    date: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/transactions');
      // Filter for specific expense-related types
      const expenseData = res.data.filter(transaction =>
        ['Expense Type', 'Entertainment', 'Groceries', 'House Rent', 'Other Expenses'].includes(transaction.type)
      );
      setExpenses(expenseData);
      const total = expenseData.reduce((acc, curr) => acc + curr.amount, 0);
      setTotalExpenses(total);
    } catch (error) {
      console.error('Error fetching expenses', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/transactions', {
        ...form,
        amount: parseFloat(form.amount),
        type: form.type,
      });
      setForm({ type: 'Expense Type', amount: '', date: '' }); // Reset the form
      fetchExpenses(); // Fetch the updated list of transactions
    } catch (error) {
      console.error('Error posting expense', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await axios.delete(`http://localhost:8080/api/transactions/${id}`);
        fetchExpenses(); // Fetch the updated list after deletion
      } catch (error) {
        console.error('Error deleting expense', error);
      }
    }
  };

  return (
    <div className="expense-container">
      <div className="expense-form">
        <h3>Post new Expense</h3>
        <form onSubmit={handleSubmit}>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="Expense Type">Expense Type</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Groceries">Groceries</option>
            <option value="House Rent">House Rent</option>
            <option value="Other Expenses">Other Expenses</option>
          </select>
          <input
            type="number"
            name="amount"
            placeholder="Enter amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <button type="submit">Post Expense</button>
        </form>
      </div>

      <div className="expense-summary">
        <h3>Total Expense: ₹{totalExpenses}</h3>
      </div>

      <div className="past-expenses">
        <h3>Past Expenses</h3>
        <div className="expense-cards">
          {expenses.map((expenseItem) => (
            <div className="expense-card" key={expenseItem.id}>
              <h4>{expenseItem.type}: ₹{expenseItem.amount}</h4>
              <p>Date: {moment(expenseItem.date).format('DD-MM-YYYY')}</p>
              <button onClick={() => handleDelete(expenseItem.id)} className="delete-btn">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Expense;