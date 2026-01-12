import React, { useState, useEffect } from 'react'

export default function Badges() {
  const [badges, setBadges] = useState([])
  const [definitions, setDefinitions] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBadges()
    fetchDefinitions()
  }, [])

  const fetchBadges = async () => {
    try {
      const response = await fetch('http://localhost:4000/badges', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setBadges(data.badges)
      }
    } catch (err) {
      console.error('Error fetching badges:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDefinitions = async () => {
    try {
      const response = await fetch('http://localhost:4000/badges/definitions')
      if (response.ok) {
        const data = await response.json()
        setDefinitions(data.definitions)
      }
    } catch (err) {
      console.error('Error fetching badge definitions:', err)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading badges...</div>
  }

  const allBadgeTypes = Object.keys(definitions)
  const earnedBadgeTypes = new Set(badges.map(b => b.type))

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-gray-200 dark:border-slate-700">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Achievements & Badges</h3>

      {badges.length === 0 ? (
        <p className="text-gray-600 dark:text-slate-400 mb-6">No badges earned yet. Keep improving to unlock achievements!</p>
      ) : (
        <div className="mb-8">
          <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Earned Badges ({badges.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map(badge => (
              <div key={badge.type} className="bg-gradient-to-br from-yellow-50 dark:from-slate-700 to-orange-50 dark:to-slate-600 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-900">
                <p className="text-3xl mb-2">{badge.icon}</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{badge.name}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400">{badge.description}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Available Badges</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {allBadgeTypes.map(badgeType => {
            const def = definitions[badgeType]
            const earned = earnedBadgeTypes.has(badgeType)
            return (
              <div
                key={badgeType}
                className={`p-4 rounded-lg border-2 transition ${
                  earned
                    ? 'bg-gradient-to-br from-yellow-50 dark:from-slate-700 to-orange-50 dark:to-slate-600 border-yellow-300 dark:border-yellow-900'
                    : 'bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 opacity-60'
                }`}
              >
                <p className={`text-3xl mb-2 ${earned ? '' : 'grayscale'}`}>{def.icon}</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{def.name}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400">{def.description}</p>
                {earned && <p className="text-xs text-green-600 dark:text-green-400 mt-2">✓ Earned</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
