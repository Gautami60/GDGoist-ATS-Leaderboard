# GDGoist ATS Leaderboard - Backend

## GitHub Integration (Phase 2.1)

This phase adds verifiable proof-of-work via GitHub OAuth integration.

### Environment Setup
Add the following to your `.env` file:
```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
APP_URL=http://localhost:4000  # For callback redirect
```
You must register an OAuth App in GitHub Developer Settings with callback URL: `http://localhost:4000/auth/github/callback`.

### OAuth Flow
1. **Connect/Login**: Navigate to `GET /auth/github`.
2. **Callback**: GitHub redirects to `/auth/github/callback?code=...`.
3. **Result**: Returns a JSON with JWT and user info. If the GitHub email matches an existing student email, the accounts are linked. If not, a new account is created (subject to domain restrictions).

### Manual Sync
To refresh GitHub stats without re-login:
- **Endpoint**: `POST /github/sync`
- **Auth**: Bearer Token required.
- **Action**: Fetches latest commits (last 12 months), merged PRs, stars, and original repo counts. Recalculates `gitComponent` of the score.

### Scoring Logic
- **ATS Score**: 50% weight.
- **GitHub Score (S_Git)**: 30% weight.
- **Badges**: 20% weight (currently 0).

**S_Git Formula (capped at 100):**
`S_Git = (MergedPRs * 10) + (Stars * 2) + (OriginalRepos * 5) + (Commits * 0.1)`

### API Endpoints
- `GET /auth/github`: Initiate OAuth.
- `GET /auth/github/callback`: Handle OAuth response.
- `POST /github/sync`: Trigger manual stats update.
