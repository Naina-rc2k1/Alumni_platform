import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Settings, GraduationCap } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const normalizeRole = (role) => {
    if (role === 'student') return 'currentStudent';
    return role;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo + Home */}
        <div className="logo-home">
          <Link to="/" className="logo">
            <GraduationCap className="logo-icon" />
            <span>AlumniConnect</span>
          </Link>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
        </div>

        {/* Desktop Links */}
        <div className="nav-links-desktop">
          {isAuthenticated && (
            <>
              {user?.role === 'alumni' && (
                <Link to="/alumni" className="nav-link">Alumni Directory</Link>
              )}
              {normalizeRole(user?.role) === 'currentStudent' && (
                <Link to="/student-dashboard" className="nav-link">Student Dashboard</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin-dashboard" className="nav-link">Admin Dashboard</Link>
              )}
              <Link to="/events" className="nav-link">Events</Link>
              <Link to="/mentorship" className="nav-link">Mentorship</Link>
            </>
          )}
        </div>

        {/* User/Auth */}
        <div className="user-menu">
          {isAuthenticated ? (
            <div className="profile-dropdown">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="profile-btn">
                <div className="avatar"><User /></div>
                <span>{user?.name}</span>
              </button>
              {isProfileOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="user-name">{user?.name}</p>
                    <p className="user-role">{user?.role}</p>
                  </div>
                  <button className="dropdown-btn">
                    <Settings className="icon-small" /> Profile Settings
                  </button>
                  <button className="dropdown-btn logout-btn" onClick={handleLogout}>
                    <LogOut className="icon-small" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="text-btn">Login</Link>
              <Link to="/register" className="text-btn">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          {isAuthenticated && (
            <>
                {user?.role === 'alumni' && (
                  <Link to="/alumni" onClick={() => setIsMenuOpen(false)}>Alumni Directory</Link>
                )}
                {normalizeRole(user?.role) === 'currentStudent' && (
                  <Link to="/student-dashboard" onClick={() => setIsMenuOpen(false)}>Student Dashboard</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin-dashboard" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                )}
              <Link to="/events" onClick={() => setIsMenuOpen(false)}>Events</Link>
              <Link to="/mentorship" onClick={() => setIsMenuOpen(false)}>Mentorship</Link>
            </>
          )}
          {!isAuthenticated ? (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          ) : (
            <button className="logout-mobile" onClick={handleLogout}>Logout</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
