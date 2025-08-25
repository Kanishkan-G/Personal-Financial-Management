// frontend/src/App.js
import React, { useState } from 'react';
import './App.css';
import GradientText from './components/GradientText';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Income from './components/Income';
import Expense from './components/Expense';
import Dashboard from './components/Dashboard';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className={`app-container${sidebarOpen ? '' : ' sidebar-closed'}`}>
        {!sidebarOpen && (
          <button
            className="sidebar-toggle-open"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            →
          </button>
        )}

        {/* Sidebar */}
        <div className={`sidebar${sidebarOpen ? '' : ' closed'}`}>
          <div className="pf-tracker-title-row">
            <GradientText
              colors={["#800080, #00FFFF"]}
              animationSpeed={3}
              showBorder={false}
              className="pf-tracker-title"
            >
              PF Tracker
            </GradientText>
            {sidebarOpen && (
              <button
                className="sidebar-toggle-close"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                ←
              </button>
            )}
          </div>
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/dashboard" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;