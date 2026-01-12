import React from 'react'

export default function ATSResults({ score, feedback, breakdown, contact, parsedSkills, similarityMethod, modelInfo, onClose, rawText, parsingErrors }) {
  console.log('ATSResults received props:', { score, feedback, breakdown, contact, parsedSkills, similarityMethod, modelInfo, rawText, parsingErrors })
  
  const [showRawText, setShowRawText] = React.useState(false)
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-gradient-to-r from-green-50 dark:from-slate-700 to-emerald-50 dark:to-slate-600 border-green-200 dark:border-green-900'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-gradient-to-r from-yellow-50 dark:from-slate-700 to-amber-50 dark:to-slate-600 border-yellow-200 dark:border-yellow-900'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400 bg-gradient-to-r from-orange-50 dark:from-slate-700 to-red-50 dark:to-slate-600 border-orange-200 dark:border-orange-900'
    return 'text-red-600 dark:text-red-400 bg-gradient-to-r from-red-50 dark:from-slate-700 to-pink-50 dark:to-slate-600 border-red-200 dark:border-red-900'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const getScoreIcon = (score) => {
    if (score >= 80) return '🎉'
    if (score >= 60) return '👍'
    if (score >= 40) return '⚡'
    return '🎯'
  }

  return (
    <div className="mt-6 space-y-4 animate-fadeIn">
      {/* Score Display */}
      <div className={`card-modern hover-lift overflow-hidden px-6 py-6 ${getScoreColor(score)} relative`}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl animate-bounce">{getScoreIcon(score)}</div>
            <div>
              <div className="text-3xl font-bold animate-scaleIn">{score}/100</div>
              <div className="text-sm font-semibold">{getScoreLabel(score)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium opacity-75">ATS Score</div>
            <div className="text-xs opacity-60">Resume Analysis</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-white/30 rounded-full h-2 overflow-hidden">
          <div 
            className="progress-bar h-full animate-slideIn"
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      {/* Score Breakdown */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="card-modern hover-lift overflow-hidden px-6 py-6 bg-gradient-to-br from-white dark:from-slate-800 to-blue-50 dark:to-slate-700 border border-blue-100 dark:border-blue-900">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">📊</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Score Breakdown</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-100 dark:border-blue-900">
                <div className="text-xs font-semibold text-gray-600 dark:text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{typeof value === 'number' ? value.toFixed(1) : value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parsed Skills */}
      {parsedSkills && parsedSkills.length > 0 && (
        <div className="card-modern hover-lift overflow-hidden px-6 py-6 bg-gradient-to-br from-white dark:from-slate-800 to-green-50 dark:to-slate-700 border border-green-100 dark:border-green-900">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">🛠️</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Detected Skills ({parsedSkills.length})</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {parsedSkills.slice(0, 15).map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-white dark:bg-slate-800 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full border border-green-200 dark:border-green-900 hover-lift">
                {skill}
              </span>
            ))}
            {parsedSkills.length > 15 && (
              <span className="px-3 py-1 bg-green-100 dark:bg-slate-700 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full">
                +{parsedSkills.length - 15} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Detailed Feedback */}
      {feedback && feedback.length > 0 && (
        <div className="card-modern hover-lift overflow-hidden px-6 py-6 bg-gradient-to-br from-white dark:from-slate-800 to-amber-50 dark:to-slate-700 border border-amber-100 dark:border-amber-900">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">💡</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Detailed Feedback</h4>
          </div>
          <div className="space-y-2">
            {feedback.map((item, index) => (
              <div key={index} className="flex items-start p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-amber-900">
                <span className="text-amber-600 dark:text-amber-400 font-bold mr-3 flex-shrink-0">•</span>
                <span className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Close Button */}
      <div className="card-modern hover-lift overflow-hidden px-6 py-4 bg-gradient-to-r from-gray-50 dark:from-slate-800 to-gray-100 dark:to-slate-700 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          Close Results
        </button>
      </div>
    </div>
  )
}