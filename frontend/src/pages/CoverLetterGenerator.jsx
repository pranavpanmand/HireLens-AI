import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useJobs } from "@/hooks/useJobs";
import { useResumes } from "@/hooks/useResumes";
import { useCoverLetter } from "@/hooks/useCoverLetter";
import { Loader2, FileText, Copy, Download, Sparkles, Check, Award, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function CoverLetterGenerator() {
  const { data: resumes = [] } = useResumes();
  const { data: jobsData } = useJobs({ page: 1, limit: 20 });
  const jobs = jobsData?.jobs || [];
  const generateCoverLetterMutation = useCoverLetter();

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [customAchievements, setCustomAchievements] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetterResult, setCoverLetterResult] = useState(null);
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
    if (!jobTitle.trim() || !company.trim()) {
      toast.error("Job title and company name are required.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCoverLetterMutation.mutateAsync({
        jobId: selectedJobId || undefined,
        jobTitle,
        company,
        jobDescription,
        resumeId: selectedResumeId || undefined,
        customAchievements
      });
      setCoverLetterResult(result);
      toast.success("Cover letter generated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to generate cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetterResult?.coverLetter) return;
    navigator.clipboard.writeText(coverLetterResult.coverLetter);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!coverLetterResult?.coverLetter) return;
    const blob = new Blob([coverLetterResult.coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${company.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> AI Cover Letter Generator
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Generate a Custom Winning Cover Letter
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Choose your target resume, enter company details, paste key responsibilities, and highlight your achievements for an ATS-optimized cover letter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Form */}
          <div className="md:col-span-6 space-y-4">
            <Card className="border border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Customize Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  {/* Select Resume */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-primary" /> Select Resume Source
                    </label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Use Primary Resume (Default) --</option>
                      {resumes.map(r => (
                        <option key={r.id || r._id} value={r.id || r._id}>
                          {r.fileName || r.file_name || "Resume"} {r.isPrimary ? "(Primary)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Select Job */}
                  {jobs.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Quick Autofill from Available Jobs
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Job Title *
                      </label>
                      <Input
                        placeholder="e.g. Frontend Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Company Name *
                      </label>
                      <Input
                        placeholder="e.g. Google, Startup"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Company Job Description / Requirements
                    </label>
                    <Textarea
                      placeholder="Paste key responsibilities or requirements from the job post..."
                      rows={3}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-primary" /> Key Achievements to Emphasize (Optional)
                    </label>
                    <Textarea
                      placeholder="e.g. Scaled app to 10k users, reduced latency by 30%, winner of Hackathon 2025..."
                      rows={2}
                      value={customAchievements}
                      onChange={(e) => setCustomAchievements(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full bg-gradient-primary hover:opacity-90 h-11 text-base font-semibold"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Crafting Cover Letter...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" /> Generate Cover Letter
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Result Output */}
          <div className="md:col-span-6">
            <Card className="border border-border shadow-md h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Generated Result
                </CardTitle>
                {coverLetterResult && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="w-4 h-4 text-green-500 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 p-6">
                {coverLetterResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/40 border border-border rounded-xl text-sm font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                      {coverLetterResult.coverLetter}
                    </div>

                    {coverLetterResult.keyHighlights?.length > 0 && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Key Highlighted Strengths</h4>
                        <ul className="list-disc list-inside text-xs text-foreground space-y-1">
                          {coverLetterResult.keyHighlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <FileText className="w-8 h-8" />
                    </div>
                    <p className="font-medium text-foreground">No cover letter generated yet</p>
                    <p className="text-xs max-w-xs">Select your resume, fill out target job details, add key achievements, and click "Generate".</p>
                  </div>
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
