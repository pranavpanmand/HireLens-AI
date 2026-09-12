# HireLens AI — The Ultimate AI-Powered Career Platform 🚀

[![Built with React](https://img.shields.io/badge/Built_with-React_18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Powered by Gemini](https://img.shields.io/badge/Powered_by-Google_Gemini-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Firebase Auth](https://img.shields.io/badge/Auth-Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

Welcome to **HireLens AI**, an enterprise-grade, full-stack AI career platform designed to intelligently bridge the gap between job seekers and recruiters. 

By leveraging the power of Google Gemini (LLM), multi-source job aggregation APIs, semantic vector embeddings, and a fully interactive Voice-Powered AI Interview Simulator, HireLens AI delivers a seamless, data-driven hiring and job-preparation experience.

**🌐 Live Demo:** [https://hire-lens-ai-omega.vercel.app](https://hire-lens-ai-omega.vercel.app)  
**📂 GitHub:** [https://github.com/pranavpanmand/HireLens-AI](https://github.com/pranavpanmand/HireLens-AI)

---

## 📖 The Vision: Why HireLens AI?

The modern job search is broken. Candidates spend hours tailoring resumes and cover letters into a black box, while recruiters are overwhelmed with unqualified applicants. 

**HireLens AI solves this by acting as a personalized AI career coach and recruiter assistant.** 
- It tells candidates *exactly* why they match (or don't match) a job.
- It provides a safe, realistic environment to practice voice-based interviews.
- It automates the generation of hyper-personalized cover letters.
- It ranks candidates for recruiters instantly based on true semantic skill matching, rather than basic keyword stuffing.

---

## 📑 Table of Contents

- [Core Platform Features](#-core-platform-features)
- [System Architecture](#-system-architecture)
- [Comprehensive Tech Stack](#-comprehensive-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Variables](#-environment-variables)
- [Future Roadmap](#-future-roadmap)
- [Developer](#-developer)

---

## 🌟 Core Platform Features

### 🎙️ 1. Voice-Powered AI Interview Simulator
The crown jewel of HireLens AI. Prepare for your real interviews in a stress-free environment.
- **Interactive Voice & Text:** Talk naturally to the AI using the Web Speech API (speech-to-text) or type your answers manually.
- **Customizable Setup:** Choose your desired job role, interview type (Technical, HR/Behavioral, Mixed), and difficulty level.
- **Real-Time AI Avatar:** A highly responsive UI avatar that visually reacts, listens, and "speaks" back to you during the session.
- **Live Camera Feed:** A built-in webcam view ensures you can practice your eye contact and posture while speaking.
- **Comprehensive PDF Reports:** At the end of the interview, the AI generates a detailed PDF report grading your *Clarity*, *Relevance*, and *Specificity*, and provides the optimal "model answers".

### 🎯 2. Intelligent Job Seeker Tools
- **AI Resume Analyzer:** Upload your resume (PDF/DOCX). The LLM extracts the text, scores it against ATS standards, identifies skill gaps, and provides actionable bullet-point improvements.
- **AI Job Match Scoring:** Click "Analyze Match" on any job listing to get a precise percentage match score comparing your resume against the job description.
- **AI Cover Letter Generator:** One-click generation of tailored, professional cover letters for any job — completely editable in-browser with copy/download support.
- **Smart Job Feed:** Browse 3,000+ aggregated jobs from external APIs (Adzuna, Arbeitnow, Remotive) with advanced filtering (location, salary, job type, experience level, skills).
- **Automated High-Match Job Alerts:** A Node-Cron background job scans new postings every 6 hours and automatically emails you if a job matches your profile >80%.

### 🏢 3. Recruiter Dashboard & Applicant Tracking
- **Job Creation:** Post job openings with rich descriptions, requirements, and dynamic salary ranges.
- **AI Applicant Ranking:** Incoming applicants are automatically scored and ranked by their AI Match Score, saving recruiters hours of manual resume screening.
- **Application Management:** Review, shortlist, or reject candidates with one-click Kanban-style status updates.

### 🤖 4. Enterprise AI Chatbot Widget
- **Guided Job Search:** Use the floating chatbot to search jobs by title and location conversationally.
- **Inline Resume Upload:** Drag-and-drop your resume directly inside the chat window for instant feedback.
- **Smart Career Q&A:** Ask any career-related question and receive intelligent, context-aware AI responses.

### 🎨 5. UI/UX Excellence
- **Premium Design:** Features glassmorphism, animated gradients, and fluid micro-animations via Framer Motion.
- **Light & Dark Modes:** Carefully crafted Tailwind color palettes for maximum readability.
- **Global Toast Notifications:** Powered by `react-toastify` for beautiful, progress-bar animated success/error alerts.

---

## 🏗 System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│  React 18 + Vite + Tailwind CSS + Framer Motion         │
│  shadcn/ui + React Query + Firebase Auth                │
├─────────────────────────────────────────────────────────┤
│                         ↕ REST API                      │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Render)                      │
│  Node.js + Express.js + Firebase Admin + JWT Auth       │
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

## 🛠 Comprehensive Tech Stack

### Frontend Architecture
- **Framework:** React 18 & Vite
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Animations:** Framer Motion (page transitions, avatars, micro-interactions)
- **State & Data Fetching:** React Query (TanStack Query) v5 for intelligent caching and re-validation.
- **Notifications:** React Toastify
- **Icons:** Lucide React
- **Forms & Validation:** React Hook Form + Zod
- **Authentication:** Firebase Client SDK
- **Browser APIs:** Web Speech API (SpeechRecognition & SpeechSynthesis)
- **PDF Generation:** jsPDF

### Backend Architecture
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas & Mongoose ODM
- **AI Integration:** `@google/genai` (Google Gemini SDK)
- **Authentication:** Firebase Admin SDK (JWT token verification)
- **Storage:** Cloudinary SDK (for handling Multer memory streams)
- **Background Jobs:** Node-Cron
- **Security:** Helmet, CORS, Express Rate Limit
- **PDF Parsing:** pdf-parse (for extracting text from uploaded resumes)

---

## 📂 Project Structure

This is a monorepo containing both the frontend client and the backend API.

```
career-compass-ai-main/
├── frontend/                 # React frontend
│   ├── public/               # Static assets (logos, images)
│   ├── src/                  
│   │   ├── components/       # Reusable UI elements (auth, layout, ui, ai)
│   │   ├── contexts/         # React Contexts (AuthContext)
│   │   ├── hooks/            # Custom data-fetching hooks (React Query)
│   │   ├── lib/              # Utility functions and Firebase config
│   │   ├── pages/            # Top-level route components
│   │   ├── App.jsx           # Application entry point and router
│   │   └── index.css         # Global Tailwind styles
│   └── package.json
│
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── config/           # Database and third-party configuration
│   │   ├── controllers/      # Route logic and request handling
│   │   ├── middleware/       # Auth verification, rate limiting, error handling
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express API route definitions
│   │   ├── services/         # Business logic (AI calls, cron jobs)
│   │   └── index.js          # Express server entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started & Installation

Want to run HireLens AI on your own machine? We've created a highly detailed, step-by-step setup guide for you. 

👉 **[Click here to read the SETUP.md file](SETUP.md)** to get started with cloning the repo, installing dependencies, and running the development servers.

---

## 🔑 Environment Variables Overview

To run this project, you will need API keys from the following services. See `SETUP.md` for exact instructions on how to configure your `.env` files.
- **Google Gemini API** (Free Tier available)
- **MongoDB Atlas** (Free M0 Cluster available)
- **Firebase** (Free Tier available - both Client config and Admin Service Account JSON)
- **Cloudinary** (Free Tier available)

---

## 🗺 Future Roadmap

- [ ] **WebRTC Video Interviews:** Upgrade the mock interviews to record actual video via WebRTC and analyze facial expressions.
- [ ] **LinkedIn Integration:** Allow users to automatically populate their profile via LinkedIn OAuth.
- [ ] **Company Profiles:** Allow recruiters to build beautiful company landing pages within the platform.
- [ ] **Payment Gateway:** Integrate Stripe for premium feature unlocks (e.g., unlimited AI interviews).

---

## 👨‍💻 Developer

Developed by **Pranav Panmand**.
- **Portfolio:** [https://pranav-panmand-portfolio.netlify.app/](https://pranav-panmand-portfolio.netlify.app/)
- **GitHub:** [@pranavpanmand](https://github.com/pranavpanmand)
- **Email:** pranavpanmandpsp7@gmail.com

