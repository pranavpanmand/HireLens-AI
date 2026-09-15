import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ResumeGenerator from "./pages/ResumeGenerator";
import CoverLetterGenerator from "./pages/CoverLetterGenerator";
import LinkedInOptimizer from "./pages/LinkedInOptimizer";
import NetworkingGenerator from "./pages/NetworkingGenerator";
import StarStories from "./pages/StarStories";
import SavedJobs from "./pages/SavedJobs";
import MyApplications from "./pages/MyApplications";
import JobApplicants from "./pages/recruiter/JobApplicants";
import { ChatbotWidget } from "./components/ai/ChatbotWidget";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unsubscribe from "./pages/Unsubscribe";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Tutorials from "./pages/Tutorials";
import PositionAI from "./pages/PositionAI";
import Documents from "./pages/Documents";
import VideoResume from "./pages/VideoResume";
import AptitudeQuest from "./pages/AptitudeQuest";
import PersonalityTest from "./pages/PersonalityTest";
import Events from "./pages/Events";
import DeleteAccountConfirm from "./pages/DeleteAccountConfirm";
import AccountDeleted from "./pages/AccountDeleted";

// AI Interview Coach (merged from the PrepNexa interview project)
import InterviewHome from "./pages/interview/InterviewHome";
import InterviewSetup from "./pages/interview/InterviewSetup";
import InterviewSession from "./pages/interview/InterviewSession";
import InterviewReport from "./pages/interview/InterviewReport";
import InterviewHistory from "./pages/interview/InterviewHistory";
import MyProgress from "./pages/interview/MyProgress";

import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { AppLayout } from "@/components/layout/AppLayout";

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        
        {/* Public Routes with AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/jobs" element={<PageTransition><Jobs /></PageTransition>} />
          <Route path="/jobs/:id" element={<PageTransition><JobDetails /></PageTransition>} />
          <Route path="/account-deleted" element={<PageTransition><AccountDeleted /></PageTransition>} />
        </Route>
        
        {/* Student Routes with AppLayout */}
        <Route element={
          <ProtectedRoute requiredRole="student">
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/resume-analyzer" element={<PageTransition><ResumeAnalyzer /></PageTransition>} />
          <Route path="/cover-letter" element={<PageTransition><CoverLetterGenerator /></PageTransition>} />
          <Route path="/resume-generator" element={<PageTransition><ResumeGenerator /></PageTransition>} />

          {/* AI Interview Coach */}
          <Route path="/interview" element={<PageTransition><InterviewHome /></PageTransition>} />
          <Route path="/interview/start" element={<PageTransition><InterviewSetup /></PageTransition>} />
          <Route path="/interview/session/:sessionId" element={<PageTransition><InterviewSession /></PageTransition>} />
          <Route path="/interview/report/:sessionId" element={<PageTransition><InterviewReport /></PageTransition>} />
          <Route path="/interview/history" element={<PageTransition><InterviewHistory /></PageTransition>} />
          <Route path="/interview/progress" element={<PageTransition><MyProgress /></PageTransition>} />
          <Route path="/interview/reports" element={<PageTransition><InterviewHistory variant="reports" /></PageTransition>} />
          {/* Legacy mock-interview paths now live under /interview */}
          <Route path="/mock-interview" element={<Navigate to="/interview" replace />} />
          <Route path="/mock-interview/history" element={<Navigate to="/interview/history" replace />} />

          <Route path="/linkedin-optimizer" element={<PageTransition><LinkedInOptimizer /></PageTransition>} />
          <Route path="/networking" element={<PageTransition><NetworkingGenerator /></PageTransition>} />
          <Route path="/star-stories" element={<PageTransition><StarStories /></PageTransition>} />
          <Route path="/saved-jobs" element={<PageTransition><SavedJobs /></PageTransition>} />
          <Route path="/applications" element={<PageTransition><MyApplications /></PageTransition>} />
          <Route path="/position-ai" element={<PageTransition><PositionAI /></PageTransition>} />
          <Route path="/documents" element={<PageTransition><Documents /></PageTransition>} />
          <Route path="/video-resume" element={<PageTransition><VideoResume /></PageTransition>} />
          <Route path="/aptitude-quest" element={<PageTransition><AptitudeQuest /></PageTransition>} />
          <Route path="/personality-test" element={<PageTransition><PersonalityTest /></PageTransition>} />
          <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
          <Route path="/settings/delete-account" element={<PageTransition><DeleteAccountConfirm /></PageTransition>} />
        </Route>
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <PageTransition><RecruiterDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/jobs/:id/applicants"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <PageTransition><JobApplicants /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/unsubscribe/:token" element={<PageTransition><Unsubscribe /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/tutorials" element={<PageTransition><Tutorials /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <BrowserRouter>
          <AnimatedBackground />
          <AnimatedRoutes />
          <ChatbotWidget />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;