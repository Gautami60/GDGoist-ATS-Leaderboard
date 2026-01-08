const axios = require('axios')
const User = require('../models/user.model')

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
// Fallback if not set, though it should be set in .env
const GITHUB_API_URL = 'https://api.github.com'

/**
 * Exchange OAuth code for access token
 */
async function exchangeCodeForToken(code) {
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        throw new Error('GitHub Client ID/Secret not configured')
    }

    const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
        },
        {
            headers: { Accept: 'application/json' },
        }
    )

    if (response.data.error) {
        throw new Error(`GitHub OAuth error: ${response.data.error_description}`)
    }

    return response.data.access_token
}

/**
 * Fetch GitHub User Profile
 */
async function getGitHubProfile(accessToken) {
    const response = await axios.get(`${GITHUB_API_URL}/user`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response.data
}

/**
 * Fetch stats logic:
 * - Commits (last 12 months)
 * - Merged PRs
 * - Stars
 * - Original Repos
 * 
 * Note: Fetching precise commit counts for the last year usually requires GraphQL or paging many events.
 * For this Phase 2.1 implementation, we will use a simpler approximation restricted by the "no complicated cron" constraint.
 * Method: 
 * 1. Fetch user repositories (public)
 * 2. Sum stars.
 * 3. Count non-fork repos.
 * 4. For commits/PRs, we can use the search API for faster aggregation or just Events API (limited to last 90 days/300 events).
 *    PRD/PoC usually implies we want *all time* or *last year*. Search API is best for "merged PRs".
 *    Commits is harder via REST without many calls. We will check the "public_repos" count or use Search API for commits by author.
 */
async function fetchGitHubStats(accessToken, username) {
    const headers = { Authorization: `Bearer ${accessToken}` }

    // 1. Get User Data for totals
    const userRes = await axios.get(`${GITHUB_API_URL}/users/${username}`, { headers })
    // Note: userRes.data.public_repos includes forks? No, usually creates. But let's verify via repo list if want "original".

    // 2. Fetch Repos (up to 100 for now, paging if needed but keeping it simple)
    // Filtering for non-forks
    let originalReposCount = 0
    let starsCount = 0

    let page = 1
    let fetchMore = true
    while (fetchMore && page <= 3) { // limit 3 pages (300 repos) to avoid timeout
        const reposRes = await axios.get(`${GITHUB_API_URL}/user/repos?per_page=100&type=owner&page=${page}`, { headers })
        const repos = reposRes.data
        if (repos.length === 0) {
            fetchMore = false
        } else {
            repos.forEach(repo => {
                if (!repo.fork) {
                    originalReposCount++
                    starsCount += repo.stargazers_count
                }
            })
            page++
        }
    }

    // 3. Search for Merged PRs
    // "is:pr is:merged author:username"
    const prSearchUrl = `${GITHUB_API_URL}/search/issues?q=is:pr+is:merged+author:${username}`
    const prRes = await axios.get(prSearchUrl, { headers })
    const mergedPRs = prRes.data.total_count

    // 4. Commits (Last 12 months)
    // "author:username committer-date:>YYYY-MM-DD"
    // Note: Search commits is in preview 'cloak-preview' sometimes, or just standard now.
    // Actually "commits" search is not fully open/reliable via standard search API same as issues.
    // Alternative: use /events and count PushEvents (limited history).
    // Better Alternative: approximated from scraping or GraphQL. 
    // For REST "PoC", we might just use "total_private_repos" logic or skipping deep commit count if too heavy.
    // However, `search/commits` exists. Let's try to use it with accept header.

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const dateStr = oneYearAgo.toISOString().split('T')[0]

    // Note: search/commits requires specific preview header
    const commitSearchUrl = `${GITHUB_API_URL}/search/commits?q=author:${username}+committer-date:>${dateStr}`
    let commitsCount = 0
    try {
        const commitRes = await axios.get(commitSearchUrl, {
            headers: { ...headers, Accept: 'application/vnd.github.cloak-preview+json' }
        })
        commitsCount = commitRes.data.total_count
    } catch (err) {
        console.warn('Commit search failed (likely timeouts or preview issues), defaulting to 0', err.message)
        // Fallback? leave 0.
    }

    return {
        originalRepos: originalReposCount,
        stars: starsCount,
        mergedPRs: mergedPRs,
        commits: commitsCount
    }
}

/**
 * Compute S_Git (0-100)
 * Weights (hypothetical/PoC):
 * - 1 Merged PR = 10 points
 * - 1 Star = 2 points
 * - 1 Original Repo = 5 points
 * - 10 Commits = 1 point
 * Cap at 100.
 */
function calculateGitHubScore(metrics) {
    const { commits, mergedPRs, stars, originalRepos } = metrics

    const score = (mergedPRs * 10) + (stars * 2) + (originalRepos * 5) + (commits * 0.1)

    return Math.min(100, Number(score.toFixed(2)))
}

module.exports = {
    exchangeCodeForToken,
    getGitHubProfile,
    fetchGitHubStats,
    calculateGitHubScore
}
