const User = require('../models/user.model')

async function requireOnboarded(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Missing auth' })
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    const hasDepartment = !!(user.department && user.department.toString().trim())
    const hasGradYear = !!user.graduationYear
    if (!hasDepartment || !hasGradYear) {
      return res.status(403).json({ error: 'Onboarding required', onboardingRequired: true })
    }
    // attach full user document for downstream handlers if needed
    req.userDetails = user
    return next()
  } catch (err) {
    console.error('requireOnboarded error', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { requireOnboarded }
