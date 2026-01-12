import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-soft sticky top-0 z-50 border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:shadow-medium transition-all">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">GDGoist ATS</h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-2">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isActive('/dashboard')
                  ? 'bg-gradient-primary text-white shadow-soft'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              to="/leaderboard"
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isActive('/leaderboard')
                  ? 'bg-gradient-primary text-white shadow-soft'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              🏆 Leaderboard
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-slate-700 dark:text-slate-200 font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="btn-primary text-sm"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
