import React, { useState } from 'react'

export default function PeerDiscovery() {
  const [searchSkills, setSearchSkills] = useState('')
  const [peers, setPeers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [connections, setConnections] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchSkills.trim()) return

    try {
      setLoading(true)
      setError(null)
      const skills = searchSkills.split(',').map(s => s.trim())
      const query = new URLSearchParams({ skills: skills.join(',') })
      const response = await fetch(`http://localhost:4000/peers/search?${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setPeers(data.peers)
      } else {
        setError('Failed to search peers')
      }
    } catch (err) {
      setError('Error searching peers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (peerId) => {
    try {
      const response = await fetch('http://localhost:4000/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ recipientId: peerId })
      })
      if (response.ok) {
        setConnections([...connections, peerId])
        alert('Connection request sent!')
      } else {
        alert('Failed to send connection request')
      }
    } catch (err) {
      console.error('Error sending connection request:', err)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Find Peers</h3>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by skills (e.g., Python, JavaScript, Go)"
            value={searchSkills}
            onChange={(e) => setSearchSkills(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}

      {peers.length === 0 && searchSkills && !loading && (
        <p className="text-gray-600 dark:text-gray-400">No peers found with those skills.</p>
      )}

      <div className="space-y-4">
        {peers.map(peer => (
          <div key={peer.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition bg-white dark:bg-slate-700">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{peer.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{peer.department}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{peer.score}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
              </div>
            </div>

            {peer.skills && peer.skills.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {peer.skills.map(skill => (
                    <span key={skill} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => handleConnect(peer.id)}
              disabled={connections.includes(peer.id)}
              className="w-full bg-green-600 dark:bg-green-700 text-white py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              {connections.includes(peer.id) ? 'Request Sent' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
