
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useResumes, usePrimaryResume } from "@/hooks/useResumes";
import { SkillGapChart } from "@/components/analytics/SkillGapChart";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useMatchAnalyses } from "@/hooks/useMatchAnalysis";
import {
  Briefcase,
  FileText,
  TrendingUp,
  Bookmark,
  Clock,
  ChevronRight,
  Sparkles,
  Target,
  BookOpen,
  LogOut,
  FileSearch,
  PenTool,
  Mic,
  Linkedin,
  Mail,
  Star } from
"lucide-react";
import { Link } from "react-router-dom";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

import { StaggeredText } from "@/components/ui/StaggeredText";
import { Reveal } from "@/components/ui/Reveal";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: resumes, isLoading: resumesLoading } = useResumes();
  const { data: primaryResume } = usePrimaryResume();
  const { data: savedJobs, isLoading: savedJobsLoading } = useSavedJobs();
  const { data: analyses, isLoading: analysesLoading } = useMatchAnalyses();
  const uploadResume = useUploadResume();

  const avgMatchScore = analyses && analyses.length > 0 ?
  Math.round(analyses.reduce((acc, a) => acc + a.match_score, 0) / analyses.length) :
  0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <Reveal delay={0.1}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <StaggeredText 
                  text="Welcome Back! 👋" 
                  className="font-display text-3xl font-bold text-foreground mb-2" 
                />
                <p className="text-muted-foreground">
                  Here's your career matching overview
                </p>
              </div>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Reveal>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
            { icon: FileText, label: "Resumes", value: resumes?.length?.toString() || "0", trend: primaryResume ? "Primary set" : "Upload one" },
            { icon: Briefcase, label: "Jobs Analyzed", value: analyses?.length?.toString() || "0", trend: "Keep analyzing" },
            { icon: Target, label: "Avg Match", value: avgMatchScore ? `${avgMatchScore}%` : "—", trend: avgMatchScore >= 80 ? "Great!" : "Improve skills" },
            { icon: Bookmark, label: "Saved Jobs", value: savedJobs?.length?.toString() || "0", trend: "Browse more" }].
            map((stat, i) =>
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}>
              
                <SpotlightCard className="h-full">
                  <div className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                        <stat.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{stat.trend}</span>
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            )}
          </div>

          {/* AI Career Hub */}
          <Reveal delay={0.2}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-display text-foreground flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
                AI Career Hub
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "Resume Analyzer", desc: "Score & optimize your resume for ATS", icon: FileSearch, color: "text-blue-500", bg: "bg-blue-500/10", link: "/resume-analyzer" },
                  { title: "Cover Letter Generator", desc: "Instantly draft tailored cover letters", icon: PenTool, color: "text-emerald-500", bg: "bg-emerald-500/10", link: "/cover-letter" },
                  { title: "Mock Interview", desc: "Practice with an AI voice interviewer", icon: Mic, color: "text-purple-500", bg: "bg-purple-500/10", link: "/mock-interview" },
                  { title: "LinkedIn Optimizer", desc: "Generate a recruiter-ready profile", icon: Linkedin, color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10", link: "/linkedin-optimizer" },
                  { title: "Networking Outreach", desc: "Draft cold emails & connection requests", icon: Mail, color: "text-amber-500", bg: "bg-amber-500/10", link: "/networking" },
                  { title: "STAR Story Generator", desc: "Pre-write behavioral interview stories", icon: Star, color: "text-rose-500", bg: "bg-rose-500/10", link: "/star-stories" }
                ].map((tool, i) => (
                  <Link key={i} to={tool.link}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="group p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-card hover:border-primary/50 transition-all h-full flex flex-col"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tool.bg} group-hover:scale-110 transition-transform`}>
                          <tool.icon className={`w-6 h-6 ${tool.color}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{tool.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-auto">{tool.desc}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Analyses */}
              <Reveal delay={0.2}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Recent Match Analyses
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/jobs" className="flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {analysesLoading ?
                    <div className="flex items-center justify-center py-8">
                        <GlobalLoader message="Loading analyses..." />
                      </div> :
                    analyses && analyses.length > 0 ?
                    <div className="space-y-4">
                        {analyses.slice(0, 3).map((analysis) =>
                      <div
                        key={analysis.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        
                            <CircularProgress value={analysis.match_score} size={60} strokeWidth={6} showLabel={false} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {analysis.job_postings?.title || "Job"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {analysis.job_postings?.company || "Company"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-display font-bold text-foreground">{analysis.match_score}%</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(analysis.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                      )}
                      </div> :

                    <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No analyses yet</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link to="/jobs">Analyze Your First Job</Link>
                        </Button>
                      </div>
                    }
                  </CardContent>
                </Card>
              </Reveal>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Skills to Improve */}
              <Reveal delay={0.3}>
                <SkillGapChart />
              </Reveal>

              {/* Saved Jobs */}
              <Reveal delay={0.4}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-primary" />
                      Saved Jobs
                    </CardTitle>
                    <Badge variant="secondary">{savedJobs?.length || 0}</Badge>
                  </CardHeader>
                  <CardContent>
                    {savedJobsLoading ?
                    <div className="flex items-center justify-center py-4">
                        <GlobalLoader message="Loading saved jobs..." />
                      </div> :
                    savedJobs && savedJobs.length > 0 ?
                    <div className="space-y-3">
                        {savedJobs.slice(0, 3).map((saved) =>
                      <div
                        key={saved.id}
                        className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                        
                            <p className="font-medium text-foreground">{saved?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {saved?.company} • {saved?.location}
                            </p>
                          </div>
                      )}
                      </div> :

                    <p className="text-muted-foreground text-center py-4">
                        No saved jobs yet
                      </p>
                    }
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <Link to="/jobs">
                        Browse More Jobs
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>);

};

export default Dashboard;