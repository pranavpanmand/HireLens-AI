
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useResumes, usePrimaryResume, useUploadResume } from "@/hooks/useResumes";
import { SkillGapChart } from "@/components/analytics/SkillGapChart";
import { useSavedJobs } from "@/hooks/useJobs";
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
  Loader2,
  LogOut } from
"lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: resumes, isLoading: resumesLoading } = useResumes();
  const { data: primaryResume } = usePrimaryResume();
  const { data: savedJobs, isLoading: savedJobsLoading } = useSavedJobs();
  const { data: analyses, isLoading: analysesLoading } = useMatchAnalyses();
  const uploadResume = useUploadResume();

  const handleResumeUpload = async (file) => {
    await uploadResume.mutateAsync(file);
  };

  const avgMatchScore = analyses && analyses.length > 0 ?
  Math.round(analyses.reduce((acc, a) => acc + a.match_score, 0) / analyses.length) :
  0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome Back! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's your career matching overview
              </p>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

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
              
                <Card className="hover:shadow-card transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{stat.trend}</span>
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resume Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Your Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResumeUploader
                      onUpload={handleResumeUpload}
                      currentResume={primaryResume?.file_name} />
                    
                    {primaryResume &&
                    <div className="mt-4 p-4 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium text-foreground">{primaryResume.file_name}</p>
                        {primaryResume.skills_extracted && primaryResume.skills_extracted.length > 0 &&
                      <div className="flex flex-wrap gap-2 mt-2">
                            {primaryResume.skills_extracted.slice(0, 6).map((skill) =>
                        <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                        )}
                            {primaryResume.skills_extracted.length > 6 &&
                        <Badge variant="outline" className="text-xs">
                                +{primaryResume.skills_extracted.length - 6} more
                              </Badge>
                        }
                          </div>
                      }
                      </div>
                    }
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Analyses */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}>
                
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
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Skills to Improve */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}>
                
                <SkillGapChart />
              </motion.div>

              {/* Saved Jobs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}>
                
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
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div> :
                    savedJobs && savedJobs.length > 0 ?
                    <div className="space-y-3">
                        {savedJobs.slice(0, 3).map((saved) =>
                      <div
                        key={saved.id}
                        className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                        
                            <p className="font-medium text-foreground">{saved.job_postings?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {saved.job_postings?.company} • {saved.job_postings?.location}
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
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>);

};

export default Dashboard;