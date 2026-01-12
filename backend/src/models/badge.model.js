const mongoose = require('mongoose')

const BadgeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    badgeType: {
      type: String,
      enum: [
        'resume_master', // ATS score > 80
        'open_source_contributor', // 10+ commits
        'pull_request_pro', // 5+ merged PRs
        'polyglot_programmer', // 3+ languages
        'star_collector', // 50+ stars
        'networking_ninja', // 10+ connections
        'skill_seeker', // Completed skill gap analysis
      ],
      required: true,
    },
    earnedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 }, // 0-100 for progression
    metadata: mongoose.Schema.Types.Mixed, // flexible metadata per badge type
  },
  { timestamps: true }
)

// Compound index to prevent duplicate badges per user
BadgeSchema.index({ user: 1, badgeType: 1 }, { unique: true })

module.exports = mongoose.models.Badge || mongoose.model('Badge', BadgeSchema)
