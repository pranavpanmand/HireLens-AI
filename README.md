<div align="center">

# 🎯 HireLens AI

### An AI-powered job portal that doesn't just list jobs — it acts as your personal career consultant.

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Framework-Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red?style=for-the-badge)]()

<br/>

**[🚀 Live Demo](#)** · **[📖 Documentation](#getting-started)** · **[🐛 Report Bug](#)** · **[✨ Request Feature](#)**

</div>

---

## 📌 Why This Project

Most college job-portal projects are static CRUD apps — a seeded database with a search bar. **HireLens AI is different**:

> 🔴 **Live data**, not dummy seeds — jobs pulled in real time from Adzuna, Arbeitnow, and Remotive
> 🧠 **Real AI reasoning**, not just a chatbot wrapper — semantic resume-to-JD matching, ATS scoring, interview grading
> 📐 **Vector embeddings + cosine similarity** for recommendations — actual applied ML, not prompt-response guessing
> 🔁 **A closed loop** — discover → check fit → improve resume → generate cover letter → practice interview → apply → get tracked

---

## ✨ Features

<table>
<tr>
<td valign="top" width="50%">

### 👨‍🎓 For Students

- 📄 **Resume Upload & Parsing** — Cloudinary + `pdf-parse`, multiple resumes, one primary
- 🔍 **Live Job Feed** — Aggregated from 3 real APIs, deduplicated & normalized
- 🎚️ **Advanced Filters** — Location, remote/hybrid/onsite, experience, salary, type, source
- 🎯 **AI Match Analysis** — Score, missing skills, strengths, learning path
- 🤖 **AI Recommendations** — Embedding-based, cosine-similarity ranked, "why this matches"
- 📊 **AI Resume/ATS Analyzer** — Standalone score + improvement suggestions
- ✉️ **AI Cover Letter Generator** — Tailored, editable, PDF export
- 🎤 **AI Mock Interview** — JD-specific Qs, graded answers, model responses
- 🔖 **Saved Jobs**
- 📋 **My Applications** — Status tracking

</td>
<td valign="top" width="50%">

### 🧑‍💼 For Recruiters

- 📢 **Job Posting** — Post, edit, manage listings
- 👥 **Applicant Tracking** — See who applied
- 🏆 **AI Candidate Ranking** — Same embedding engine, reversed — applicants ranked by JD fit with skill-gap breakdown

### 🌐 Platform-Wide

- 🔐 JWT auth + role-based access control
- ☁️ Cloudinary for resumes & profile photos
- 📱 Responsive, animated UI (Tailwind + shadcn/ui)
- 🍞 Toast notifications, skeleton loaders

</td>
</tr>
</table>

---

## 🧠 How the AI Matching Pipeline Works
