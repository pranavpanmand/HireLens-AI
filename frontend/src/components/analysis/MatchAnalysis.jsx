import { motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, BookOpen, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResumeDiffViewer } from "./ResumeDiffViewer";
import { useState } from "react";










export const MatchAnalysis = ({ job, analysisResult, isLoading, onClose }) => {
  const [activeTab, setActiveTab] = useState("score"); // 'score' or 'diff'
  
  const analysis = analysisResult ? {
    score: analysisResult.match_score || analysisResult.matchScore,
    scoreBreakdown: analysisResult.scoreBreakdown || analysisResult.score_breakdown || { skills: 0, experience: 0, education: 0 },
    matchedSkills: analysisResult.matched_skills || analysisResult.matchedSkills || [],
    missingSkills: analysisResult.missing_skills || analysisResult.missingSkills || [],
    learningPath: analysisResult.learning_path || analysisResult.learningPath || [],
    summary: analysisResult.summary || ""
  } : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
      onClick={onClose}>
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-elevated max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-hero p-6 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium text-primary-foreground/80">AI Match Analysis</span>
              </div>
              <h2 className="font-display text-2xl font-bold">{job.title}</h2>
              <p className="text-primary-foreground/80">{job.company}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors">
              
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ?
          <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analyzing your resume against this job...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
            </div> :
          analysis ?
          <>
              {/* Tab Navigation */}
              <div className="flex items-center gap-4 border-b border-border mb-6 pb-2">
                <button 
                  onClick={() => setActiveTab("score")}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "score" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Match Score
                </button>
                <button 
                  onClick={() => setActiveTab("diff")}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "diff" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Resume Diff Highlighter
                </button>
              </div>

              {activeTab === "score" ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score Section */}
                    <div className="lg:col-span-1 flex flex-col items-center justify-start p-6 bg-muted/50 rounded-xl space-y-6">
                      <div className="flex flex-col items-center">
                        <CircularProgress value={analysis.score} size={160} strokeWidth={12} />
                        <p className="mt-4 text-sm text-muted-foreground text-center">
                          Your resume matches <strong className="text-foreground">{analysis.score}%</strong> of the job requirements
                        </p>
                      </div>

                      {/* Score Breakdown Bars */}
                      {(analysis.scoreBreakdown.skills > 0 || analysis.scoreBreakdown.experience > 0) && (
                        <div className="w-full space-y-4 pt-4 border-t border-border">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Score Breakdown</h4>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-foreground font-medium">Skills</span>
                              <span className="text-muted-foreground">{analysis.scoreBreakdown.skills}%</span>
                            </div>
                            <div className="w-full bg-muted-foreground/20 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${analysis.scoreBreakdown.skills}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-foreground font-medium">Experience</span>
                              <span className="text-muted-foreground">{analysis.scoreBreakdown.experience}%</span>
                            </div>
                            <div className="w-full bg-muted-foreground/20 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${analysis.scoreBreakdown.experience}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-foreground font-medium">Education</span>
                              <span className="text-muted-foreground">{analysis.scoreBreakdown.education}%</span>
                            </div>
                            <div className="w-full bg-muted-foreground/20 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${analysis.scoreBreakdown.education}%` }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skills Breakdown */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Summary */}
                      {analysis.summary && (
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                          <p className="text-sm text-foreground">{analysis.summary}</p>
                        </div>
                      )}

                      {/* Matched Skills */}
                      <div>
                        <h3 className="flex items-center gap-2 font-display font-semibold text-foreground mb-3">
                          <CheckCircle2 className="w-5 h-5 text-score-excellent" />
                          Skills You Have
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.matchedSkills.length > 0 ? (
                            analysis.matchedSkills.map((skill) => (
                              <Badge key={skill} className="bg-score-excellent/10 text-score-excellent border-score-excellent/20">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No matching skills found</p>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div>
                        <h3 className="flex items-center gap-2 font-display font-semibold text-foreground mb-3">
                          <AlertCircle className="w-5 h-5 text-score-fair" />
                          Skills to Develop
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingSkills.length > 0 ? (
                            analysis.missingSkills.map((skill) => (
                              <Badge key={skill} variant="outline" className="border-score-fair/50 text-score-fair">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">You have all required skills!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Learning Path */}
                  {analysis.learningPath.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 font-display font-semibold text-foreground mb-4">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Recommended Learning Path
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {analysis.learningPath.map((item, i) => (
                          <motion.div
                            key={item.skill}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="p-4 rounded-xl border border-border bg-card hover:shadow-soft transition-shadow"
                          >
                            <Badge className="bg-gradient-primary mb-3">{item.skill}</Badge>
                            {item.resources && item.resources.length > 0 && (
                              <div className="space-y-2">
                                {item.resources.slice(0, 2).map((resource, j) => (
                                  <a
                                    key={j}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{resource.title}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ResumeDiffViewer 
                  resumeText={analysisResult?.resumeText}
                  matchedSkills={analysis.matchedSkills}
                  missingSkills={analysis.missingSkills}
                />
              )}
            </> :

          <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Unable to analyze match</p>
            </div>
          }
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex items-center justify-between bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Analysis powered by AI
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-gradient-primary" asChild>
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                Apply Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>);

};