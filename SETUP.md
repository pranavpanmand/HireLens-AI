# 🛠️ HireLens AI — Complete Setup Guide

Welcome to the **HireLens AI** setup guide! Follow these instructions carefully to run the full-stack AI career platform on your local machine.

## 📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v16.x or higher)
- **Git**
- **MongoDB** (Local instance or MongoDB Atlas account)

---

## 🚀 1. Clone the Repository

```bash
git clone https://github.com/pranavpanmand/HireLens-AI.git
cd HireLens-AI
```

---

## 💻 2. Backend Setup

The backend handles the APIs, AI processing via Google Gemini, job aggregations, and database interactions.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` folder:
   ```bash
   touch .env
   ```
4. Add the following environment variables to your `backend/.env` file:

   ```env
   # --- Server Config ---
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # --- Database ---
   # Replace with your MongoDB connection string (Atlas or Local)
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hirelens?retryWrites=true&w=majority

   # --- Authentication ---
   # Generate a random 64-character hex string for JWT secret
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=30d

   # --- AI Services ---
   # Get this from Google AI Studio (https://aistudio.google.com/)
   GEMINI_API_KEY=your_gemini_api_key

   # --- Cloud Storage (For Resumes & Photos) ---
   # Get these from Cloudinary (https://cloudinary.com/)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # --- External APIs (Optional but recommended) ---
   # Get these from Adzuna (https://developer.adzuna.com/)
   ADZUNA_APP_ID=your_adzuna_app_id
   ADZUNA_APP_KEY=your_adzuna_app_key

   # --- Firebase Admin (For Google Auth Verification) ---
   # Get these from your Firebase Project Settings -> Service Accounts -> Generate new private key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```

---

## 🖥️ 3. Frontend Setup

The frontend is built with React 18, Vite, and Tailwind CSS.

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `frontend` folder:
   ```bash
   touch .env
   ```
4. Add the following environment variables to your `frontend/.env` file:

   ```env
   # --- API URL ---
   VITE_API_URL=http://localhost:5000/api

   # --- Firebase (For Google Sign-In) ---
   # Go to Firebase Console -> Project Settings -> General -> Web App
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 🔑 4. Getting Your API Keys

If you're not sure where to get the required keys, here are quick guides:

### Google Gemini API (Required for AI Features)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"** and copy the key into your `backend/.env`.

### Firebase & Google Auth (Required for Login)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Go to **Build -> Authentication** and enable **Google Sign-In**.
4. Go to **Project Settings -> General** and register a "Web App" (</> icon) to get your frontend `VITE_FIREBASE_*` keys.
5. Go to **Project Settings -> Service Accounts** and click **"Generate new private key"**. Open the downloaded JSON file and extract the `project_id`, `client_email`, and `private_key` for your `backend/.env`.

### Cloudinary (Required for Resumes & Avatars)
1. Go to [Cloudinary](https://cloudinary.com/) and create a free account.
2. Go to your Dashboard.
3. Copy your Cloud Name, API Key, and API Secret.

### MongoDB Atlas (Required Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. Go to Database Access and create a user (save the username/password).
3. Go to Network Access and whitelist your IP (or `0.0.0.0/0` for testing).
4. Click Connect -> "Connect your application" and copy the connection string.

---

## 🎉 5. You're All Set!
Once both the backend and frontend are running, open your browser and navigate to:
**http://localhost:5173**

Happy coding and good luck with your AI Job platform! 🚀
