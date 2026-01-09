require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { connect } = require('./db')
const app = express()
const bcrypt = require('bcryptjs')
const User = require('./models/user.model')
const { generateToken, verifyToken, requireRole } = require('./middleware/auth')
const { requireOnboarded } = require('./middleware/onboarding')
const { requireConsent } = require('./middleware/consent')

connect()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Register (university email login). Role defaults to 'student'.
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })

    // Optional domain restriction via env var
    const domain = process.env.UNIVERSITY_DOMAIN
    if (domain && !email.toLowerCase().endsWith(domain.toLowerCase())) {
      return res.status(400).json({ error: `email must be a ${domain} address` })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'User already exists' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, role: 'student' })
    const token = generateToken(user)
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = await User.findOne({ email })
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = generateToken(user)
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Consent endpoint (Phase 1 placeholder) - protected
app.post('/consent', verifyToken, requireOnboarded, async (req, res) => {
  try {
    const { consented } = req.body
    if (typeof consented !== 'boolean') return res.status(400).json({ error: 'consented (boolean) is required' })
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    user.dpdpConsent = { consented: !!consented, timestamp: new Date() }
    await user.save()
    return res.json({ message: 'Consent recorded', dpdpConsent: user.dpdpConsent })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

const { generateUploadUrl } = require('./s3')
const Resume = require('./models/resume.model')
const Score = require('./models/score.model')
const githubService = require('./services/github.service')
const badgeService = require('./services/badge.service')
const matchingService = require('./services/matching.service')
const Connection = require('./models/connection.model')

// GitHub OAuth entry
app.get('/auth/github', (req, res) => {
  const redirectUri = `${process.env.APP_URL || 'http://localhost:4000'}/auth/github/callback`
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user,repo`
  res.redirect(url)
})

// GitHub OAuth callback
app.get('/auth/github/callback', async (req, res) => {
  try {
    const { code } = req.query
    if (!code) return res.status(400).json({ error: 'No code provided' })

    const accessToken = await githubService.exchangeCodeForToken(code)
    const profile = await githubService.getGitHubProfile(accessToken)

    // 1. Try to find by GitHub ID
    let user = await User.findOne({ 'github.id': String(profile.id) })

    // 2. If not found, try to find by email (auto-link)
    if (!user && profile.email) {
      user = await User.findOne({ email: profile.email })
      if (user) {
        // Link existing user
        user.github = {
          id: String(profile.id),
          username: profile.login,
          accessToken: accessToken,
          avatarUrl: profile.avatar_url,
          metrics: user.github?.metrics || { commits: 0, mergedPRs: 0, stars: 0, originalRepos: 0 }
        }
        await user.save()
      }
    }

    // 3. If still not found, create new (if domain valid? skipping domain check for now or applying strictly?)
    // Applying strict domain check if configured, consistent with register
    if (!user) {
      const email = profile.email
      if (!email) return res.status(400).json({ error: 'GitHub account has no public email' })

      const domain = process.env.UNIVERSITY_DOMAIN
      if (domain && !email.toLowerCase().endsWith(domain.toLowerCase())) {
        return res.status(400).json({ error: `GitHub email must be a ${domain} address or link to an existing account` })
      }

      user = await User.create({
        name: profile.name || profile.login,
        email: email,
        role: 'student',
        github: {
          id: String(profile.id),
          username: profile.login,
          accessToken: accessToken,
          avatarUrl: profile.avatar_url,
          metrics: { commits: 0, mergedPRs: 0, stars: 0, originalRepos: 0 }
        }
      })
    } else {
      // Update token if user existed
      if (!user.github) user.github = {}
      user.github.accessToken = accessToken
      user.github.username = profile.login
      user.github.avatarUrl = profile.avatar_url
      // Ensure ID is set if retrieved by email
      user.github.id = String(profile.id)
      await user.save()
    }

    // Generate JWT
    const token = generateToken(user)

    // In a real app, we'd redirect to frontend with token in query or cookie
    // For backend-only/PoC, returning JSON
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, github: user.github.username } })

  } catch (err) {
    console.error('GitHub auth error:', err)
    return res.status(500).json({ error: 'Authentication failed' })
  }
})

// Manual Sync Endpoint
app.post('/github/sync', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user || !user.github || !user.github.accessToken) {
      return res.status(400).json({ error: 'User not connected to GitHub' })
    }

    const stats = await githubService.fetchGitHubStats(user.github.accessToken, user.github.username)

    user.github.metrics = stats
    user.github.lastSync = new Date()
    await user.save()

    // Recalculate Score
    const scoreDoc = await recalculateUserScore(user._id)

    return res.json({ message: 'GitHub stats synced', metrics: stats, score: scoreDoc })
  } catch (err) {
    console.error('GitHub sync error:', err)
    return res.status(500).json({ error: 'Sync failed' })
  }
})

// Generate a pre-signed upload URL for a resume (PUT). Returns resume metadata record and upload URL.
app.post('/resumes/upload-url', verifyToken, requireOnboarded, requireConsent, async (req, res) => {
  try {
    const { filename, contentType, size } = req.body
    if (!filename || !contentType) return res.status(400).json({ error: 'filename and contentType required' })

    const lower = filename.toLowerCase()
    const allowed = ['.pdf', '.docx']
    if (!allowed.some(ext => lower.endsWith(ext))) {
      return res.status(400).json({ error: 'Only PDF and DOCX files are allowed' })
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ error: 'Invalid contentType for PDF/DOCX' })
    }

    const userId = req.user.id
    const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())
    const ext = filename.slice(filename.lastIndexOf('.'))
    const key = `resumes/${userId}/${uuid}${ext}`

    // create metadata record (status pending)
    const resume = await Resume.create({
      user: userId,
      originalFilename: filename,
      contentType,
      size: size || 0,
      fileKey: key,
      status: 'pending'
    })

    const url = await generateUploadUrl(key, contentType)
    return res.json({ uploadUrl: url, fileKey: key, resumeId: resume._id })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Notify backend that client finished uploading to S3. Marks resume as uploaded (stores timestamp and size if provided).
app.post('/resumes/complete', verifyToken, requireOnboarded, requireConsent, async (req, res) => {
  try {
    const { resumeId, size } = req.body
    if (!resumeId) return res.status(400).json({ error: 'resumeId required' })
    const resume = await Resume.findById(resumeId)
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    if (resume.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not allowed' })
    resume.status = 'uploaded'
    if (size) resume.size = size
    resume.uploadedAt = new Date()
    await resume.save()

    // Trigger ATS service to parse and score the resume
    const atsServiceUrl = process.env.ATS_SERVICE_URL || 'http://localhost:8000'
    try {
      console.log(`Triggering ATS service for resume ${resumeId}...`)
      const axios = require('axios')
      const FormData = require('form-data')
      const { downloadFile } = require('./s3')

      // Download resume file from S3
      console.log(`Downloading resume from S3: ${resume.fileKey}`)
      const fileBuffer = await downloadFile(resume.fileKey)
      console.log(`Downloaded ${fileBuffer.length} bytes`)

      // Create form data
      const formData = new FormData()
      formData.append('file', fileBuffer, {
        filename: resume.originalFilename,
        contentType: resume.contentType
      })

      // Send to ATS service
      const atsResponse = await axios.post(`${atsServiceUrl}/parse`, formData, {
        headers: formData.getHeaders(),
        timeout: 60000, // 60 second timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      })

      console.log(`ATS service responded with score: ${atsResponse.data.atsScore}`)

      // Update resume with ATS results
      resume.atsScore = atsResponse.data.atsScore
      if (atsResponse.data.parsedSkills) {
        resume.parsedSkills = atsResponse.data.parsedSkills
      }
      if (atsResponse.data.parsingErrors) {
        resume.parsingErrors = atsResponse.data.parsingErrors
      }
      resume.status = 'scored'
      await resume.save()

      console.log(`ATS service completed successfully for resume ${resumeId}`)
    } catch (atsErr) {
      console.error('Failed to trigger ATS service:', atsErr.message)
      if (atsErr.response) {
        console.error('ATS service response:', atsErr.response.status, atsErr.response.data)
      }
      // Don't fail the request - ATS processing can happen async
    }

    // Recalculate employability score for the user
    try {
      await recalculateUserScore(req.user.id)
    } catch (err) {
      console.error('recalculateUserScore error after complete:', err)
    }
    return res.json({ message: 'Resume upload recorded', resumeId: resume._id })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})


// Endpoint for ATS service to POST scoring results back to BFF.
// Expects: { resumeId, atsScore, parsedSkills?, parsingErrors? }
app.post('/resumes/ats-result', async (req, res) => {
  try {
    const { resumeId, atsScore, parsedSkills, parsingErrors } = req.body
    if (!resumeId || typeof atsScore !== 'number') return res.status(400).json({ error: 'resumeId and numeric atsScore required' })
    const resume = await Resume.findById(resumeId)
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    // Update resume document with ATS results
    resume.atsScore = atsScore
    if (Array.isArray(parsedSkills)) resume.parsedSkills = parsedSkills
    if (Array.isArray(parsingErrors)) resume.parsingErrors = parsingErrors
    resume.status = 'scored'
    await resume.save()

    // Recalculate user score
    try {
      await recalculateUserScore(String(resume.user))
    } catch (err) {
      console.error('recalculateUserScore error after ats-result:', err)
    }

    return res.json({ message: 'ATS result recorded', resumeId: resume._id })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})




// --- Peer Discovery & Connections (Phase 2.3) ---

// Search Peers
app.get('/peers/search', verifyToken, async (req, res) => {
  try {
    const { skills, department, graduationYear, mode } = req.query
    const requiredSkills = skills ? skills.split(',').map(s => s.trim()) : []

    const results = await matchingService.findPeers(req.user.id, {
      requiredSkills,
      department,
      graduationYear
    }, mode)

    return res.json({ count: results.length, peers: results })
  } catch (err) {
    console.error('Peer search error:', err)
    return res.status(500).json({ error: 'Search failed' })
  }
})

// Send Connection Request
app.post('/connections', verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body
    if (!recipientId) return res.status(400).json({ error: 'recipientId required' })
    if (recipientId === req.user.id) return res.status(400).json({ error: 'Cannot connect with self' })

    const existing = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: recipientId },
        { requester: recipientId, recipient: req.user.id }
      ]
    })

    if (existing) {
      return res.status(409).json({ error: 'Connection already exists/pending', status: existing.status })
    }

    const conn = await Connection.create({
      requester: req.user.id,
      recipient: recipientId,
      status: 'pending'
    })

    return res.status(201).json({ message: 'Request sent', connectionId: conn._id })
  } catch (err) {
    console.error('Connection request error:', err)
    return res.status(500).json({ error: 'Request failed' })
  }
})

// List Connections
app.get('/connections', verifyToken, async (req, res) => {
  try {
    const conns = await Connection.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }]
    })
      .populate('requester', 'name email department graduationYear badges')
      .populate('recipient', 'name email department graduationYear badges')
      .sort({ updatedAt: -1 })

    const view = conns.map(c => {
      const isRequester = c.requester._id.toString() === req.user.id
      const other = isRequester ? c.recipient : c.requester

      let otherData = {}
      if (c.status === 'accepted') {
        otherData = {
          id: other._id,
          name: other.name,
          email: other.email,
          department: other.department,
          graduationYear: other.graduationYear,
          badges: other.badges
        }
      } else {
        // Mask Pending
        otherData = {
          id: other._id,
          maskedIdentity: `User #${String(other._id).slice(-4)}`,
          department: other.department
        }
      }

      return {
        connectionId: c._id,
        status: c.status,
        direction: isRequester ? 'outgoing' : 'incoming',
        peer: otherData,
        updatedAt: c.updatedAt
      }
    })

    return res.json({ connections: view })
  } catch (err) {
    console.error('List connections error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Respond to Request
app.put('/connections/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' })

    const conn = await Connection.findOne({
      _id: req.params.id,
      recipient: req.user.id
    })

    if (!conn) return res.status(404).json({ error: 'Request not found' })
    if (conn.status !== 'pending') return res.status(400).json({ error: 'Connection already processed' })

    conn.status = status
    await conn.save()

    return res.json({ message: `Connection ${status}`, connectionId: conn._id })
  } catch (err) {
    console.error('Respond connection error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})


const visualizationService = require('./services/visualization.service')
const { roles } = require('./data/roles')

// --- Visualization & Analytics (Phase 2.4) ---

// Get Available Target Roles
app.get('/vis/roles', verifyToken, (req, res) => {
  return res.json({ roles: roles.map(r => ({ id: r.id, label: r.label, description: r.description })) })
})

// Get Gap Analysis Result
// Query: roleId (required), peerId (optional - must be a connection?)
app.get('/vis/gap', verifyToken, async (req, res) => {
  try {
    const { roleId, peerId } = req.query
    if (!roleId) return res.status(400).json({ error: 'roleId is required' })

    // If peerId provided, verify connection?
    // Privacy: You can only compare with connections or maybe anonymized peers?
    // Prompt says "Compute user vs peer skill overlap". 
    // Let's enforce that if peerId is given, they must be connected OR it's a specific "Compare" action allowing it.
    // Assuming strict: must be connected.
    if (peerId) {
      const Conn = require('./models/connection.model') // Late require to avoid circ dep issues top-level if any
      const isConnected = await Conn.findOne({
        $or: [
          { requester: req.user.id, recipient: peerId, status: 'accepted' },
          { requester: peerId, recipient: req.user.id, status: 'accepted' }
        ]
      })
      if (!isConnected) return res.status(403).json({ error: 'Not connected to this peer' })
    }

    const data = await visualizationService.getGapAnalysis(req.user.id, roleId, peerId)
    return res.json({ roleId, data })
  } catch (err) {
    console.error('Vis gap error:', err)
    return res.status(500).json({ error: err.message || 'Server error' })
  }
})

async function recalculateUserScore(userId) {
  // Phase 1: ATS (50%)
  // Phase 2: GitHub (30%)
  // Phase 2.2: Badges (20%)

  const user = await User.findById(userId)
  if (!user) return null

  // 1. Get ATS Score
  const latestResume = await Resume.findOne({ user: userId, status: 'scored' }).sort({ uploadedAt: -1, updatedAt: -1 })
  let atsComponent = 0
  if (latestResume && typeof latestResume.atsScore === 'number') {
    atsComponent = latestResume.atsScore
  }

  // 2. Get GitHub Score
  let gitComponent = 0
  if (user.github && user.github.metrics) {
    gitComponent = githubService.calculateGitHubScore(user.github.metrics)
  }

  // 3. Evaluate Badges
  const badgeResult = badgeService.evaluateBadges(user, latestResume)
  const badgeComponent = badgeResult.score

  // Persist unlocked badges
  if (badgeResult.badges.length > 0) {
    user.badges = badgeResult.badges
    await user.save()
  }

  // 4. Weighted Sum
  // ATS: 50% (0.5), Git: 30% (0.3), Badge: 20% (0.2)
  const totalScore = Number((0.5 * atsComponent + 0.3 * gitComponent + 0.2 * badgeComponent).toFixed(2))

  let scoreDoc = await Score.findOne({ user: userId })
  if (!scoreDoc) {
    scoreDoc = await Score.create({
      user: userId,
      totalScore,
      atsComponent,
      gitComponent,
      badgeComponent
    })
  } else {
    scoreDoc.totalScore = totalScore
    scoreDoc.atsComponent = atsComponent
    scoreDoc.gitComponent = gitComponent
    scoreDoc.badgeComponent = badgeComponent
    await scoreDoc.save()
  }
  return scoreDoc
}

const crypto = require('crypto')

// Public leaderboard (anonymous-by-default)
// Query params: department, graduationYear, limit, page
app.get('/leaderboard', async (req, res) => {
  try {
    const { department, graduationYear, limit = 50, page = 1 } = req.query
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const lim = Math.max(1, Math.min(200, parseInt(limit, 10) || 50))

    const matchStage = {}
    if (department) matchStage['userDoc.department'] = department
    if (graduationYear) matchStage['userDoc.graduationYear'] = Number(graduationYear)

    const facet = {
      $facet: {
        data: [
          { $sort: { totalScore: -1 } },
          { $skip: (pageNum - 1) * lim },
          { $limit: lim },
        ],
        totalCount: [{ $count: 'count' }],
      },
    }

    const pipeline = [
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDoc' } },
      { $unwind: '$userDoc' },
    ]
    if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage })
    pipeline.push(facet)

    const agg = await Score.aggregate(pipeline)
    const data = (agg[0] && agg[0].data) || []
    const totalCount = (agg[0] && agg[0].totalCount[0] && agg[0].totalCount[0].count) || 0

    // Need global ranks. We will compute rankOffset = (page-1)*lim and assign ranks accordingly
    const rankOffset = (pageNum - 1) * lim
    const entries = data.map((d, i) => ({
      rank: rankOffset + i + 1,
      totalScore: d.totalScore,
      department: d.userDoc.department || null,
      graduationYear: d.userDoc.graduationYear || null,
      // anonymous-by-default: no user identifiers returned
    }))

    return res.json({ totalCount, page: pageNum, limit: lim, entries })
  } catch (err) {
    console.error('leaderboard error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Admin leaderboard: includes user identity (admin-only)
app.get('/leaderboard/admin', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { department, graduationYear, limit = 200, page = 1 } = req.query
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const lim = Math.max(1, Math.min(1000, parseInt(limit, 10) || 200))

    const matchStage = {}
    if (department) matchStage['userDoc.department'] = department
    if (graduationYear) matchStage['userDoc.graduationYear'] = Number(graduationYear)

    const facet = {
      $facet: {
        data: [
          { $sort: { totalScore: -1 } },
          { $skip: (pageNum - 1) * lim },
          { $limit: lim },
        ],
        totalCount: [{ $count: 'count' }],
      },
    }

    const pipeline = [
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDoc' } },
      { $unwind: '$userDoc' },
    ]
    if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage })
    pipeline.push(facet)

    const agg = await Score.aggregate(pipeline)
    const data = (agg[0] && agg[0].data) || []
    const totalCount = (agg[0] && agg[0].totalCount[0] && agg[0].totalCount[0].count) || 0

    const rankOffset = (pageNum - 1) * lim
    const entries = data.map((d, i) => ({
      rank: rankOffset + i + 1,
      totalScore: d.totalScore,
      user: {
        id: d.userDoc._id,
        name: d.userDoc.name,
        email: d.userDoc.email,
      },
      department: d.userDoc.department || null,
      graduationYear: d.userDoc.graduationYear || null,
    }))

    return res.json({ totalCount, page: pageNum, limit: lim, entries })
  } catch (err) {
    console.error('admin leaderboard error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Admin statistics: department-wise distribution (no PII)
app.get('/admin/stats/departments', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    // Fetch scores joined with users
    const docs = await Score.aggregate([
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDoc' } },
      { $unwind: '$userDoc' },
      { $project: { totalScore: 1, department: '$userDoc.department', graduationYear: '$userDoc.graduationYear' } },
    ])

    const byDept = {}
    for (const d of docs) {
      const dept = d.department || 'Unknown'
      if (!byDept[dept]) byDept[dept] = { scores: [] }
      byDept[dept].scores.push(d.totalScore || 0)
    }

    const result = []
    const buckets = Array.from({ length: 10 }, (_, i) => ({ min: i * 10, max: i * 10 + 9 }))
    for (const [dept, info] of Object.entries(byDept)) {
      const scores = info.scores
      const count = scores.length
      const avg = count ? (scores.reduce((a, b) => a + b, 0) / count) : 0
      const min = count ? Math.min(...scores) : 0
      const max = count ? Math.max(...scores) : 0
      // histogram buckets
      const hist = buckets.map(b => ({ range: `${b.min}-${b.max}`, count: 0 }))
      for (const s of scores) {
        const idx = Math.min(9, Math.floor((s || 0) / 10))
        hist[idx].count += 1
      }
      result.push({ department: dept, count, avg: Number(avg.toFixed(2)), min, max, histogram: hist })
    }
    return res.json({ departments: result })
  } catch (err) {
    console.error('admin stats departments error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Admin statistics: year-wise averages (no PII)
app.get('/admin/stats/years', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const docs = await Score.aggregate([
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDoc' } },
      { $unwind: '$userDoc' },
      { $project: { totalScore: 1, graduationYear: '$userDoc.graduationYear' } },
      { $group: { _id: '$graduationYear', count: { $sum: 1 }, avg: { $avg: '$totalScore' }, min: { $min: '$totalScore' }, max: { $max: '$totalScore' } } },
      { $sort: { _id: 1 } },
    ])
    const result = docs.map(d => ({ graduationYear: d._id || 'Unknown', count: d.count, avg: Number((d.avg || 0).toFixed(2)), min: d.min || 0, max: d.max || 0 }))
    return res.json({ years: result })
  } catch (err) {
    console.error('admin stats years error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Admin anonymized CSV export (no PII). Optional query params: department, graduationYear
app.get('/admin/export/anonymized.csv', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { department, graduationYear } = req.query
    const matchStage = {}
    if (department) matchStage['userDoc.department'] = department
    if (graduationYear) matchStage['userDoc.graduationYear'] = Number(graduationYear)

    const pipeline = [
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDoc' } },
      { $unwind: '$userDoc' },
    ]
    if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage })
    pipeline.push({ $sort: { totalScore: -1 } })
    const docs = await Score.aggregate(pipeline)

    // Build CSV in memory
    const rows = []
    rows.push(['anon_id', 'department', 'graduationYear', 'rank', 'totalScore'])
    let rank = 1
    for (const d of docs) {
      const uid = String(d.user)
      const hash = crypto.createHash('sha256').update(uid).digest('hex').slice(0, 12)
      const dept = (d.userDoc && d.userDoc.department) || ''
      const year = (d.userDoc && d.userDoc.graduationYear) || ''
      rows.push([hash, dept, year, String(rank), String(d.totalScore || 0)])
      rank += 1
    }

    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="leaderboard_anonymized.csv"')
    return res.send(csv)
  } catch (err) {
    console.error('admin export error', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Return current user profile (minimal)
app.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found' })
    const onboardingRequired = !(user.department && user.graduationYear)

    // Fetch user's score
    const scoreDoc = await Score.findOne({ user: req.user.id })
    const score = scoreDoc ? {
      totalScore: scoreDoc.totalScore || 0,
      atsComponent: scoreDoc.atsComponent || 0,
      gitComponent: scoreDoc.gitComponent || 0,
      badgeComponent: scoreDoc.badgeComponent || 0
    } : {
      totalScore: 0,
      atsComponent: 0,
      gitComponent: 0,
      badgeComponent: 0
    }

    // Fetch latest resume status
    const latestResume = await Resume.findOne({ user: req.user.id }).sort({ uploadedAt: -1 })
    const resumeStatus = latestResume ? {
      hasResume: true,
      status: latestResume.status,
      uploadedAt: latestResume.uploadedAt,
      atsScore: latestResume.atsScore || 0
    } : {
      hasResume: false
    }

    return res.json({ user, onboardingRequired, score, resumeStatus })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Onboarding: students must provide department and graduationYear
app.post('/onboarding', verifyToken, async (req, res) => {
  try {
    const { department, graduationYear } = req.body
    if (!department || !graduationYear) {
      return res.status(400).json({ error: 'department and graduationYear are required' })
    }
    const yearNum = Number(graduationYear)
    if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({ error: 'graduationYear must be a valid year' })
    }
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    user.department = department
    user.graduationYear = yearNum
    await user.save()
    return res.json({ message: 'Onboarding complete', user: { id: user._id, department: user.department, graduationYear: user.graduationYear } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// Example protected route for students
app.get('/protected/student', verifyToken, requireOnboarded, (req, res) => {
  return res.json({ message: `Hello ${req.user.name}, you are authenticated as ${req.user.role}` })
})

// Example admin-only route (requires onboarding as well)
app.get('/protected/admin', verifyToken, requireOnboarded, requireRole('admin'), (req, res) => {
  return res.json({ message: `Hello Admin ${req.user.name}` })
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Backend listening on ${port}`))
