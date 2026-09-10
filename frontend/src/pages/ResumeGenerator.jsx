import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useJobs } from "@/hooks/useJobs";
import { useResumes } from "@/hooks/useResumes";
import { useTailoredResume } from "@/hooks/useTailoredResume";
import { Loader2, FileText, Copy, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ResumeGenerator() {
  const { data: resumes = [] } = useResumes();
  const { data: jobsData } = useJobs({ page: 1, limit: 20 });
  const jobs = jobsData?.jobs || [];
  const generateResumeMutation = useTailoredResume();

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (resumes.length === 0) {
      toast.error("Please upload a resume in your profile first!");
      return;
    }
    if (!jobTitle.trim() || !jobDescription.trim()) {
      toast.error("Job title and job description are required.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateResumeMutation.mutateAsync({
        jobId: selectedJobId || undefined,
        jobTitle,
        company,
        jobDescription,
        resumeId: selectedResumeId || undefined
      });
      setGeneratedResume(result.content);
      toast.success("Resume tailored successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to generate tailored resume");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResume) return;
    navigator.clipboard.writeText(generatedResume);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedResume) return;
    const blob = new Blob([generatedResume], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tailored_Resume_${jobTitle.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> AI Resume Tailoring
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Generate a Job-Specific Resume
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Paste a job description, and our AI will rewrite and reorder your existing resume's bullet points to highlight the exact skills the employer is looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <Card className="border border-border shadow-md sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Target Job Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  {resumes.length > 1 && (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Select Base Resume</label>
                      <select
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Primary Resume (Default)</option>
                        {resumes.map(r => (
                          <option key={r._id} value={r._id}>
                            Resume {new Date(r.createdAt).toLocaleDateString()} {r.isPrimary ? '(Primary)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {jobs.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Or Load Saved Job</label>
                      <select
                        value={selectedJobId}
                        onChange={handleSelectJob}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">-- Choose a job --</option>
                        {jobs.map(j => (
                          <option key={j.id || j._id} value={j.id || j._id}>
                            {j.title} @ {j.company}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Target Job Title *</label>
                    <Input
                      placeholder="e.g. Senior Frontend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Target Company</label>
                    <Input
                      placeholder="e.g. Google, Apple, Startup"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Job Description *</label>
                    <Textarea
                      placeholder="Paste the full job description or key requirements here..."
                      rows={6}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isGenerating || resumes.length === 0}
                    className="w-full bg-gradient-primary hover:opacity-90 h-11"
                  >
                    {isGenerating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Tailoring Resume...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" /> Generate Tailored Resume</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card className="border border-border shadow-md h-full min-h-[600px] flex flex-col">
              <CardHeader className="border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Generated Resume
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!generatedResume}
                    >
                      <Copy className="w-4 h-4 mr-2" /> {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!generatedResume}
                    >
                      <Download className="w-4 h-4 mr-2" /> Download MD
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col relative bg-muted/10">
                {!generatedResume ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-muted-foreground min-h-[400px]">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-primary/40" />
                    </div>
                    <p className="text-lg font-medium">Your tailored resume will appear here.</p>
                    <p className="text-sm max-w-md mt-2">
                      Fill out the target job details on the left, and our AI will rewrite your existing resume to perfectly match the role.
                    </p>
                  </div>
                ) : (
                  <textarea
                    className="flex-1 w-full p-6 bg-transparent border-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
                    value={generatedResume}
                    onChange={(e) => setGeneratedResume(e.target.value)}
                    style={{ minHeight: "500px" }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
