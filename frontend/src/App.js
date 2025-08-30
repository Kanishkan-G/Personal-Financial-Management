// frontend/src/App.js
import React from 'react';
import './App.css';
import GradientText from './components/GradientText';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="topbar">
          <div className="pf-tracker-title-row">
            <GradientText
              colors={["#800080, #00FFFF"]}
              animationSpeed={3}
              showBorder={false}
              className="pf-tracker-title"
            >
              PF Tracker
            </GradientText>
          </div>
          <nav>
            <ul className="topbar-nav">
              <li><Link to="/">Dashboard</Link></li>
            </ul>
          </nav>
        </header>

        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;