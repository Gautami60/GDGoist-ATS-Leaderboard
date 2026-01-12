import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ConsentModal({ onConsent, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { apiCall } = useAuth()

  const handleConsent = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await apiCall('/consent', {
        method: 'POST',
        body: JSON.stringify({ consented: true })
      })

      const data = await response.json()

      if (response.ok) {
        onConsent()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Network error')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 dark:bg-slate-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Processing Consent</h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="mt-2 px-7 py-3">
            <div className="text-sm text-gray-500 dark:text-slate-400 space-y-4">
              <p>
                <strong className="text-gray-900 dark:text-white">Data Protection and Privacy Policy (DPDP) Consent</strong>
              </p>
              
              <p className="text-gray-700 dark:text-slate-300">
                By providing consent, you agree to allow the GDGoist ATS Leaderboard platform to:
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 dark:text-slate-300">
                <li>Process and analyze your resume for ATS scoring</li>
                <li>Store your resume securely in our system</li>
                <li>Calculate and display your employability score</li>
                <li>Include your anonymized data in leaderboard rankings</li>
                <li>Use your data for platform improvement and analytics</li>
              </ul>
              
              <p>
                <strong className="text-gray-900 dark:text-white">Your Rights:</strong>
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 dark:text-slate-300">
                <li>You can withdraw consent at any time</li>
                <li>Your personal information will be kept confidential</li>
                <li>Only anonymized data appears on public leaderboards</li>
                <li>You can request deletion of your data</li>
              </ul>
              
              <p className="text-gray-700 dark:text-slate-300">
                <strong className="text-gray-900 dark:text-white">Data Security:</strong> Your resume and personal information are encrypted and stored securely. We follow industry best practices for data protection.
              </p>
              
              <p className="font-medium text-gray-900 dark:text-white">
                Do you consent to the processing of your data as described above?
              </p>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-slate-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end px-4 py-3 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-400 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleConsent}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'I Consent'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}