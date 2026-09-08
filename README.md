# HireLens AI — AI-Powered Job Search & Career Intelligence Platform 🚀

An enterprise-grade, full-stack AI career platform that intelligently bridges the gap between job seekers and recruiters. HireLens AI leverages Google Gemini (LLM), multi-source job aggregation, semantic vector embeddings, and automated cron-based alerting to deliver a seamless, data-driven hiring experience.

**🌐 Live Demo:** [https://hire-lens-ai-omega.vercel.app](https://hire-lens-ai-omega.vercel.app)  
**📂 GitHub:** [https://github.com/pranavpanmand/HireLens-AI](https://github.com/pranavpanmand/HireLens-AI)

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Developer](#-developer)

---

## 🌟 Key Features

### 🎯 For Job Seekers

| Feature | Description |
|---------|-------------|
| **AI Resume Analyzer** | Upload your resume (PDF/DOCX) and get an ATS compatibility score, skill-gap analysis, and actionable improvement suggestions powered by Gemini AI |
| **AI Job Match Scoring** | Click "Analyze Match" on any job to get a percentage match score comparing your resume against the job description with strengths, weaknesses, and missing skills |
| **AI Cover Letter Generator** | One-click generation of tailored, professional cover letters for any job — editable in-browser with copy/download support |
| **AI Mock Interview Simulator** | Realistic AI recruiter experience with role-specific questions (technical + behavioral), voice input via Web Speech API, real-time answer evaluation with Clarity/Relevance/Specificity scoring, and model answers |
| **LinkedIn Profile Optimizer** | Paste your LinkedIn URL and receive AI-driven suggestions for headline, summary, experience bullets, and keyword optimization |
| **Networking Message Generator** | Generate cold outreach emails and LinkedIn connection requests tailored to specific companies and roles |
| **STAR Stories Builder** | Construct structured behavioral interview answers using the STAR (Situation, Task, Action, Result) framework with AI guidance |
| **Smart Job Feed** | Browse 3,000+ aggregated jobs from Adzuna, Arbeitnow, and Remotive APIs with advanced filters (location, salary, job type, experience level, skills, posted date) and sorting |
| **Saved Jobs & Application Tracker** | Bookmark jobs, track application statuses, and manage your job search pipeline |
| **AI-Powered Job Recommendations** | Vector embedding-based semantic job recommendations using cosine similarity matching against your resume |
| **Automated High-Match Job Alerts** | Background cron job scans new postings every 6 hours and sends email notifications for 80%+ match jobs |

### 🏢 For Recruiters

| Feature | Description |
|---------|-------------|
| **Recruiter Dashboard** | Post job openings with rich descriptions, requirements, salary ranges, and manage active listings |
| **AI Applicant Ranking** | Incoming applicants are automatically scored and ranked by their AI Match Score |
| **Application Management** | Review, shortlist, or reject candidates with one-click status updates |

### 🤖 Enterprise AI Chatbot

A fully interactive floating assistant featuring:
- **Guided Job Search:** Button-driven flows to search jobs by title and location, with results rendered as interactive cards inline
- **Inline Resume Upload:** Drag-and-drop resume directly inside the chat window
- **Smart Career Q&A:** Ask any career question and receive intelligent, context-aware AI responses
- **Multi-modal Support:** Accepts text, file uploads, and conversation history

### 🎨 UI/UX Excellence

- **Premium Design:** Glassmorphism, animated gradients, micro-animations via Framer Motion
- **Fully Responsive:** Optimized for mobile (375px), tablet (768px), and desktop (1280px+)
- **Hamburger Menu:** Full-screen slide-in navigation on mobile
- **Dark Theme:** Modern dark-blue aesthetic throughout
- **Loading Skeletons:** Smooth skeleton placeholders during data fetches
- **Toast Notifications:** Real-time feedback via Sonner

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│  React 18 + Vite + Tailwind CSS + Framer Motion         │
│  shadcn/ui + React Query + React Router                 │
├─────────────────────────────────────────────────────────┤
│                         ↕ REST API                      │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Render)                      │
│  Node.js + Express.js + JWT Auth                        │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────────┐ │
│  │ Job Aggregator│ │ Gemini AI   │ │ Vector Embeddings│ │
│  │ (Multi-Source)│ │ (LLM Engine)│ │ (Recommendations)│ │
│  └──────┬───────┘ └──────┬──────┘ └────────┬─────────┘ │
│         │                │                  │           │
│  ┌──────┴────────────────┴──────────────────┴────────┐  │
│  │              MongoDB Atlas (Database)              │  │
│  │  Users | Jobs | Resumes | Applications | Alerts   │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Cloudinary (Resume & Photo Storage)             │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Node-Cron (Automated Job Alert Scheduler)       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks and functional components |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Accessible, customizable component library |
| **Framer Motion** | Declarative animations and page transitions |
| **React Query** | Server-state management with caching and background refetching |
| **React Router v6** | Client-side routing with protected routes |
| **Lucide React** | Consistent, modern icon set |
| **Sonner** | Toast notification system |
| **DOMPurify** | XSS protection for rendered HTML |
| **Web Speech API** | Browser-native voice input for mock interviews |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | HTTP server framework with middleware pipeline |
| **MongoDB + Mongoose** | NoSQL database with ODM |
| **JWT** | Stateless authentication with httpOnly cookies |
| **Google Gemini API** | LLM for resume analysis, cover letters, mock interviews, chatbot |
| **Cloudinary** | Cloud storage for resumes and profile photos |
| **Node-Cron** | Scheduled background jobs (job alerts) |
| **Bcrypt** | Password hashing |
| **Helmet** | HTTP security headers |
| **Express-Rate-Limit** | API rate limiting and DDoS protection |
| **Multer** | File upload handling |
| **Nodemailer** | Transactional email delivery |

### External APIs
| API | Purpose |
|-----|---------|
| **Adzuna API** | Real-time job aggregation (India market) |
| **Arbeitnow API** | European/remote job listings |
| **Remotive API** | Remote-first job listings |
| **Google Gemini** | AI inference for all intelligent features |

---

## 📁 Project Structure

```
career-compass-ai-main/
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/         #   Navbar, Footer
│   │   │   ├── jobs/           #   JobCard, JobFilters
│   │   │   ├── ai/             #   ChatbotWidget
│   │   │   ├── analysis/       #   MatchAnalysis, MockInterviewModal
│   │   │   ├── profile/        #   ProfileEditModals
│   │   │   └── ui/             #   shadcn/ui primitives
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── JobDetails.jsx
│   │   │   ├── ResumeAnalyzer.jsx
│   │   │   ├── CoverLetterGenerator.jsx
│   │   │   ├── MockInterviewPage.jsx
│   │   │   ├── LinkedInOptimizer.jsx
│   │   │   ├── NetworkingGenerator.jsx
│   │   │   ├── StarStories.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── SavedJobs.jsx
│   │   │   ├── MyApplications.jsx
│   │   │   └── recruiter/
│   │   │       ├── RecruiterDashboard.jsx
│   │   │       └── JobApplicants.jsx
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API client modules
│   │   ├── contexts/           # React Context (AuthContext)
│   │   └── App.jsx             # Root component + routing
│   ├── vercel.json             # Vercel deployment config
│   └── vite.config.js          # Vite build config
│
├── backend/                    # Node.js + Express API
│   └── src/
│       ├── controllers/        # Request handlers
│       │   ├── auth.controller.js
│       │   ├── jobs.controller.js
│       │   ├── ai.controller.js
│       │   ├── resumes.controller.js
│       │   ├── matches.controller.js
│       │   ├── applications.controller.js
│       │   └── alerts.controller.js
│       ├── models/             # Mongoose schemas
│       │   ├── User.js
│       │   ├── JobPosting.js
│       │   ├── Resume.js
│       │   ├── Application.js
│       │   └── JobAlert.js
│       ├── services/           # Business logic
│       │   ├── jobsAggregator.service.js
│       │   ├── adzuna.service.js
│       │   ├── arbeitnow.service.js
│       │   ├── remotive.service.js
│       │   ├── embedding.service.js
│       │   └── cron.service.js
│       ├── middleware/         # Express middleware
│       │   ├── auth.js
│       │   ├── rateLimiter.js
│       │   └── errorHandler.js
│       ├── routes/             # API route definitions
│       ├── config/             # Environment config
│       └── server.js           # Entry point
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB Atlas** account (free tier works)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))
- **Adzuna API credentials** ([Register here](https://developer.adzuna.com/))
- **Cloudinary account** ([Sign up free](https://cloudinary.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pranavpanmand/HireLens-AI.git
   cd HireLens-AI
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Create `backend/.env`** (see [Environment Variables](#-environment-variables) below)

4. **Start Backend Server**
   ```bash
   npm run dev
   # Server starts on http://localhost:5000
   ```

5. **Setup Frontend** (new terminal)
   ```bash
   cd frontend
   npm install
   ```

6. **Create `frontend/.env`**
   ```env
   VITE_API_URL=/api
   ```

7. **Start Frontend Dev Server**
   ```bash
   npm run dev
   # App opens on http://localhost:8080
   ```

8. **Open the App**
   Navigate to `http://localhost:8080` — you're ready to go!

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# AI
GEMINI_API_KEY=your_gemini_api_key_here

# Job Aggregation
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:8080
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=/api
```

> **Note:** For production deployment on Vercel, `VITE_API_URL` is configured via `vercel.json` to point to the deployed Render backend.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Login and receive JWT token |
| POST | `/api/auth/logout` | Clear authentication cookie |
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password/:token` | Reset password with token |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Search/filter jobs with pagination |
| GET | `/api/jobs/:id` | Get job details by ID |
| GET | `/api/jobs/external` | Trigger external job fetch |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chatbot conversation |
| POST | `/api/ai/cover-letter/:jobId` | Generate tailored cover letter |
| POST | `/api/ai/mock-interview/start` | Start mock interview session |
| POST | `/api/ai/mock-interview/submit` | Submit answer for evaluation |
| POST | `/api/ai/linkedin-optimize` | Optimize LinkedIn profile |
| POST | `/api/ai/networking-message` | Generate networking message |
| POST | `/api/ai/star-stories` | Build STAR interview stories |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes/upload` | Upload resume (PDF/DOCX) |
| GET | `/api/resumes` | Get user's resumes |
| POST | `/api/resumes/:id/analyze` | AI-analyze resume |

### Match Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/matches/job/:jobId` | Analyze resume-job match |
| GET | `/api/matches` | Get user's match history |

### Saved Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/saved-jobs` | Get saved jobs |
| POST | `/api/saved-jobs` | Save a job |
| DELETE | `/api/saved-jobs/:id` | Remove saved job |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications/job/:jobId` | Apply to a job |
| GET | `/api/applications/my` | Get user's applications |
| GET | `/api/applications/job/:jobId` | Get applicants (recruiter) |
| PUT | `/api/applications/:id/status` | Update applicant status |

### Recruiter
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recruiter/jobs` | Get recruiter's posted jobs |
| POST | `/api/recruiter/jobs` | Create a new job posting |
| PUT | `/api/recruiter/jobs/:id` | Update a job posting |
| DELETE | `/api/recruiter/jobs/:id` | Delete a job posting |

---

## 🚢 Deployment

### Frontend → Vercel

1. Connect your GitHub repository to Vercel
2. Set **Root Directory** to `frontend`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `dist`
5. The `vercel.json` handles SPA routing and `VITE_API_URL` automatically

### Backend → Render

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Set **Build Command** to `npm install`
5. Set **Start Command** to `node src/server.js`
6. Add all environment variables from the [Environment Variables](#-environment-variables) section
7. Set `CLIENT_URL` to your Vercel frontend URL

---

## 👨‍💻 Developer

**Pranav Panmand**

- 🌐 Portfolio: [https://pranav-panmand-portfolio.netlify.app/](https://pranav-panmand-portfolio.netlify.app/)
- 💻 GitHub: [https://github.com/pranavpanmand](https://github.com/pranavpanmand)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
