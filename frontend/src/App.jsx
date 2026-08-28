import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import SavedJobs from "./pages/SavedJobs";
import MyApplications from "./pages/MyApplications";
import JobApplicants from "./pages/recruiter/JobApplicants";
import { ChatbotWidget } from "./components/ai/ChatbotWidget";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () =>
<QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route
            path="/dashboard"
            element={
            <ProtectedRoute requiredRole="student">
                  <Dashboard />
                </ProtectedRoute>
            } />
            <Route
            path="/profile"
            element={
            <ProtectedRoute requiredRole="student">
                  <Profile />
                </ProtectedRoute>
            } />
            <Route
            path="/resume-analyzer"
            element={
            <ProtectedRoute requiredRole="student">
                  <ResumeAnalyzer />
                </ProtectedRoute>
            } />
          
            <Route
            path="/saved-jobs"
            element={
            <ProtectedRoute requiredRole="student">
                  <SavedJobs />
                </ProtectedRoute>
            } />
            <Route
            path="/applications"
            element={
            <ProtectedRoute requiredRole="student">
                  <MyApplications />
                </ProtectedRoute>
            } />

            <Route
            path="/recruiter"
            element={
            <ProtectedRoute requiredRole="recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
            } />
            <Route
            path="/recruiter/jobs/:id/applicants"
            element={
            <ProtectedRoute requiredRole="recruiter">
                  <JobApplicants />
                </ProtectedRoute>
            } />
          
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatbotWidget />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>;


export default App;