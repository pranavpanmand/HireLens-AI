import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useJobs } from "@/hooks/useJobs";
import { MockInterviewModal } from "@/components/analysis/MockInterviewModal";
import { MessageSquare, Sparkles, Briefcase, Play, History } from "lucide-react";

export default function MockInterviewPage() {
  const { data: jobsData } = useJobs({ page: 1, limit: 20 });
  const jobs = jobsData?.jobs || [];

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [interviewType, setInterviewType] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Mid-Level");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [source, setSource] = useState("General");

  const [activeInterviewJob, setActiveInterviewJob] = useState(null);

  const handleSelectJob = (e) => {
    const id = e.target.value;
    setSelectedJobId(id);
    const found = jobs.find(j => (j.id || j._id) === id);
    if (found) {
      setJobTitle(found.title);
      setCompany(found.company);
      setJobDescription(found.description || "");
    }
  };

  const handleStartInterview = (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    setActiveInterviewJob({
      id: selectedJobId || `custom-${Date.now()}`,
      title: jobTitle,
      company: company || "Target Company",
      description: jobDescription || `${jobTitle} position`,
      interviewType,
      difficulty,
      numberOfQuestions: Number(numberOfQuestions),
      source
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> AI Mock Interview Practice
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Practice Real Technical & Behavioral Interviews
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto mb-6">
            Get AI-generated interview questions custom tailored to your target job, submit answers, and receive instant feedback & scoring.
          </p>
          <Button variant="outline" asChild>
            <Link to="/mock-interview/history" className="gap-2">
              <History className="w-4 h-4" /> View Past Interviews & Score Trend
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Preset Jobs */}
          <div className="md:col-span-5 space-y-4">
            <Card className="border border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Select From Recent Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                {jobs.length > 0 ? (
                  jobs.map(j => (
                    <div 
                      key={j.id || j._id}
                      onClick={() => setActiveInterviewJob({
                        id: j.id || j._id,
                        title: j.title,
                        company: j.company,
                        description: j.description || `${j.title} position`
                      })}
                      className="p-3 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{j.title}</h4>
                        <p className="text-xs text-muted-foreground">{j.company}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full group-hover:bg-primary group-hover:text-primary-foreground">
                        <Play className="w-4 h-4 ml-0.5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No recent jobs found. Use the custom form on the right.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Custom Role Form */}
          <div className="md:col-span-7">
            <Card className="border border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> Custom Interview Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStartInterview} className="space-y-4">
                  {jobs.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Or Load Job Info
                      </label>
                      <select
                        value={selectedJobId}
                        onChange={handleSelectJob}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">-- Choose a job posting --</option>
                        {jobs.map(j => (
                          <option key={j.id || j._id} value={j.id || j._id}>
                            {j.title} @ {j.company}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Target Job Title *
                    </label>
                    <Input
                      placeholder="e.g. Software Development Engineer (SDE 1)"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Target Company Name
                    </label>
                    <Input
                      placeholder="e.g. Google, Amazon, Startup"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Job Description / Requirements
                    </label>
                    <Textarea
                      placeholder="Paste job description or required skills (React, Node, System Design, STAR behavioral questions)..."
                      rows={4}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Interview Type
                      </label>
                      <select
                        value={interviewType}
                        onChange={(e) => setInterviewType(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Mixed">Mixed (Default)</option>
                        <option value="Technical">Technical Focus</option>
                        <option value="Behavioral">Behavioral / STAR</option>
                        <option value="HR">HR / Managerial</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Difficulty Level
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Entry-Level">Entry-Level</option>
                        <option value="Mid-Level">Mid-Level</option>
                        <option value="Senior">Senior / Staff</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Number of Questions
                      </label>
                      <select
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                        <option value={15}>15 Questions</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Source
                      </label>
                      <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="General">General Practice</option>
                        <option value="Saved Job">Based on Saved Job</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90 h-11 text-base font-semibold"
                  >
                    <Sparkles className="w-5 h-5 mr-2" /> Start AI Mock Interview
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal */}
        {activeInterviewJob && (
          <MockInterviewModal
            job={activeInterviewJob}
            onClose={() => setActiveInterviewJob(null)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
