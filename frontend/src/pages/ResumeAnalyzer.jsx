import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { usePrimaryResume, useUploadResume } from "@/hooks/useResumes";
import { useResumeAnalyzer } from "@/hooks/useResumeAnalyzer";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { Button } from "@/components/ui/button";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, FileText, AlertTriangle, Lightbulb, Zap, CheckCircle2, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const { data: primaryResume, isLoading: resumeLoading } = usePrimaryResume();
  const uploadResume = useUploadResume();
  const analyzer = useResumeAnalyzer();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const handleUpload = async (file) => {
    await uploadResume.mutateAsync(file);
    // Auto trigger analysis after upload
    handleAnalyze();
  };

  const handleAnalyze = async () => {
    try {
      const result = await analyzer.mutateAsync();
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSection = (section) => {
    if (expandedSection === section) setExpandedSection(null);
    else setExpandedSection(section);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          
          <Reveal delay={0.1}>
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-3">
                <FileCheck className="w-8 h-8 text-primary" />
                AI Resume Analyzer
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get an instant ATS compatibility score and actionable feedback to improve your resume before you apply.
              </p>
            </div>
          </Reveal>

          <div className="space-y-8">
            {/* Top Section: Upload & Trigger */}
            <Reveal delay={0.2}>
              <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                    Your Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResumeUploader onUpload={handleUpload} currentResume={primaryResume?.file_name} />
                  
                  {primaryResume && !analyzer.isPending && (
                    <Button 
                      className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition"
                      onClick={handleAnalyze}
                      size="lg"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {analysisResult ? "Re-Analyze Resume" : "Analyze Resume"}
                    </Button>
                  )}
                  {analyzer.isPending && (
                    <div className="mt-6 flex flex-col items-center justify-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                      <p className="text-sm font-medium text-foreground">AI is reviewing your resume...</p>
                      <p className="text-xs text-muted-foreground mt-1 text-center">Checking ATS format, keyword density, and overall impact.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            </Reveal>

            {/* Results Section */}
            {!analysisResult && !analyzer.isPending && (
              <Reveal delay={0.3}>
                <div className="flex flex-col items-center justify-center text-center p-12 bg-muted/30 rounded-2xl border border-dashed border-border min-h-[300px]">
                  <FileCheck className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Ready for Analysis</h3>
                  <p className="text-muted-foreground max-w-md">
                    Upload your latest resume and click "Analyze" to see your ATS score, strengths, and areas for improvement.
                  </p>
                </div>
              </Reveal>
            )}

            {analyzer.isPending && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-muted animate-pulse rounded-xl border border-border"></div>
                <div className="h-64 bg-muted animate-pulse rounded-xl border border-border"></div>
                <div className="h-64 bg-muted animate-pulse rounded-xl border border-border"></div>
                <div className="h-64 bg-muted animate-pulse rounded-xl border border-border"></div>
              </div>
            )}

            {analysisResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Score Card */}
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 md:col-span-1 flex flex-col justify-center">
                    <CardContent className="p-8 text-center">
                      <h3 className="font-bold text-xl mb-6 text-foreground">Overall ATS Score</h3>
                      <div className="flex justify-center mb-6">
                        <CircularProgress value={analysisResult.atsScore} size={180} strokeWidth={16} showLabel={true} />
                      </div>
                      <p className="text-base font-medium text-foreground">
                        {analysisResult.atsScore >= 80 ? "Excellent! You're ready to apply." : 
                         analysisResult.atsScore >= 60 ? "Good, but needs some optimization." :
                         "Needs significant improvement."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Exec Summary */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/80 leading-relaxed text-lg">
                        {analysisResult.summary}
                      </p>
                      
                      <div className="mt-8">
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Recommended Roles</h4>
                        <div className="flex flex-wrap gap-3">
                          {analysisResult.recommendedRoles?.map(role => (
                            <Badge key={role} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm">{role}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Strengths */}
                  <Card className="border-green-500/20 bg-green-50/10 dark:bg-green-950/10">
                    <CardHeader className="bg-green-50/50 dark:bg-green-950/30 border-b border-green-500/10 pb-4">
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="w-5 h-5" />
                        Key Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {analysisResult.strengths?.map((str, i) => (
                          <div key={i} className="flex gap-3 text-sm text-foreground/90">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <p className="leading-relaxed">{str}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weaknesses */}
                  <Card className="border-orange-500/20 bg-orange-50/10 dark:bg-orange-950/10">
                    <CardHeader className="bg-orange-50/50 dark:bg-orange-950/30 border-b border-orange-500/10 pb-4">
                      <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                        <AlertTriangle className="w-5 h-5" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {analysisResult.weaknesses?.map((weak, i) => (
                          <div key={i} className="flex gap-3 text-sm text-foreground/90">
                            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                            <p className="leading-relaxed">{weak}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Suggestions */}
                  <Card className="border-blue-500/20 bg-blue-50/10 dark:bg-blue-950/10">
                    <CardHeader className="bg-blue-50/50 dark:bg-blue-950/30 border-b border-blue-500/10 pb-4">
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <Lightbulb className="w-5 h-5" />
                        Actionable Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {analysisResult.suggestions?.map((sug, i) => (
                          <div key={i} className="flex gap-3 text-sm text-foreground/90">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0 text-xs font-bold">{i+1}</div>
                            <p className="leading-relaxed">{sug}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* ATS Feedback */}
                  <Card className="border-purple-500/20 bg-purple-50/10 dark:bg-purple-950/10">
                    <CardHeader className="bg-purple-50/50 dark:bg-purple-950/30 border-b border-purple-500/10 pb-4">
                      <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                        <Zap className="w-5 h-5" />
                        ATS Compatibility Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {analysisResult.atsFeedback?.map((fb, i) => (
                          <div key={i} className="flex gap-3 text-sm text-foreground/90">
                            <Zap className="w-5 h-5 text-purple-400 flex-shrink-0" />
                            <p className="leading-relaxed">{fb}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </motion.div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
