// frontend/src/App.js
import React from 'react';
import './App.css';
import GradientText from './components/GradientText';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import { useAuth } from './AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated, logout } = useAuth();

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
              {isAuthenticated ? (
                <>
                  <li><Link to="/">Dashboard</Link></li>
                  <li><button onClick={logout} className="linklike">Logout</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Register</Link></li>
                </>
              )}
            </ul>
          </nav>
        </header>

        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;