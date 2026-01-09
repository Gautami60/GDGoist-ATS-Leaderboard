# GDGoist ATS Leaderboard

A privacy-first employability assessment platform designed for internal university use. It provides students with explainable ATS scoring, skill gap analysis, and gamified leaderboards to improve job readiness.

**Note:** This is purely an internal tool, not a public job portal/recruiter platform. It adheres strictly to DPDP privacy principles.

---

## Tech Stack

-   **Frontend**: React + Tailwind CSS (Currently minimal scaffolding)
-   **Backend**: Node.js + Express (BFF pattern)
-   **ATS Service**: Python + FastAPI (Parsing & Scoring)
-   **Database**: MongoDB (Local or Atlas)
-   **Storage**: AWS S3 (Optional for local testing)
-   **Auth**: JWT (Stateless)
-   **Testing**: TestSprite (API-level automation)

---

## Local Development Setup

### Prerequisites

-   **Node.js**: v18+
-   **npm**: v9+
-   **Python**: v3.10+
-   **pip**
-   **MongoDB**: Local instance or Atlas connection string
-   **Git**

### Clone & Install

```bash
# 1. Clone
git clone https://github.com/your-org/GDGoist-ATS-Leaderboard.git
cd GDGoist-ATS-Leaderboard

# 2. Install Backend Connection
cd backend
npm install
# (Keep this terminal open for configuration)

# 3. Install ATS Service Dependencies (New Terminal)
cd ../ats-service
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables.

### Core (Required)
```ini
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/app_db
JWT_SECRET=your_secure_random_string
```

### GitHub Integration (Phase 2 - Optional)
Required only if you want to test GitHub OAuth linkage and scoring.
```ini
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
# Callback configured in GitHub App: http://localhost:4000/auth/github/callback
```

### AWS S3 (Optional for Local Testing)
Required only for file upload endpoints. If omitted, uploads will fail but other features work.
```ini
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET=your_private_bucket
```

---

## Running the Project Locally

You need two separate terminals running simultaneously.

### 1. Start Backend
In `backend/`:
```bash
npm run dev
```
-   **Port**: 4000
-   **Health Check**: `http://localhost:4000/health`

### 2. Start ATS Service
In `ats-service/` (venv activated):
```bash
uvicorn main:app --reload --port 8000
```
-   **Port**: 8000
-   **Health Check**: `http://localhost:8000/health`

**Note**: The Frontend is currently minimal and not required for API/Backend testing.

---

## Running Tests

Automated API tests are configured using **TestSprite MCP**.
-   Ensure Backend is running on port 4000.
-   Run tests via VS Code TestSprite extension or execute manually via curl/Postman.
-   Tests cover: Registration, Onboarding, Upload, and Scoring flows.

---

## Current Status

-   **Phase 1 (Completed)**: Auth, Onboarding, Resume Parsing (Heuristic + TF-IDF), Leaderboards.
-   **Phase 2 (Implemented)**: GitHub OAuth Data Model, Badges Logic, Peer Discovery (Jaccard), Skill Gap Radar Charts.
-   **Frontend**: Minimal prototype.
-   **Deployment**: Not deployed (Localhost only).
