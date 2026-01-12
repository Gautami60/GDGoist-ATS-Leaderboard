import React, { useState, useEffect } from 'react'

export default function SkillGap() {
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [userSkills, setUserSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [newProficiency, setNewProficiency] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [gapAnalysis, setGapAnalysis] = useState(null)

  const commonRoles = [
    'Software Engineer',
    'Data Scientist',
    'DevOps Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Machine Learning Engineer',
    'Product Manager',
    'UX Designer',
  ]

  // Role-specific required skills
  const roleSkillsMap = {
    'Software Engineer': ['Python', 'JavaScript', 'System Design', 'Data Structures', 'Algorithms', 'Git', 'SQL'],
    'Data Scientist': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization', 'TensorFlow', 'Pandas'],
    'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Monitoring'],
    'Frontend Developer': ['JavaScript', 'React', 'CSS', 'HTML', 'TypeScript', 'Redux', 'Responsive Design'],
    'Backend Developer': ['Python', 'Node.js', 'SQL', 'REST APIs', 'Databases', 'Authentication', 'Caching'],
    'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB', 'Git', 'Docker'],
    'Machine Learning Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Statistics', 'Linear Algebra', 'NLP', 'Computer Vision'],
    'Product Manager': ['Product Strategy', 'User Research', 'Analytics', 'Communication', 'Leadership', 'Roadmapping'],
    'UX Designer': ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'CSS', 'Accessibility'],
  }

  useEffect(() => {
    console.log('SkillGap component mounted')
    // Load from localStorage if available
    const saved = localStorage.getItem('skillGapData')
    console.log('Saved data from localStorage:', saved)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        console.log('Parsed saved data:', data)
        setTargetRole(data.targetRole || 'Software Engineer')
        setUserSkills(data.userSkills || [])
      } catch (err) {
        console.error('Error loading saved skill gap data:', err)
      }
    }
    setLoading(false)
  }, [])

  // Monitor userSkills changes
  useEffect(() => {
    console.log('userSkills updated:', userSkills)
  }, [userSkills])

  const calculateGaps = () => {
    console.log('Calculating gaps for role:', targetRole)
    console.log('User skills:', userSkills)
    
    const requiredSkills = roleSkillsMap[targetRole] || []
    console.log('Required skills:', requiredSkills)
    
    if (!requiredSkills || requiredSkills.length === 0) {
      setError('No skills defined for this role')
      return
    }
    
    const gaps = []

    requiredSkills.forEach(skill => {
      const userSkill = userSkills.find(s => s.skill.toLowerCase() === skill.toLowerCase())
      const userProf = userSkill ? userSkill.proficiency : 0
      const gapScore = Math.max(0, 100 - userProf)
      gaps.push({
        skill,
        userProficiency: userProf,
        targetImportance: 100,
        gapScore
      })
    })

    const overallGapScore = gaps.length > 0 ? Math.round(gaps.reduce((sum, g) => sum + g.gapScore, 0) / gaps.length) : 0

    const analysis = {
      targetRole,
      gaps,
      overallGapScore,
      skillsToLearn: gaps.filter(g => g.gapScore > 50).map(g => g.skill),
      skillsToImprove: gaps.filter(g => g.gapScore > 0 && g.gapScore <= 50).map(g => g.skill)
    }
    
    console.log('Gap analysis result:', analysis)
    console.log('Setting gapAnalysis state...')
    setGapAnalysis(analysis)
    setError('')
    console.log('Gap analysis set successfully')
  }

  const handleAddSkill = () => {
    console.log('Adding skill:', newSkill, 'with proficiency:', newProficiency)
    if (!newSkill.trim()) {
      setError('Please enter a skill name')
      return
    }
    
    if (userSkills.some(s => s.skill.toLowerCase() === newSkill.toLowerCase())) {
      setError('This skill already exists')
      return
    }

    const updated = [...userSkills, { skill: newSkill, proficiency: newProficiency }]
    console.log('Updated skills:', updated)
    setUserSkills(updated)
    setNewSkill('')
    setNewProficiency(50)
    setError('')
  }

  const handleRemoveSkill = (index) => {
    setUserSkills(userSkills.filter((_, i) => i !== index))
  }

  const handleUpdateSkillProficiency = (index, newProf) => {
    console.log('Updating skill at index', index, 'to proficiency', newProf)
    const updated = [...userSkills]
    updated[index] = { ...updated[index], proficiency: newProf }
    console.log('Updated skill:', updated[index])
    setUserSkills(updated)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      
      const dataToSave = {
        targetRole,
        userSkills,
        savedAt: new Date().toISOString()
      }
      
      console.log('Saving skill gap data:', dataToSave)
      // Save to localStorage
      localStorage.setItem('skillGapData', JSON.stringify(dataToSave))
      console.log('Data saved to localStorage successfully')

      // Calculate gaps
      calculateGaps()
      
      setSuccess('Skill gap analysis saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to save skill gap analysis')
      console.error('Error saving skill gap:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = () => {
    console.log('Analyze button clicked')
    console.log('Current userSkills:', userSkills)
    console.log('Current targetRole:', targetRole)
    
    if (userSkills.length === 0) {
      setError('Please add at least one skill before analyzing')
      return
    }
    
    calculateGaps()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-modern hover-lift overflow-hidden px-6 py-6 bg-gradient-to-br from-white dark:from-slate-800 to-purple-50 dark:to-slate-700 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
            <span className="text-white text-lg">📊</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Skill Gap Analysis</h3>
        </div>
        <p className="text-gray-600 dark:text-slate-400 text-sm ml-14">Identify skills you need to develop for your target role</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="card-modern bg-red-50 dark:bg-slate-800 border border-red-200 dark:border-red-900 px-6 py-4 text-red-700 dark:text-red-400">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}
      {success && (
        <div className="card-modern bg-green-50 dark:bg-slate-800 border border-green-200 dark:border-green-900 px-6 py-4 text-green-700 dark:text-green-400">
          <p className="font-semibold">✓ {success}</p>
        </div>
      )}

      {/* Target Role Selection */}
      <div className="card-modern hover-lift overflow-hidden px-6 py-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Target Role</label>
        <select
          value={targetRole}
          onChange={(e) => {
            setTargetRole(e.target.value)
            setGapAnalysis(null)
          }}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
        >
          {commonRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Your Skills */}
      <div className="card-modern hover-lift overflow-hidden px-6 py-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Current Skills</h4>
        
        {userSkills.length > 0 ? (
          <div className="space-y-3 mb-6">
            {userSkills.map((skill, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 dark:from-slate-700 to-indigo-50 dark:to-slate-600 rounded-lg border border-blue-100 dark:border-blue-900">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{skill.skill}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold ml-2"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.proficiency}
                    onChange={(e) => handleUpdateSkillProficiency(idx, Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-300 w-12 text-right">{skill.proficiency}%</span>
                </div>
                <div className="w-full bg-gray-300 dark:bg-slate-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${skill.proficiency}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">No skills added yet. Add your current skills below.</p>
        )}

        {/* Add Skill Form */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Add a Skill</p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="e.g., Python, React, AWS"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
            />
            <div>
              <label className="text-sm text-gray-600 dark:text-slate-400 font-medium">Proficiency: {newProficiency}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={newProficiency}
                onChange={(e) => setNewProficiency(Number(e.target.value))}
                className="w-full mt-1"
              />
            </div>
            <button
              onClick={handleAddSkill}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold"
            >
              Add Skill
            </button>
          </div>
        </div>
      </div>

      {/* Gap Analysis Results */}
      {gapAnalysis && (
        <div className="space-y-4 animate-slideIn">
          {/* Overall Score */}
          <div className="card-modern hover-lift overflow-hidden px-6 py-6 bg-gradient-to-br from-white dark:from-slate-800 to-purple-50 dark:to-slate-700 border border-purple-100 dark:border-purple-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">Overall Gap Score</p>
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{gapAnalysis.overallGapScore}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Lower is better (0 = fully skilled)</p>
              </div>
              <div className="text-5xl">📈</div>
            </div>
          </div>

          {/* Skills to Learn */}
          {gapAnalysis.skillsToLearn && gapAnalysis.skillsToLearn.length > 0 && (
            <div className="card-modern hover-lift overflow-hidden px-6 py-6 bg-gradient-to-br from-white dark:from-slate-800 to-red-50 dark:to-slate-700 border border-red-100 dark:border-red-900">
              <h5 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-lg">🎯</span> Critical Skills to Learn
              </h5>
              <div className="flex flex-wrap gap-2">
                {gapAnalysis.skillsToLearn.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-red-100 dark:bg-slate-700 text-red-800 dark:text-red-400 rounded-full text-sm font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills to Improve */}
          {gapAnalysis.skillsToImprove && gapAnalysis.skillsToImprove.length > 0 && (
            <div className="card-modern hover-lift overflow-hidden px-6 py-6 bg-gradient-to-br from-white dark:from-slate-800 to-yellow-50 dark:to-slate-700 border border-yellow-100 dark:border-yellow-900">
              <h5 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-lg">⚡</span> Skills to Improve
              </h5>
              <div className="flex flex-wrap gap-2">
                {gapAnalysis.skillsToImprove.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-yellow-100 dark:bg-slate-700 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Gaps */}
          <div className="card-modern hover-lift overflow-hidden px-6 py-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <h5 className="font-bold text-gray-900 dark:text-white mb-4">Required Skills for {targetRole}</h5>
            <div className="space-y-3">
              {gapAnalysis.gaps && gapAnalysis.gaps.map((gap, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{gap.skill}</p>
                    <span className="text-sm font-bold text-gray-600 dark:text-slate-400">{gap.userProficiency}% / 100%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        gap.gapScore > 50 ? 'bg-red-500' : gap.gapScore > 0 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${gap.userProficiency}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="card-modern px-6 py-4 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-xs text-gray-700 dark:text-slate-300">
        <div className="font-bold mb-2">Debug Info:</div>
        <div>Target Role: {targetRole}</div>
        <div>Skills Added: {userSkills.length}</div>
        <div>Gap Analysis Active: {gapAnalysis ? 'Yes' : 'No'}</div>
        {gapAnalysis && <div>Overall Gap Score: {gapAnalysis.overallGapScore}</div>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-bold disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Gaps'}
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-bold disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Analysis'}
        </button>
      </div>
    </div>
  )
}
