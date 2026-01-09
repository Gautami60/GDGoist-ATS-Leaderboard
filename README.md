#GDGoist ATS Leaderboard 🚀#

GDGoist ATS Leaderboard is a university-level, product-oriented web application that evaluates student resumes using an Applicant Tracking System (ATS), computes employability insights, and presents results through a centralized leaderboard.

The project is designed to demonstrate real-world system design, service-based architecture, and end-to-end integration of frontend, backend, cloud storage, and AI-assisted resume parsing.

✨ Key Highlights

End-to-end resume upload and ATS analysis

Scalable service-based architecture

Secure file handling using AWS S3 presigned URLs

Clean, minimal frontend suitable for academic deployment

Built with extensibility in mind (future scoring & analytics)

🏗️ Architecture Overview

Frontend: React + Vite

Backend: Node.js + Express

ATS Service: Python + FastAPI

Database: MongoDB

Storage: AWS S3 (direct uploads via presigned URLs)

Each service is independently runnable and loosely coupled, mirroring production-grade systems.

📌 Phase-wise Feature Status
✅ Phase 1 — Core Foundation (Completed)

User authentication (register & login)

Role-based access (student / admin)

Student onboarding (department & graduation year)

Privacy & consent handling

Resume upload via AWS S3

ATS service trigger & resume parsing

Student dashboard (basic)

Leaderboard APIs with filtering

⚠️ Phase 2 — Scoring & Insights (Partially Implemented)

ATS score computation

Resume parsing pipeline

ATS score persistence (in progress)

Employability score (partially wired)

Dashboard score visualization (in progress)

Pagination & filtering (API-level)

🚧 Phase 3 — Advanced Features (Coming Soon)

GitHub profile analysis & GitHub score

Badge system

Composite employability scoring

Admin analytics dashboard

Historical score tracking

Recommendation & insight engine

📁 Repository Structure
GDGoist-ATS-Leaderboard/
├── backend/        # Node.js + Express API
├── ats-service/    # Python FastAPI ATS engine
├── frontend/       # React + Vite frontend
└── README.md       # Project documentation

⚙️ Local Setup & Running the Project
Prerequisites

Node.js (v18+ recommended)

Python (v3.10+ recommended)

MongoDB (local or Atlas)

AWS account with:

S3 bucket

IAM user & access keys

1️⃣ Run ATS Service (Python)
cd ats-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install python-multipart
uvicorn main:app --reload --port 8000


ATS service runs at:

http://127.0.0.1:8000

2️⃣ Run Backend (Node.js)
cd backend
npm install
npm run dev


Backend runs at:

http://localhost:5000


Ensure .env includes:

MongoDB connection URI

AWS credentials

S3 bucket name

ATS service URL (http://localhost:8000)

3️⃣ Run Frontend (React)
cd frontend
npm install
npm run dev


Frontend runs at:

http://localhost:3000

🔄 Typical Local Workflow

Start ATS service

Start backend server

Start frontend

Register / login as a student

Complete onboarding & consent

Upload resume

ATS processes resume asynchronously

Scores appear on dashboard once processing completes

🧠 Notes & Design Decisions

Resume files are uploaded directly to S3, not through backend

ATS processing is asynchronous by design

Phase 2 & 3 scope is intentionally separated

Frontend is kept minimal, clean, and academic-friendly

📊 Project Status

✔ Infrastructure & integrations complete

✔ Resume upload & ATS parsing functional

⚠ Score propagation & visualization under refinement

🚧 Advanced intelligence features planned

📜 License

This project is intended for educational and academic use.
Feel free to fork, study, and adapt with attribution.