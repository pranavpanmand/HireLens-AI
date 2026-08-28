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
          
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-3">
              <FileCheck className="w-8 h-8 text-primary" />
              AI Resume Analyzer
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get an instant ATS compatibility score and actionable feedback to improve your resume before you apply.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Upload & Trigger */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
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

              {analysisResult && (
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-lg mb-4 text-foreground">Overall ATS Score</h3>
                    <div className="flex justify-center mb-4">
                      <CircularProgress value={analysisResult.atsScore} size={140} strokeWidth={12} showLabel={true} />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {analysisResult.atsScore >= 80 ? "Excellent! You're ready to apply." : 
                       analysisResult.atsScore >= 60 ? "Good, but needs some optimization." :
                       "Needs significant improvement."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Analysis Results */}
            <div className="md:col-span-2">
              {!analysisResult && !analyzer.isPending && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-muted/30 rounded-2xl border border-dashed border-border">
                  <FileCheck className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">Ready for Analysis</h3>
                  <p className="text-muted-foreground max-w-md">
                    Upload your latest resume and click "Analyze" to see your ATS score, strengths, and areas for improvement.
                  </p>
                </div>
              )}

              {analysisResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/80 leading-relaxed">
                        {analysisResult.summary}
                      </p>
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Recommended Roles</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.recommendedRoles?.map(role => (
                            <Badge key={role} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{role}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expandable Sections */}
                  <div className="space-y-4">
                    
                    {/* Strengths */}
                    <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                      <button 
                        className="w-full px-6 py-4 flex items-center justify-between bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
                        onClick={() => toggleSection('strengths')}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-foreground">Key Strengths</span>
                          <Badge variant="outline" className="ml-2 bg-white dark:bg-black">{analysisResult.strengths?.length || 0}</Badge>
                        </div>
                        {expandedSection === 'strengths' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSection === 'strengths' && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-2 space-y-3">
                              {analysisResult.strengths?.map((str, i) => (
                                <div key={i} className="flex gap-3 text-sm text-foreground/80">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <p>{str}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                      <button 
                        className="w-full px-6 py-4 flex items-center justify-between bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                        onClick={() => toggleSection('weaknesses')}
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                          <span className="font-bold text-foreground">Areas for Improvement</span>
                          <Badge variant="outline" className="ml-2 bg-white dark:bg-black">{analysisResult.weaknesses?.length || 0}</Badge>
                        </div>
                        {expandedSection === 'weaknesses' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSection === 'weaknesses' && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-2 space-y-3">
                              {analysisResult.weaknesses?.map((weak, i) => (
                                <div key={i} className="flex gap-3 text-sm text-foreground/80">
                                  <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                  <p>{weak}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Suggestions */}
                    <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                      <button 
                        className="w-full px-6 py-4 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        onClick={() => toggleSection('suggestions')}
                      >
                        <div className="flex items-center gap-3">
                          <Lightbulb className="w-5 h-5 text-blue-500" />
                          <span className="font-bold text-foreground">Actionable Suggestions</span>
                          <Badge variant="outline" className="ml-2 bg-white dark:bg-black">{analysisResult.suggestions?.length || 0}</Badge>
                        </div>
                        {expandedSection === 'suggestions' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSection === 'suggestions' && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-2 space-y-3">
                              {analysisResult.suggestions?.map((sug, i) => (
                                <div key={i} className="flex gap-3 text-sm text-foreground/80">
                                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i+1}</div>
                                  <p>{sug}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* ATS Feedback */}
                    <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                      <button 
                        className="w-full px-6 py-4 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                        onClick={() => toggleSection('ats')}
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-purple-500" />
                          <span className="font-bold text-foreground">ATS Compatibility</span>
                          <Badge variant="outline" className="ml-2 bg-white dark:bg-black">{analysisResult.atsFeedback?.length || 0}</Badge>
                        </div>
                        {expandedSection === 'ats' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </button>
                      
                      <AnimatePresence>
                        {expandedSection === 'ats' && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-2 space-y-3">
                              {analysisResult.atsFeedback?.map((fb, i) => (
                                <div key={i} className="flex gap-3 text-sm text-foreground/80">
                                  <Zap className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <p>{fb}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
