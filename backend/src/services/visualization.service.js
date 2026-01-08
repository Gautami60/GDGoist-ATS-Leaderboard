const { roles } = require('../data/roles')
const Resume = require('../models/resume.model')
const User = require('../models/user.model')

/**
 * Normalizes a user's skills against a role's axes.
 * Returns chart-ready data: { axis: 'Frontend', value: 0-100, fullMark: 100 }
 */
function calculateRadarData(userSkills, roleId) {
    const role = roles.find(r => r.id === roleId)
    if (!role) throw new Error('Role not found')

    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase().trim()))

    return role.axes.map(axis => {
        // Count how many skills in this axis the user has
        const matchCount = axis.skills.reduce((count, skill) => {
            return userSkillSet.has(skill) ? count + 1 : count
        }, 0)

        // Score: (Matches / Total possible in axis) * 100
        // We might want to cap or curve it? 
        // If an axis has 10 skills, having 5 is pretty good (Senior level?). 
        // Let's use simple percentage for now, maybe with a mild curve or cap if strictly needed.
        // For boolean "has skill", linear is safest.

        // Avoid division by zero
        const total = axis.skills.length || 1
        const value = Math.round((matchCount / total) * 100)

        return {
            subject: axis.name, // 'subject' is standard format for Recharts Radar
            A: value,
            fullMark: 100,
            matches: matchCount, // Extra meta for tooltip
            total: total
        }
    })
}

/**
 * Compare User and Peer against a Target Role
 */
async function getGapAnalysis(userId, roleId, peerId = null) {
    // 1. Get User Skills
    const userResume = await Resume.findOne({ user: userId, status: 'scored' }).sort({ uploadedAt: -1 })
    const userSkills = userResume ? (userResume.parsedSkills || []) : []

    // 2. Base Radar (User vs Role)
    const userData = calculateRadarData(userSkills, roleId)

    // 3. If Peer, Get Peer Skills and Overlay
    let peerData = null
    if (peerId) {
        const peerResume = await Resume.findOne({ user: peerId, status: 'scored' }).sort({ uploadedAt: -1 })
        const peerSkills = peerResume ? (peerResume.parsedSkills || []) : []

        // We reuse the same axes calc, but just want the values mapped into the same object structure?
        // Usually Radar charts take data: [{ subject: 'Math', A: 120, B: 110, fullMark: 150 }]
        // So we should merge them.
        const pRadar = calculateRadarData(peerSkills, roleId)

        // Merge
        return userData.map((d, i) => ({
            ...d,
            B: pRadar[i].A, // Peer value
            peerMatches: pRadar[i].matches
        }))
    }

    return userData
}

module.exports = {
    getGapAnalysis
}
