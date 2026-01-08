const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, index: true, unique: true, sparse: true },
    passwordHash: { type: String },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    department: { type: String },
    graduationYear: { type: Number },
    dpdpConsent: {
      consented: { type: Boolean, default: false },
      timestamp: { type: Date },
    },
    // Phase 2.1: GitHub Integration
    github: {
      id: { type: String, sparse: true, unique: true },
      username: { type: String },
      accessToken: { type: String },
      avatarUrl: { type: String },
      lastSync: { type: Date },
      metrics: {
        commits: { type: Number, default: 0 },
        mergedPRs: { type: Number, default: 0 },
        stars: { type: Number, default: 0 },
        originalRepos: { type: Number, default: 0 },
      }
    },
    // Gamification Badges (Phase 2.2)
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
)

module.exports = mongoose.models.User || mongoose.model('User', UserSchema)
