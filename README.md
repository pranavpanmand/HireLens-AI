# HireLens AI (formerly JobMatchAI) 🚀

HireLens is an advanced, AI-powered career consultant and job-matching platform designed to eliminate the friction between talented professionals and the companies that need them. By leveraging large language models (LLMs) and semantic matching, HireLens analyzes your career trajectory, skills, and potential to match you with the perfect role.

![HireLens Hero](https://hireft.com/images/hero-mockup.png) <!-- Update with actual screenshot link -->

## 🌟 Key Features

### For Candidates (Job Seekers)
- **🧠 AI Resume Analyzer:** Upload your resume and instantly get a Match Score against any job description, along with actionable feedback to improve your chances.
- **✉️ Cover Letter Generator:** Automatically generate highly tailored, professional cover letters based on your uploaded resume and the target job description.
- **🎙️ Mock Interview Simulator:** Practice for your big day with an AI interviewer that asks role-specific questions and provides real-time feedback on your answers.
- **🔗 LinkedIn Optimizer:** Paste your LinkedIn profile URL and receive AI-driven suggestions to make your profile stand out to recruiters.
- **🤝 Networking Message Generator:** Instantly draft customized cold emails and LinkedIn connection requests to network with hiring managers.
- **⭐ STAR Stories Builder:** Construct compelling behavioral interview answers using the Situation, Task, Action, Result framework with AI guidance.
- **📊 Application Tracker:** A built-in Kanban board to save jobs, track application statuses, and manage your job search pipeline.

### For Recruiters
- **🏢 Recruiter Dashboard:** Post new job openings directly to the platform.
- **🎯 AI Applicant Scoring:** Automatically rank incoming applicants based on their AI Match Score, saving hours of manual resume screening.

### System & Automation Features
- **🤖 Enterprise Career Bot:** A fully interactive, floating guided assistant that features:
  - **Guided Job Search:** Interactive button flows to find roles by title and location, rendering jobs as inline cards directly in the chat.
  - **Inline Resume Upload:** Drag-and-drop your resume directly inside the chat window.
  - **Smart Q&A:** Ask general career questions and get intelligent AI responses.
- **🔔 High-Match Job Alerts:** An automated background cron job that scans newly posted jobs and sends email notifications when a job matches your profile with an 80%+ score (featuring a prominent "Apply Now" badge).
- **🎨 Modern UI/UX:** Built with Tailwind CSS and Framer Motion, featuring glassmorphism, smooth micro-animations, animated gradients, and a responsive design that feels premium.
- **📄 Informational Pages:** Beautifully designed static pages including About Us, Contact, and Privacy Policy, maintaining consistent theme aesthetics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Animations:** Framer Motion
- **State Management & Routing:** React Router, React Query
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JSON Web Tokens (JWT)
- **AI Integration:** Google Gemini API (or equivalent LLM)
- **Background Jobs:** Node-Cron

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- AI API Key (e.g., Gemini API key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/career-compass-ai-main.git
   cd career-compass-ai-main
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file based on server/.env.example
   npm run dev
   ```

3. **Setup the Frontend**
   ```bash
   cd frontend
   npm install
   # Create a .env file if necessary (e.g., VITE_API_URL=http://localhost:5000)
   npm run dev
   ```

4. **Open the App**
   Navigate to `http://localhost:8080` (or `5173`) in your browser to see the app in action!

---

## 👨‍💻 Developed By

**Pranav Panmand**
- Portfolio: [https://pranav-panmand-portfolio.netlify.app/](https://pranav-panmand-portfolio.netlify.app/)
