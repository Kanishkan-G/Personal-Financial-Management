// frontend/src/components/Income.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment'; // Import moment.js for date formatting
import './Income.css';

function Income() {
  const [income, setIncome] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [form, setForm] = useState({
    type: 'Income Type', // Default to 'Income Type'
    amount: '',
    date: ''
  });

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/transactions');
      // Filter for specific income-related types
      const incomeData = res.data.filter(transaction =>
        ['Income Type', 'Salary', 'Bonus', 'Gift', 'Other Income'].includes(transaction.type)
      );
      setIncome(incomeData);
      const total = incomeData.reduce((acc, curr) => acc + curr.amount, 0);
      setTotalIncome(total);
    } catch (error) {
      console.error('Error fetching income', error);
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
      setForm({ type: 'Income Type', amount: '', date: '' }); // Reset the form
      fetchIncome(); // Fetch the updated list of transactions
    } catch (error) {
      console.error('Error posting income', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      try {
        await axios.delete(`http://localhost:8080/api/transactions/${id}`);
        fetchIncome(); // Fetch the updated list after deletion
      } catch (error) {
        console.error('Error deleting income', error);
      }
    }
  };

  return (
    <div className="income-container">
      <div className="income-form">
        <h3>Post new Income</h3>
        <form onSubmit={handleSubmit}>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="Income Type">Income Type</option>
            <option value="Salary">Salary</option>
            <option value="Bonus">Bonus</option>
            <option value="Gift">Gift</option>
            <option value="Other Income">Other Income</option>
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
          <button type="submit">Post Income</button>
        </form>
      </div>

      <div className="income-summary">
        <h3>Total Income: ₹{totalIncome}</h3>
      </div>

      <div className="past-incomes">
        <h3>Past Incomes</h3>
        <div className="income-cards">
          {income.map((incomeItem) => (
            <div className="income-card" key={incomeItem.id}>
              <h4>{incomeItem.type}: ₹{incomeItem.amount}</h4>
              <p>Date: {moment(incomeItem.date).format('DD-MM-YYYY')}</p>
              <button onClick={() => handleDelete(incomeItem.id)} className="delete-btn">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Income;