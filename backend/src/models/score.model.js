const mongoose = require('mongoose')

const ScoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalScore: { type: Number, default: 0 },
    atsComponent: { type: Number, default: 0 },
    gitComponent: { type: Number, default: 0 },
    badgeComponent: { type: Number, default: 0 },

    // Breakdown detail (optional/redundant but kept for structure)
    breakdown: {
      atsComponent: { type: Number, default: 0 },
      gitComponent: { type: Number, default: 0 },
      badgeComponent: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
)

module.exports = mongoose.models.Score || mongoose.model('Score', ScoreSchema)
