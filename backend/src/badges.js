const Badge = require('./models/badge.model')
const Resume = require('./models/resume.model')
const GitHub = require('./models/github.model')

const BADGE_DEFINITIONS = {
  resume_master: {
    name: 'Resume Master',
    description: 'Achieved ATS score > 80',
    icon: '📄',
    requirement: { type: 'atsScore', threshold: 80 },
  },
  open_source_contributor: {
    name: 'Open Source Contributor',
    description: '10+ commits on GitHub',
    icon: '🚀',
    requirement: { type: 'commits', threshold: 10 },
  },
  pull_request_pro: {
    name: 'Pull Request Pro',
    description: '5+ merged pull requests',
    icon: '🔀',
    requirement: { type: 'prs', threshold: 5 },
  },
  polyglot_programmer: {
    name: 'Polyglot Programmer',
    description: 'Proficient in 3+ programming languages',
    icon: '🌐',
    requirement: { type: 'languages', threshold: 3 },
  },
  star_collector: {
    name: 'Star Collector',
    description: '50+ stars on repositories',
    icon: '⭐',
    requirement: { type: 'stars', threshold: 50 },
  },
  networking_ninja: {
    name: 'Networking Ninja',
    description: '10+ accepted connections',
    icon: '🥷',
    requirement: { type: 'connections', threshold: 10 },
  },
  skill_seeker: {
    name: 'Skill Seeker',
    description: 'Completed skill gap analysis',
    icon: '📊',
    requirement: { type: 'skillGap', threshold: 1 },
  },
}

// Check and award badges for a user
async function checkAndAwardBadges(userId) {
  const awarded = []

  // Get user data
  const latestResume = await Resume.findOne({ user: userId, status: 'scored' }).sort({ uploadedAt: -1 })
  const githubData = await GitHub.findOne({ user: userId })

  // Resume Master
  if (latestResume && latestResume.atsScore > 80) {
    const badge = await awardBadge(userId, 'resume_master', { atsScore: latestResume.atsScore })
    if (badge) awarded.push('resume_master')
  }

  // GitHub-based badges
  if (githubData && githubData.stats) {
    // Open Source Contributor
    if (githubData.stats.totalCommits >= 10) {
      const badge = await awardBadge(userId, 'open_source_contributor', { commits: githubData.stats.totalCommits })
      if (badge) awarded.push('open_source_contributor')
    }

    // Pull Request Pro
    if (githubData.stats.totalPullRequests >= 5) {
      const badge = await awardBadge(userId, 'pull_request_pro', { prs: githubData.stats.totalPullRequests })
      if (badge) awarded.push('pull_request_pro')
    }

    // Polyglot Programmer
    if (githubData.stats.languages && githubData.stats.languages.length >= 3) {
      const badge = await awardBadge(userId, 'polyglot_programmer', { languages: githubData.stats.languages })
      if (badge) awarded.push('polyglot_programmer')
    }

    // Star Collector
    if (githubData.stats.totalStars >= 50) {
      const badge = await awardBadge(userId, 'star_collector', { stars: githubData.stats.totalStars })
      if (badge) awarded.push('star_collector')
    }
  }

  return awarded
}

// Award a badge to a user (idempotent)
async function awardBadge(userId, badgeType, metadata = {}) {
  try {
    const existing = await Badge.findOne({ user: userId, badgeType })
    if (existing) return null // Already awarded

    const badge = await Badge.create({
      user: userId,
      badgeType,
      metadata,
    })
    return badge
  } catch (err) {
    console.error(`Error awarding badge ${badgeType}:`, err.message)
    return null
  }
}

// Get user badges
async function getUserBadges(userId) {
  const badges = await Badge.find({ user: userId }).sort({ earnedAt: -1 })
  return badges.map(b => ({
    type: b.badgeType,
    ...BADGE_DEFINITIONS[b.badgeType],
    earnedAt: b.earnedAt,
    progress: b.progress,
  }))
}

// Calculate badge contribution to score (0-20 points)
function calculateBadgeScore(badgeCount) {
  // Each badge worth 2 points, max 10 badges = 20 points
  return Math.min(20, badgeCount * 2)
}

module.exports = {
  BADGE_DEFINITIONS,
  checkAndAwardBadges,
  awardBadge,
  getUserBadges,
  calculateBadgeScore,
}
