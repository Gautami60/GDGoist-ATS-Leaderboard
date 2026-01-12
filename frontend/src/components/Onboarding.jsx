import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Onboarding() {
  const [department, setDepartment] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, apiCall, setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user already has onboarding data
    if (user?.department && user?.graduationYear) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiCall('/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          department,
          graduationYear: parseInt(graduationYear)
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Update user data
        setUser({ ...user, department, graduationYear: parseInt(graduationYear) })
        navigate('/dashboard')
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Network error')
    }

    setLoading(false)
  }

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
            Tell us about your academic background
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-slate-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Department
              </label>
              <select
                id="department"
                name="department"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Expected Graduation Year
              </label>
              <select
                id="graduationYear"
                name="graduationYear"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              >
                <option value="">Select graduation year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}