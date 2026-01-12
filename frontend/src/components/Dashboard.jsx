import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ResumeUpload from './ResumeUpload'
import ConsentModal from './ConsentModal'
import GitHubConnect from './GitHubConnect'
import Badges from './Badges'
import PeerDiscovery from './PeerDiscovery'
import SkillGap from './SkillGap'

export default function Dashboard() {
  const { user, apiCall } = useAuth()
  const navigate = useNavigate()
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)
  const [userScore, setUserScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Check if user needs onboarding
    if (!user?.department || !user?.graduationYear) {
      navigate('/onboarding')
      return
    }

    // Check consent status and fetch user data
    checkConsentAndFetchData()
  }, [user, navigate])

  const checkConsentAndFetchData = async () => {
    try {
      // Check if user has given consent by making a test API call
      const testResponse = await apiCall('/me')
      const userData = await testResponse.json()
      
      if (testResponse.ok) {
        // Check if user has consent recorded
        const hasConsentGiven = userData.user?.dpdpConsent?.consented === true
        setHasConsent(hasConsentGiven)
        
        if (!hasConsentGiven) {
          setShowConsentModal(true)
        }
      }

      // Fetch user score if available
      await fetchUserScore()
    } catch (error) {
      console.error('Error checking consent:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserScore = async () => {
    try {
      // This would be a custom endpoint to get user's current score
      // For now, we'll simulate it
      setUserScore({
        totalScore: 0,
        atsComponent: 0,
        gitComponent: 0,
        badgeComponent: 0,
        rank: null
      })
    } catch (error) {
      console.error('Error fetching user score:', error)
    }
  }

  const handleConsentGiven = () => {
    setHasConsent(true)
    setShowConsentModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 dark:text-slate-300 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-xl">👋</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="mt-1 text-gray-600 dark:text-slate-300 font-medium">
                  Welcome back, {user?.name}! Track your employability score and upload your resume.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {['overview', 'github', 'badges', 'peers', 'skillgap'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'github' && '🐙 GitHub'}
                {tab === 'badges' && '🏆 Badges'}
                {tab === 'peers' && '👥 Peers'}
                {tab === 'skillgap' && '📈 Skill Gap'}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* User Info Card */}
              <div className="card-modern hover-lift animate-slideIn mb-8 overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div className="px-6 py-6 bg-gradient-to-r from-white dark:from-slate-800 to-blue-50 dark:to-slate-700">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-lg">👤</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 hover-lift">
                      <dt className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-1">Department</dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-white">{user?.department}</dd>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 hover-lift">
                      <dt className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-1">Graduation Year</dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-white">{user?.graduationYear}</dd>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 hover-lift">
                      <dt className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-1">Email</dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-white">{user?.email}</dd>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 hover-lift">
                      <dt className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-1">Role</dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{user?.role}</dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Card */}
              <div className="card-modern hover-lift animate-slideIn mb-8 overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700" style={{ animationDelay: '0.2s' }}>
                <div className="px-6 py-6 bg-gradient-to-br from-white dark:from-slate-800 to-purple-50 dark:to-slate-700">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white text-lg">🏆</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Employability Score</h3>
                  </div>
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">
                            {userScore?.totalScore || 0}
                          </div>
                          <div className="text-xs text-white opacity-80">TOTAL</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-8">
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover-lift">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                          {userScore?.atsComponent || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 font-semibold">ATS Score (50%)</div>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover-lift">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                          {userScore?.gitComponent || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 font-semibold">GitHub (30%)</div>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover-lift">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                          {userScore?.badgeComponent || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 font-semibold">Badges (20%)</div>
                      </div>
                    </div>
                    {userScore?.rank && (
                      <div className="mt-6 text-center">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-bounce">
                          🥇 Rank #{userScore.rank}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume Upload Section */}
              {hasConsent ? (
                <div className="animate-slideIn" style={{ animationDelay: '0.4s' }}>
                  <ResumeUpload onScoreUpdate={fetchUserScore} />
                </div>
              ) : (
                <div className="card-modern bg-gradient-to-r from-yellow-50 dark:from-slate-800 to-orange-50 dark:to-slate-700 border border-yellow-200 dark:border-yellow-900 p-6 animate-fadeIn">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">⚠️</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300">
                        Consent Required
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200 font-medium">
                        <p>You need to provide consent for data processing before uploading your resume.</p>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowConsentModal(true)}
                          className="btn-gradient-warning text-white px-6 py-3 rounded-lg font-bold hover-lift focus-ring"
                        >
                          🔒 Provide Consent
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* GitHub Tab */}
          {activeTab === 'github' && (
            <div className="animate-slideIn">
              <GitHubConnect />
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="animate-slideIn">
              <Badges />
            </div>
          )}

          {/* Peers Tab */}
          {activeTab === 'peers' && (
            <div className="animate-slideIn">
              <PeerDiscovery />
            </div>
          )}

          {/* Skill Gap Tab */}
          {activeTab === 'skillgap' && (
            <div className="animate-slideIn">
              <SkillGap />
            </div>
          )}
        </div>
      </div>

      {/* Consent Modal */}
      {showConsentModal && (
        <ConsentModal
          onConsent={handleConsentGiven}
          onClose={() => setShowConsentModal(false)}
        />
      )}
    </div>
  )
}