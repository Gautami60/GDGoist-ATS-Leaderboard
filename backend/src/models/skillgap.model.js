const mongoose = require('mongoose')

const SkillGapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    targetRole: { type: String, default: 'Software Engineer' }, // e.g., 'Data Scientist', 'DevOps Engineer'
    userSkills: [
      {
        skill: String,
        proficiency: { type: Number, min: 0, max: 100 }, // 0-100
        source: { type: String, enum: ['resume', 'github', 'manual'], default: 'resume' },
      }
    ],
    targetSkills: [
      {
        skill: String,
        importance: { type: Number, min: 0, max: 100 }, // how important for target role
      }
    ],
    gaps: [
      {
        skill: String,
        userProficiency: { type: Number, min: 0, max: 100 },
        targetImportance: { type: Number, min: 0, max: 100 },
        gapScore: { type: Number, min: 0, max: 100 }, // calculated gap
      }
    ],
    overallGapScore: { type: Number, min: 0, max: 100 }, // average gap
    lastAnalyzedAt: { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.models.SkillGap || mongoose.model('SkillGap', SkillGapSchema)
