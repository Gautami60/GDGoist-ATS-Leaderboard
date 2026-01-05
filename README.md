# GDGoist ATS Leaderboard — Phase 1

This repository contains a Phase‑1 scaffold for an ATS leaderboard platform.

Structure
- `frontend/` — React + Vite + Tailwind (UI only)
- `backend/` — Node.js + Express BFF: auth, onboarding, consent, S3 presigned uploads, score persistence, leaderboard & admin APIs
- `ats-service/` — Python + FastAPI: resume parsing & scoring (PDF/DOCX)

Phase 1 constraints
- No GitHub integration, badges, peer networking, or Redis caching.
- Node.js does not parse resumes — parsing/scoring lives in `ats-service`.

Prerequisites
- Node 16+ and npm
- Python 3.8+ and `pip`
- MongoDB Atlas (URI)
- AWS S3 bucket (private) and IAM credentials with `s3:PutObject`

Environment variables
Create `.env` files in `backend/` (copy `.env.example`) and set these values:

- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — JWT signing secret
- `UNIVERSITY_DOMAIN` (optional) — e.g. `@uni.edu` to restrict registrations
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`

Quick start — Backend

1. Install deps and run (PowerShell):

```powershell
cd backend
npm install
# create .env from .env.example and populate values
npm run dev
```

2. Health: `GET http://localhost:4000/health`

Quick start — ATS Service

```powershell
cd ats-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health: `GET http://localhost:8000/health`

Quick start — Frontend (optional)

```powershell
cd frontend
npm install
npm run dev
```

Smoke test flow (minimal)

1) Register & login → get JWT token

```bash
curl -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@uni.edu","password":"Password123"}'
curl -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d '{"email":"alice@uni.edu","password":"Password123"}'
# Save token from login response as TOKEN
```

2) Onboard (required before protected APIs):

```bash
curl -X POST http://localhost:4000/onboarding -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"department":"Computer Science","graduationYear":2026}'
```

3) Give DPDP consent (required before upload):

```bash
curl -X POST http://localhost:4000/consent -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"consented": true}'
```

4) Request presigned upload URL (backend):

```bash
curl -X POST http://localhost:4000/resumes/upload-url -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"filename":"resume.pdf","contentType":"application/pdf","size":12345}'
# Response includes uploadUrl, fileKey, resumeId
```

5) Upload file directly to S3 using the returned `uploadUrl` (PUT). Example (PowerShell):

```powershell
Invoke-RestMethod -Uri "<uploadUrl>" -Method PUT -InFile "resume.pdf" -ContentType "application/pdf"
```

6) Notify backend upload complete:

```bash
curl -X POST http://localhost:4000/resumes/complete -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"resumeId":"<resumeId>","size":12345}'
```

7) Parse & score with ATS (local test):

```bash
curl -X POST "http://localhost:8000/parse" -F "file=@resume.pdf" -F "job_description=Sample job text"
# ATS returns atsScore, parsedSkills, parsingErrors, feedback
```

8) Simulate ATS callback (ingest result into backend):

```bash
curl -X POST http://localhost:4000/resumes/ats-result -H "Content-Type: application/json" -d '{"resumeId":"<resumeId>","atsScore":82.5,"parsedSkills":["python","sql"],"parsingErrors":[]} '
```

9) Check leaderboard (anonymous):

```bash
curl "http://localhost:4000/leaderboard?department=Computer%20Science&graduationYear=2026"
```

Admin endpoints

- `GET /admin/stats/departments` — department-wise distribution (no PII)
- `GET /admin/stats/years` — year-wise aggregates (no PII)
- `GET /admin/export/anonymized.csv` — anonymized CSV export (hashed anon_id, no PII)

Notes & troubleshooting

- Ensure the S3 bucket is private; presigned PUT URLs will write private objects by default if the bucket policy/ACL is private.
- Node backend intentionally does not parse resumes; ATS service performs parsing/scoring.
- If upload fails with S3 errors, confirm AWS credentials and `S3_BUCKET` name and IAM permissions (`s3:PutObject`).
- If MongoDB connection errors occur, verify `MONGODB_URI` and Atlas IP access list.

If you want, I can add:
- A `backend/README.md` with more detailed env examples
- A Postman collection or small smoke-test script
- A simple frontend leaderboard page that consumes `/leaderboard`
# GDGoist-ATS-Leaderboard