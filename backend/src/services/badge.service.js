/**
 * Badge Definitions
 * Schema:
 *  - id: unique identifier
 *  - name: display name
 *  - description: criteria description
 *  - weight: contribution to badgeComponent score
 *  - check: function(user, latestResume) => boolean
 */

const BADGES = {
    RESUME_MASTER: {
        id: 'resume_master',
        name: 'Resume Master',
        description: 'Achieve an ATS score of 90 or higher on any resume.',
        weight: 40,
        check: (user, latestResume) => {
            if (!latestResume || typeof latestResume.atsScore !== 'number') return false
            return latestResume.atsScore >= 90
        }
    },
    OPEN_SOURCE_CONTRIBUTOR: {
        id: 'os_contributor',
        name: 'Open Source Contributor',
        description: 'Have at least 1 merged Pull Request.',
        weight: 30,
        check: (user) => {
            if (!user.github || !user.github.metrics) return false
            return (user.github.metrics.mergedPRs || 0) >= 1
        }
    },
    CONSISTENT_CODER: {
        id: 'consistent_coder',
        name: 'Consistent Coder',
        description: 'Have at least 100 commits in the last year.',
        weight: 30,
        check: (user) => {
            if (!user.github || !user.github.metrics) return false
            return (user.github.metrics.commits || 0) >= 100
        }
    }
}

/**
 * Evaluate badges for a user.
 * Returns: { newBadges: [String], totalParams: { ... } }
 * Note: Should be called during score recalculation.
 */
function evaluateBadges(user, latestResume) {
    const currentBadges = new Set(user.badges || [])
    const allBadges = Object.values(BADGES)

    let scoreContribution = 0

    // Re-evaluate all badges (idempotent check based on current state)
    // If a user *loses* criteria, do we remove the badge? 
    // "Gamification" usually implies once unlocked, it stays unlocked.
    // However, for a leaderboard reflecting *current* employability, we might want dynamic.
    // Given "Unlocked badges", let's assume they stick once earned unless we decide to strictly re-sync.
    // BUT: The prompt says "Store unlocked badges", implies accumulation.
    // Let's go with: Only ADD badges that are newly met. Existing badges stay.

    const updatedBadges = new Set(currentBadges)

    allBadges.forEach(badge => {
        // If already has it, add weight? Or only add weight if criteria still met?
        // "Badge based gamification... rewards verified progress."
        // Let's assume you keep the badge once earned.

        // Check if criteria met now
        const isMet = badge.check(user, latestResume)

        if (isMet) {
            updatedBadges.add(badge.id)
        }
    })

    // Calculate score based on *held* badges (whether just earned or previously earned)
    // Actually, if we stick to "once earned, always earned", we just iterate updatedBadges.
    updatedBadges.forEach(badgeId => {
        const badgeDef = Object.values(BADGES).find(b => b.id === badgeId)
        if (badgeDef) {
            scoreContribution += badgeDef.weight
        }
    })

    // Normalize or cap?
    // Weights: 40 + 30 + 30 = 100. So max is 100.
    // Perfect.

    return {
        badges: Array.from(updatedBadges),
        score: Math.min(100, scoreContribution)
    }
}

module.exports = {
    BADGES,
    evaluateBadges
}
