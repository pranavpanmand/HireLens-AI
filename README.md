# HireLens AI — The Ultimate AI-Powered Career Platform 🚀

[![Built with React](https://img.shields.io/badge/Built_with-React_18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Powered by Gemini](https://img.shields.io/badge/Powered_by-Google_Gemini-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Firebase Auth](https://img.shields.io/badge/Auth-Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

An enterprise-grade, full-stack AI career platform that intelligently bridges the gap between job seekers and recruiters. HireLens AI leverages Google Gemini (LLM), multi-source job aggregation, semantic vector embeddings, Firebase Google Authentication, and a fully interactive Voice-Powered AI Interview Simulator to deliver a seamless, data-driven hiring experience.

**🌐 Live Demo:** [https://hire-lens-ai-omega.vercel.app](https://hire-lens-ai-omega.vercel.app)  
**📂 GitHub:** [https://github.com/pranavpanmand/HireLens-AI](https://github.com/pranavpanmand/HireLens-AI)

---

## 📸 Previews

*(Insert screenshot images of the Dashboard, Jobs Page, AI Interview Simulator, and Resume Analyzer here)*

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Developer](#-developer)

---

## 🌟 Key Features

### 🎙️ Full-Featured AI Interview Simulator (NEW)
- **Interactive Voice & Text:** Talk naturally to the AI using the Web Speech API or type your answers.
- **Customizable Setup:** Choose your desired job role, interview type (Technical, Behavioral, Mixed), and difficulty level.
- **Real-Time AI Avatar:** A responsive UI avatar that listens and speaks back to you during the session.
- **Comprehensive PDF Reports:** At the end of the interview, the AI generates a highly detailed PDF report grading your Clarity, Relevance, and Specificity, along with model answers.

### 🎯 For Job Seekers
- **Google Sign-In:** Secure, seamless authentication powered by Firebase OAuth.
- **AI Resume Analyzer:** Upload your resume (PDF/DOCX) and get an ATS compatibility score, skill-gap analysis, and actionable improvement suggestions powered by Gemini AI.
- **AI Job Match Scoring:** Click "Analyze Match" on any job to get a percentage match score comparing your resume against the job description with strengths, weaknesses, and missing skills.
- **AI Cover Letter Generator:** One-click generation of tailored, professional cover letters for any job — editable in-browser with copy/download support.
- **Smart Job Feed:** Browse 3,000+ aggregated jobs from Adzuna, Arbeitnow, and Remotive APIs with advanced filters (location, salary, job type, experience level, skills, posted date) and sorting.
- **Saved Jobs & Application Tracker:** Bookmark jobs, track application statuses, and manage your job search pipeline.
- **Automated High-Match Job Alerts:** Background cron job scans new postings every 6 hours and sends email notifications for 80%+ match jobs.

### 🏢 For Recruiters
- **Recruiter Dashboard:** Post job openings with rich descriptions, requirements, salary ranges, and manage active listings.
- **AI Applicant Ranking:** Incoming applicants are automatically scored and ranked by their AI Match Score.
- **Application Management:** Review, shortlist, or reject candidates with one-click status updates.

### 🤖 Enterprise AI Chatbot
- **Guided Job Search:** Button-driven flows to search jobs by title and location.
- **Inline Resume Upload:** Drag-and-drop resume directly inside the chat window.
- **Smart Career Q&A:** Ask any career question and receive intelligent, context-aware AI responses.

### 🎨 UI/UX Excellence
- **Premium Design:** Glassmorphism, animated gradients, micro-animations via Framer Motion.
- **Beautiful Light & Dark Modes:** Carefully crafted color palettes for maximum readability and visual appeal.
- **Fully Responsive:** Optimized for mobile, tablet, and desktop.
- **Loading Skeletons & Toast Notifications:** Smooth UI states during data fetches with Sonner notifications.

---

## 🏗 Architecture

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

## 🛠 Tech Stack

### Frontend
- **React 18** (UI framework) & **Vite** (Build tool)
- **Tailwind CSS** (Utility-first styling) & **shadcn/ui** (Accessible components)
- **Framer Motion** (Declarative animations)
- **React Query** (Server-state management)
- **Firebase Auth** (Google Sign-In)
- **Web Speech API** (Browser-native voice input for mock interviews)
- **jsPDF** (PDF Report Generation)

### Backend
- **Node.js** & **Express.js** (Runtime & HTTP framework)
- **MongoDB + Mongoose** (NoSQL database with ODM)
- **Firebase Admin SDK** (OAuth Verification)
- **Google Gemini API** (LLM Engine)
- **Cloudinary** (Cloud storage for files)
- **Node-Cron** (Background scheduled jobs)

---

## 🚀 Getting Started

Want to run HireLens AI on your own machine? 

We've created a highly detailed, step-by-step setup guide for you. 
👉 **[Click here to read the SETUP.md file](SETUP.md)** to get started with cloning the repo, installing dependencies, and configuring your API keys.

---

## 👨‍💻 Developer

Developed by **Pranav Panmand**.
- **Portfolio:** [https://pranav-panmand-portfolio.netlify.app/](https://pranav-panmand-portfolio.netlify.app/)
- **GitHub:** [@pranavpanmand](https://github.com/pranavpanmand)
