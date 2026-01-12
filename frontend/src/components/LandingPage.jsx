import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-24 text-center animate-fadeIn">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6">
            GDGoist{' '}
            <span className="gradient-text">ATS Leaderboard</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            Improve your employability with AI-powered resume analysis and compete with your peers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary">
              🚀 Get Started
            </Link>
            <Link to="/leaderboard" className="btn-secondary">
              🏆 View Leaderboard
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-hover card-gradient p-8 animate-slideInLeft dark:bg-slate-800 dark:border-slate-700">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Smart Analysis</h3>
              <p className="text-slate-600 dark:text-slate-300">
                AI-powered resume analysis using advanced SBERT technology for accurate job matching
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-hover card-gradient p-8 animate-fadeIn dark:bg-slate-800 dark:border-slate-700" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Real-time Scoring</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Get instant feedback on your resume with actionable improvements and detailed insights
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-hover card-gradient p-8 animate-slideInRight dark:bg-slate-800 dark:border-slate-700">
              <div className="text-4xl mb-4">🏅</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Compete & Learn</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Climb the leaderboard and benchmark your skills against your peers in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20 bg-gradient-primary dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-700 rounded-2xl px-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-float">
              <div className="text-5xl font-bold mb-2">1000+</div>
              <p className="text-lg opacity-90">Active Users</p>
            </div>
            <div className="animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <p className="text-lg opacity-90">Resumes Analyzed</p>
            </div>
            <div className="animate-float" style={{ animationDelay: '1s' }}>
              <div className="text-5xl font-bold mb-2">95%</div>
              <p className="text-lg opacity-90">Accuracy Rate</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-20">
          <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign Up</h3>
              <p className="text-slate-600 dark:text-slate-300">Create your account and complete your profile</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload Resume</h3>
              <p className="text-slate-600 dark:text-slate-300">Upload your resume for AI-powered analysis</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-tertiary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Compete</h3>
              <p className="text-slate-600 dark:text-slate-300">Climb the leaderboard and improve your score</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">Join thousands of students improving their employability</p>
          <Link to="/register" className="btn-primary inline-block">
            Start Your Journey Now →
          </Link>
        </div>
      </div>
    </div>
  )
}
