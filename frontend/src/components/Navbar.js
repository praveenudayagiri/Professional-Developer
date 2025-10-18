import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'glass-card backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-2xl' 
        : 'glass-card backdrop-blur-xl bg-white/90 border-b border-white/30'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-1">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-md flex items-center justify-center shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 transform group-hover:scale-110 animate-pulse-glow">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text group-hover:scale-105 transition-transform duration-300">PD Coach</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            <Link
              to="/"
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                isActive('/')
                  ? 'gradient-text glass-card bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-300/30 shadow-lg'
                  : 'text-gray-700 hover:gradient-text glass-card hover:bg-white/20 border border-transparent hover:border-white/30 hover:shadow-lg'
              }`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                isActive('/dashboard')
                  ? 'gradient-text glass-card bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-300/30 shadow-lg'
                  : 'text-gray-700 hover:gradient-text glass-card hover:bg-white/20 border border-transparent hover:border-white/30 hover:shadow-lg'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                isActive('/profile')
                  ? 'gradient-text glass-card bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-300/30 shadow-lg'
                  : 'text-gray-700 hover:gradient-text glass-card hover:bg-white/20 border border-transparent hover:border-white/30 hover:shadow-lg'
              }`}
            >
              Profile
            </Link>
            <Link
              to="/resources"
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${
                isActive('/resources')
                  ? 'gradient-text glass-card bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-300/30 shadow-lg'
                  : 'text-gray-700 hover:gradient-text glass-card hover:bg-white/20 border border-transparent hover:border-white/30 hover:shadow-lg'
              }`}
            >
              Resources
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="glass-card p-1 rounded-md text-gray-700 hover:gradient-text hover:bg-white/20 border border-transparent hover:border-white/30 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;