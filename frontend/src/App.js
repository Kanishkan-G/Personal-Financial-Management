// frontend/src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Income from './components/Income';
import Expense from './components/Expense';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <h2>Dashboard</h2>
          <nav>
            <ul>
              <li><Link to="/income">Income</Link></li>
              <li><Link to="/expense">Expense</Link></li>
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="content">
          <Routes>
            <Route path="/income" element={<Income />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/" element={<h2>Welcome to the Personal Finance Tracker</h2>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;