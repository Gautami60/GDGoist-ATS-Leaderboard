# Quick Start Guide - GDGoist ATS Leaderboard

This guide will help you get the complete system running in under 10 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed
- [ ] MongoDB Atlas account (or local MongoDB)
- [ ] Git installed

## Step 1: Clone and Install (5 minutes)

```bash
# Clone repository
git clone https://github.com/your-org/GDGoist-ATS-Leaderboard.git
cd GDGoist-ATS-Leaderboard

# Install backend
cd backend
npm install

# Install ATS service (new terminal)
cd ../ats-service
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Install frontend (new terminal)
cd ../frontend
npm install
```

## Step 2: Configure Environment (2 minutes)

Create `backend/.env`:
```ini
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gdgoist_ats
JWT_SECRET=your_random_secret_key_here
```

**Optional** - For resume uploads, add AWS credentials:
```ini
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

## Step 3: Start Services (3 terminals)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
✅ Should see: "Backend listening on 4000" and "MongoDB connected"

### Terminal 2 - ATS Service
```bash
cd ats-service
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```
✅ Should see: "Uvicorn running on http://127.0.0.1:8000"

### Terminal 3 - Frontend
```bash
cd frontend
npm run dev
```
✅ Should see: "Local: http://localhost:3000"

## Step 4: Test the System

1. **Open browser**: Navigate to `http://localhost:3000`

2. **Register**: Create a new account
   - Name: Test Student
   - Email: test@university.edu
   - Password: Test123

3. **Onboarding**: Complete profile
   - Department: Computer Science
   - Graduation Year: 2026

4. **Consent**: Accept DPDP consent

5. **Dashboard**: You should see:
   - Score cards (all zeros initially)
   - Resume upload section

6. **Upload Resume** (if AWS configured):
   - Select a PDF/DOCX file
   - Click "Upload Resume"
   - Wait for success message

7. **View Leaderboard**: Click "View Leaderboard"
   - Should see your entry (if you uploaded a resume)

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Ensure port 4000 is not in use

### ATS Service errors
- Verify Python virtual environment is activated
- Check all dependencies installed: `pip list`

### Frontend blank page
- Check browser console for errors
- Verify backend is running on port 4000
- Clear browser cache

### Resume upload fails
- AWS credentials must be valid
- S3 bucket must exist and have proper permissions
- You can skip this step if testing other features

## What's Next?

- Create an admin account (manually set role in MongoDB)
- Test admin leaderboard view
- Upload multiple resumes to populate leaderboard
- Explore API endpoints with Postman

## Support

For issues:
1. Check all three services are running
2. Review terminal logs for errors
3. Verify environment variables are set correctly
4. Check MongoDB connection
