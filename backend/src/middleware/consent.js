const User = require('../models/user.model')

async function requireConsent(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Missing auth' })
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (!user.dpdpConsent || !user.dpdpConsent.consented) {
      return res.status(403).json({ error: 'Consent required', consentRequired: true })
    }
    return next()
  } catch (err) {
    console.error('requireConsent error', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { requireConsent }
