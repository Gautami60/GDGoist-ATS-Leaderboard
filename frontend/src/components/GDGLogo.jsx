import React from 'react'

export default function GDGLogo({ size = 'md', showText = true }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  return (
    <div className="flex items-center gap-2">
      {/* GDG Logo - Exact interlocking design */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {/* Blue rounded pill - left bottom */}
          <path
            d="M 15 55 Q 15 40 25 35 L 45 25 Q 55 20 60 30 L 60 80 Q 55 90 45 85 L 25 75 Q 15 70 15 55 Z"
            fill="#4285F4"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Red rounded pill - top left */}
          <path
            d="M 30 15 Q 45 5 55 15 L 70 35 Q 75 45 65 55 L 50 45 Q 40 35 30 40 Z"
            fill="#EA4335"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Green rounded pill - top right */}
          <path
            d="M 65 15 Q 80 10 90 20 L 100 40 Q 105 50 95 60 L 80 50 Q 70 40 65 35 Z"
            fill="#34A853"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Yellow rounded pill - bottom right */}
          <path
            d="M 60 60 L 75 75 Q 90 90 80 105 Q 65 115 55 105 L 45 85 Q 40 70 60 60 Z"
            fill="#FBBC04"
            stroke="#1a1a1a"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-bold text-gray-900`}>
            GDGoist
          </span>
          <span className={`${textSizeClasses[size]} text-gray-600 leading-tight`}>
            ATS Leaderboard
          </span>
        </div>
      )}
    </div>
  )
}
