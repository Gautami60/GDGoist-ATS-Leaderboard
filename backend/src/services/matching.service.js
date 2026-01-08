const User = require('../models/user.model')
const Resume = require('../models/resume.model')
const Score = require('../models/score.model')

/**
 * Jaccard Index = (Intersection) / (Union)
 * Returns 0 to 1
 */
function calculateJaccardIndex(skillsA, skillsB) {
    const setA = new Set(skillsA.map(s => s.toLowerCase()))
    const setB = new Set(skillsB.map(s => s.toLowerCase()))

    if (setA.size === 0 && setB.size === 0) return 0

    const intersection = new Set([...setA].filter(x => setB.has(x)))
    const union = new Set([...setA, ...setB])

    return intersection.size / union.size
}

/**
 * Find peers based on filters and skills.
 * 
 * Strategy:
 * 1. Fetch Requesting User's latest scored resume for skills.
 * 2. Candidates: Users with same Department/Year (if filtered).
 * 3. Fetch Candidates' latest resumes (derived data or join).
 * 4. Compute Similarity.
 */
async function findPeers(userId, filters = {}, mode = 'similar') {
    // 1. Get current user's skills
    const myResume = await Resume.findOne({ user: userId, status: 'scored' }).sort({ uploadedAt: -1 })
    const mySkills = myResume ? (myResume.parsedSkills || []) : []

    // 2. Build candidate query
    // We need to look up Users first, then their resumes.
    // Or look up Resumes, then populate User (checking department filters).

    // Let's query Aggregation on Resume + Lookup User + Lookup Score
    const pipeline = []

    // Match only scored resumes
    pipeline.push({ $match: { status: 'scored' } })

    // Sort by date desc to process latest resumes first? 
    // Actually, we need "latest resume per user".
    pipeline.push({ $sort: { uploadedAt: -1 } })
    pipeline.push({
        $group: {
            _id: '$user',
            resumeId: { $first: '$_id' },
            skills: { $first: '$parsedSkills' },
            uploadedAt: { $first: '$uploadedAt' }
        }
    })

    // Exclude self
    pipeline.push({ $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } })

    // Lookup User details
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userDoc'
        }
    })
    pipeline.push({ $unwind: '$userDoc' })

    // Apply filters on UserDoc
    const matchUser = {}
    if (filters.department) matchUser['userDoc.department'] = filters.department
    if (filters.graduationYear) matchUser['userDoc.graduationYear'] = Number(filters.graduationYear)

    // Boolean Skill Filter (Must have THESE skills)
    // This is separate from Jaccard matching (which ranks them). 
    // If 'requiredSkills' is provided:
    if (filters.requiredSkills && filters.requiredSkills.length > 0) {
        // Logic: Candidates must have ALL required skills? Or ANY?
        // Prompt says "Boolean filters (skills...)"
        // Usually "skills=Python,React" in query means "contains these".
        // Let's assume inclusive OR or AND. Let's do AND for strict filtering, or just use it as pre-filter.
        // Simplest: Must contain at least one of the queried skills? Or All?
        // Let's implement: Must contain ALL specified required skills (AND).
        const reqSkills = filters.requiredSkills.map(s => s.toLowerCase())
        // We can't easily regex match array in aggregate $match without complex expressions.
        // But we can filter in JS loop if dataset small, or use $setIsSubset logic.
        // Let's handle logic in JS for Phase 2 PoC or basic $match if possible.
        // Actually, simple regex on the array works for "in" check.
        // matchUser['skills'] = { $all: ... } - checking case insensitive is hard in mongo query.
        // We will filter in JS step for case-insensitivity correctness.
    }

    if (Object.keys(matchUser).length > 0) {
        pipeline.push({ $match: matchUser })
    }

    // Lookup Score (for Rank/TotalScore)
    pipeline.push({
        $lookup: {
            from: 'scores',
            localField: '_id',
            foreignField: 'user',
            as: 'scoreDoc'
        }
    })
    // Unwind score (optional, handle if missing)
    pipeline.push({
        $addFields: {
            totalScore: { $ifNull: [{ $arrayElemAt: ['$scoreDoc.totalScore', 0] }, 0] }
        }
    })

    // Executes
    const candidates = await Resume.aggregate(pipeline)

    // 3. Process matching and masking
    const results = candidates.map(c => {
        const peerSkills = c.skills || []

        // Filter check: Required Skills (Case-insensitive)
        if (filters.requiredSkills && filters.requiredSkills.length > 0) {
            const peerSkillsLower = new Set(peerSkills.map(s => s.toLowerCase()))
            const hasAll = filters.requiredSkills.every(req => peerSkillsLower.has(req.toLowerCase()))
            if (!hasAll) return null
        }

        const jaccard = calculateJaccardIndex(mySkills, peerSkills)

        // Mode logic:
        // Similar: High Jaccard
        // Complementary: Low Jaccard? Or specifically "Has skills I don't have"?
        // Usually "Complementary" means "They have what I need".
        // For PoC: Sort by Jaccard Ascending (Dissimilar) vs Descending (Similar).

        return {
            userId: c._id,
            department: c.userDoc.department,
            graduationYear: c.userDoc.graduationYear,
            skills: peerSkills.slice(0, 5), // Show top 5 skills
            totalScore: c.totalScore,
            matchScore: jaccard, // 0-1
            maskedIdentity: `User #${String(c._id).slice(-4)}` // Masked
        }
    }).filter(c => c !== null)

    // Sort
    if (mode === 'complementary') {
        // Find ones with LOW Jaccard (but not 0? 0 means no overlap. Compl means distinct sets.)
        // Alternatively: Complementary could be "High distinct skills count".
        // Simple interpretation: Sort by Jaccard Ascending.
        results.sort((a, b) => a.matchScore - b.matchScore)
    } else {
        // Similar: Sort by Jaccard Descending
        results.sort((a, b) => b.matchScore - a.matchScore)
    }

    return results.slice(0, 50) // Limit
}

module.exports = {
    findPeers,
    calculateJaccardIndex
}
