import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Portfolio<span className="logo-accent">Hub</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/discover"
            className={`nav-link ${isActive('/discover') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            🔍 Discover
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/jobs"
                className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                💼 Jobs
              </Link>
              <Link
                to="/messages"
                className={`nav-link ${isActive('/messages') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                💬 Messages
              </Link>
              {user.role === 'student' && (
                <Link
                  to="/profile/edit"
                  className={`nav-link ${isActive('/profile/edit') ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  ✏️ Edit Profile
                </Link>
              )}
              <div className="nav-user">
                <span className="user-avatar">{user.username?.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user.username}</span>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                <button className="btn btn-primary btn-sm">Get Started</button>
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
