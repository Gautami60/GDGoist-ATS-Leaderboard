import React, { useState, useEffect } from 'react'

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    department: '',
    graduationYear: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0
  })

  useEffect(() => {
    fetchLeaderboard()
  }, [filters, pagination.page])

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (filters.department) {
        params.append('department', filters.department)
      }
      if (filters.graduationYear) {
        params.append('graduationYear', filters.graduationYear)
      }

      const response = await fetch(`http://localhost:4000/leaderboard?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLeaderboardData(data.entries || [])
        setPagination(prev => ({
          ...prev,
          totalCount: data.totalCount || 0
        }))
      } else {
        setError('Failed to fetch leaderboard data')
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error)
      setError('Network error while fetching leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({
      ...prev,
      page: 1
    }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const totalPages = Math.ceil(pagination.totalCount / pagination.limit)

  const departments = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration',
    'Marketing',
    'Finance',
    'Other'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i)

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    if (rank === 2) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    if (rank === 3) return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
    if (rank <= 10) return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    return 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-xl">🏆</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-300 font-medium">
                  See how you rank against your peers in employability scores.
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card-modern hover-lift animate-slideIn mb-8 overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-6 bg-gradient-to-r from-white dark:from-slate-800 to-blue-50 dark:to-slate-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🔍</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Filter Results
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label htmlFor="department" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                    Department
                  </label>
                  <select
                    id="department"
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus-ring bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="graduationYear" className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                    Graduation Year
                  </label>
                  <select
                    id="graduationYear"
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus-ring bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium"
                    value={filters.graduationYear}
                    onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                  >
                    <option value="">All Years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilters({ department: '', graduationYear: '' })
                      setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                    className="w-full btn-gradient text-white font-bold py-3 px-4 rounded-lg hover-lift focus-ring"
                  >
                    🗑️ Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-slate-700">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Rankings
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-slate-400">
                {pagination.totalCount > 0 
                  ? `Showing ${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.totalCount)} of ${pagination.totalCount} results`
                  : 'No results found'
                }
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="px-4 py-5 sm:px-6">
                <div className="bg-red-50 dark:bg-slate-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                  {error}
                </div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-center">
                <div className="text-gray-500 dark:text-slate-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rankings yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Be the first to upload your resume and appear on the leaderboard!
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                {leaderboardData.map((entry, index) => (
                  <li key={index} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRankBadgeColor(entry.rank)}`}>
                            #{entry.rank}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {entry.department || 'Unknown Department'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-slate-400">
                                Class of {entry.graduationYear || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getScoreColor(entry.totalScore)}`}>
                            {entry.totalScore || 0}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Score</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-slate-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-slate-300">
                      Page <span className="font-medium">{pagination.page}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}