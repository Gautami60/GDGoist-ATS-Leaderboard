# GDGoist ATS Leaderboard - Frontend

A React-based frontend for the GDGoist ATS Leaderboard platform that helps students improve their employability through AI-powered resume analysis and gamified competition.

## Features

### 🔐 Authentication & User Management
- **User Registration**: Sign up with email and password
- **Login System**: Secure authentication with JWT tokens
- **Profile Management**: Complete onboarding with department and graduation year
- **Data Consent**: GDPR-compliant consent management for data processing

### 📊 Dashboard
- **Personal Score Display**: View your total employability score breakdown
- **Score Components**: 
  - ATS Score (50%): Resume analysis results
  - GitHub Score (30%): Coming in future phases
  - Badge Score (20%): Coming in future phases
- **Profile Information**: View and manage your academic details

### 📄 Resume Upload & Analysis
- **Drag & Drop Upload**: Easy file upload interface
- **File Validation**: Supports PDF and DOCX files up to 10MB
- **Real-time Processing**: 
  1. Secure upload to S3
  2. ATS analysis with skill extraction
  3. Score calculation and leaderboard update
- **Progress Tracking**: Visual feedback during upload and processing

### 🏆 Leaderboard
- **Anonymous Rankings**: View competitive rankings without personal data exposure
- **Advanced Filtering**: Filter by department and graduation year
- **Pagination**: Efficient browsing of large datasets
- **Score Visualization**: Color-coded scores and ranking badges
- **Real-time Updates**: Automatic refresh of rankings

### 🎨 User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface using Tailwind CSS
- **Accessibility**: Screen reader friendly and keyboard navigable
- **Loading States**: Smooth loading animations and progress indicators
- **Error Handling**: User-friendly error messages and validation

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing for single-page application
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Context API**: State management for authentication and user data
- **Fetch API**: HTTP client for backend communication
- **Vite**: Fast development server and build tool

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API running on http://localhost:4000
- ATS service running on http://localhost:8000

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```
The application will be available at http://localhost:5173

### Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/           # React components
│   ├── Login.jsx        # Login form
│   ├── Register.jsx     # Registration form
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Leaderboard.jsx  # Leaderboard display
│   ├── Onboarding.jsx   # Profile completion
│   ├── Navbar.jsx       # Navigation bar
│   ├── ResumeUpload.jsx # File upload component
│   ├── ConsentModal.jsx # GDPR consent modal
│   └── LandingPage.jsx  # Marketing landing page
├── context/             # React Context providers
│   └── AuthContext.jsx  # Authentication state management
├── App.jsx              # Main application component
├── index.jsx            # Application entry point
└── index.css            # Global styles and Tailwind imports
```

## API Integration

The frontend integrates with two backend services:

### Backend API (Port 4000)
- User authentication and management
- Resume metadata and upload URLs
- Score calculation and storage
- Leaderboard data retrieval

### ATS Service (Port 8000)
- Resume parsing and analysis
- Skill extraction
- ATS score calculation

## Features by User Journey

### New User Flow
1. **Landing Page**: Marketing page with feature overview
2. **Registration**: Account creation with validation
3. **Onboarding**: Academic profile completion
4. **Consent**: Data processing agreement
5. **Dashboard**: Access to upload and score features

### Returning User Flow
1. **Login**: Secure authentication
2. **Dashboard**: View current score and upload new resume
3. **Leaderboard**: Compare with peers and track progress

### Resume Upload Process
1. **File Selection**: Drag & drop or browse for PDF/DOCX
2. **Validation**: File type and size checks
3. **Upload**: Secure S3 upload with progress tracking
4. **Analysis**: ATS processing with real-time status
5. **Results**: Updated score and leaderboard position

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Client-side and server-side validation
- **CORS Protection**: Proper cross-origin request handling
- **Data Consent**: GDPR-compliant consent management
- **Secure File Upload**: Direct S3 upload with presigned URLs

## Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Efficient Rendering**: Optimized React components
- **Caching**: Browser caching of static assets
- **Pagination**: Efficient data loading for large datasets
- **Debounced Inputs**: Reduced API calls for search/filter

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow React best practices and hooks patterns
2. Use Tailwind CSS for styling
3. Maintain responsive design principles
4. Add proper error handling and loading states
5. Write accessible HTML with proper ARIA labels
6. Test across different screen sizes and browsers

## Environment Variables

The frontend uses these API endpoints (configured in AuthContext.jsx):
- Backend API: `http://localhost:4000`
- ATS Service: `http://localhost:8000`

For production deployment, update these URLs to match your production environment.