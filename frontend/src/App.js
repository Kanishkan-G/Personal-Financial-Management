// frontend/src/App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Income from './components/Income';
import Expense from './components/Expense';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <nav>
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/income">Income</Link></li>
              <li><Link to="/expense">Expense</Link></li>
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} /> {/* Default route */}
            <Route path="/income" element={<Income />} />
            <Route path="/expense" element={<Expense />} />
            {/* Redirect old dashboard path if needed */}
            <Route path="/dashboard" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;