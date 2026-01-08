const mongoose = require('mongoose')

const ConnectionSchema = new mongoose.Schema(
    {
        requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        // Optional: message or note (if allowed, but constraint says "No chat", maybe a preset greeting is allowed? Keeping minimal)
    },
    { timestamps: true }
)

// Index for fast lookups
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true })
ConnectionSchema.index({ recipient: 1 })

module.exports = mongoose.models.Connection || mongoose.model('Connection', ConnectionSchema)
