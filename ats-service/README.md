# ATS Service (Phase 1)

This directory contains a minimal FastAPI scaffold for the ATS resume parsing and scoring service. Business logic is intentionally not implemented in Phase 1.

Run locally:

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
