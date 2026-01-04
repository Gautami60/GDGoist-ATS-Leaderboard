# Architecture

This document summarizes the project's architecture and Phase 1 rules.

## Components

- **Frontend:** React + Tailwind (UI only)
- **Backend:** Node.js + Express — Backend-for-Frontend (BFF) responsibilities, JWT-based authentication, and consent management
- **ATS Service:** Python + FastAPI — dedicated resume parsing and scoring service
- **Database:** MongoDB Atlas — primary datastore for users, resumes, and scores
- **Storage:** AWS S3 — private storage for resume files (access controlled)

## Phase 1 Rule

- ONLY Phase 1 features allowed. The implementation and deployment must be limited to the project's Phase 1 scope.
- The following features are explicitly NOT allowed in Phase 1:
  - NO GitHub integration
  - NO badges
  - NO peer networking
  - NO Redis or caching services

Keep the architecture minimal and focused: the UI should call the BFF (`Node.js + Express`), which handles auth (JWT), consent flows, and forwards resume files or requests to the ATS Service (`Python + FastAPI`) for parsing and scoring. Persist results and user data in MongoDB Atlas and store uploaded resumes privately in AWS S3.

If additional capabilities are proposed, validate they are within Phase 1 before implementation.
