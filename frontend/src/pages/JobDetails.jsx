import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Building2, Bookmark, ExternalLink, ArrowLeft, Loader2, Sparkles, AlertCircle, FileText, Copy, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCoverLetter } from "@/hooks/useCoverLetter";
import { useSavedJobs, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { MockInterviewModal } from "@/components/analysis/MockInterviewModal";
import DOMPurify from 'dompurify';
import { toast } from "sonner";
import { API_URL } from "@/services/api";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [analyzing, setAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetterData, setCoverLetterData] = useState(null);
  const [coverLetterContent, setCoverLetterContent] = useState("");
  const [showMockInterview, setShowMockInterview] = useState(false);

  // Fetch job details by ID from the backend
  const { data: jobResponse, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }
      return response.json();
    },
    enabled: !!id,
  });

  const job = jobResponse?.data;
  const coverLetterHook = useCoverLetter();
  const queryClient = useQueryClient();

  const { data: savedJobs } = useSavedJobs();
  const toggleSaveJob = useToggleSaveJob();
  const isSaved = savedJobs?.some(sj => sj._id === id);

  const handleSaveClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleSaveJob(id);
  };

  const handleAnalyzeMatch = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      // POST to match endpoint
      const response = await fetch(`${API_URL}/matches/job/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || 'Analysis failed. Please ensure you have uploaded a resume in your Dashboard.');
      }

      setMatchResult(data.data);
    } catch (err) {
      console.error(err);
      setAnalyzeError(err.message || 'Unable to analyze this job right now.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setGeneratingCoverLetter(true);
    try {
      const result = await coverLetterHook.mutateAsync(id);
      setCoverLetterData(result);
      setCoverLetterContent(result.coverLetter);
    } catch (err) {
      toast.error(err.message || "Failed to generate cover letter.");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleApply = () => {
    if (job?.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    }
  };

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/applications/job/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || data.error || 'Failed to apply');
      return data;
    },
    onSuccess: () => {
      toast.success("Successfully applied for this job!");
      queryClient.invalidateQueries(['applications']); // invalidate if we add a my-applications query later
    },
    onError: (err) => {
      toast.error(err.message || "Could not apply for job.");
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-lg">Loading job details...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen pt-24 bg-background flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Job not found</h2>
        <p className="text-muted-foreground mb-6">Unable to load job details. Please try again or the job may have been removed.</p>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  const formattedDate = job.createdAt || job.postedAt ? new Date(job.createdAt || job.postedAt).toLocaleDateString() : 'Recently';

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container max-w-4xl mx-auto px-4">

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/jobs')}
          className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-8 shadow-card border border-border mb-8"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
              <Building2 className="w-10 h-10 text-primary-foreground" />
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground mb-2">{job.title}</h1>
                  <p className="text-xl text-muted-foreground mb-4">{job.company}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={handleSaveClick}>
                    <Bookmark className={`w-5 h-5 transition-colors ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span>{job.salaryRange || 'Competitive'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{formattedDate}</span>
                </div>
                {job.source && (
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {job.source}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  onClick={handleAnalyzeMatch}
                  disabled={analyzing}
                  className="bg-gradient-primary hover:opacity-90 flex-1 md:flex-none h-12 px-8 text-lg"
                >
                  {analyzing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  {analyzing ? 'Analyzing Match...' : 'Analyze Match'}
                </Button>

                <Button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCoverLetter}
                  variant="outline"
                  className="flex-1 md:flex-none h-12 px-8 text-lg border-2"
                >
                  {generatingCoverLetter ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary" />
                  ) : (
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                  )}
                  {generatingCoverLetter ? 'Writing...' : 'Cover Letter'}
                </Button>

                <Button
                  onClick={() => setShowMockInterview(true)}
                  variant="outline"
                  className="flex-1 md:flex-none h-12 px-8 text-lg border-2"
                >
                  <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                  Practice Interview
                </Button>

                {job.applyUrl ? (
                  <Button
                    onClick={handleApply}
                    variant="outline"
                    className="flex-1 md:flex-none h-12 px-8 text-lg border-2 ml-auto"
                  >
                    Apply Externally
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => applyMutation.mutate()}
                    disabled={applyMutation.isPending}
                    className="bg-primary hover:bg-primary/90 flex-1 md:flex-none h-12 px-8 text-lg ml-auto"
                  >
                    {applyMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    {applyMutation.isPending ? 'Applying...' : 'Apply Internally'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Cover Letter Result */}
        <AnimatePresence>
          {coverLetterData && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="mb-8"
            >
              <div className="bg-card rounded-2xl p-8 shadow-card border border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">AI Cover Letter</h2>
                      <p className="text-sm text-muted-foreground">Tailored for {job.company}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      navigator.clipboard.writeText(coverLetterContent);
                      toast.success("Copied to clipboard!");
                    }}>
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button size="sm" className="bg-primary" onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob([coverLetterContent], { type: 'text/plain' });
                      element.href = URL.createObjectURL(file);
                      element.download = `Cover_Letter_${job.company}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}>
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/30 border border-border rounded-xl p-6">
                  <textarea
                    value={coverLetterContent}
                    onChange={(e) => setCoverLetterContent(e.target.value)}
                    className="w-full min-h-[400px] bg-transparent border-none resize-y focus:ring-0 text-foreground leading-relaxed font-serif p-0"
                  />
                </div>

                <div className="mt-4 flex gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-foreground mr-2">Key Highlights:</span>
                    <span className="text-muted-foreground">{coverLetterData.keyHighlights?.join(" • ")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Analysis Result */}
        {analyzeError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-6 bg-destructive/10 border border-destructive/20 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-destructive mb-1">Analysis Failed</h3>
                <p className="text-destructive/80">{analyzeError}</p>
                <Button
                  variant="outline"
                  className="mt-4 border-destructive/20 text-destructive hover:bg-destructive/10"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard to Upload Resume
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {matchResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-display font-bold">AI Match Analysis</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="bg-background rounded-xl p-6 text-center shadow-sm border border-border h-full flex flex-col justify-center">
                  <p className="text-muted-foreground mb-2 font-medium">Overall Match</p>
                  <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-primary">
                    {matchResult.matchScore}%
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {matchResult.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      Matched Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.matchedSkills?.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-rose-600">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      Missing Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.missingSkills?.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {matchResult.learningPath?.length > 0 && (
              <div className="mt-8 pt-8 border-t border-primary/10">
                <h3 className="text-xl font-semibold mb-4">Recommended Learning Path</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {matchResult.learningPath.map((path, idx) => (
                    <div key={idx} className="bg-background rounded-xl p-5 border border-border">
                      <h4 className="font-semibold text-primary mb-3">Learn: {path.skill}</h4>
                      <ul className="space-y-3">
                        {path.resources?.map((res, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2 text-sm">
                            <ExternalLink className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              {res.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Content Tabs / Main Content */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
          <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-border">Job Description</h2>

          {job.description ? (
            <div
              className="prose prose-gray max-w-none dark:prose-invert prose-headings:font-display prose-a:text-primary hover:prose-a:text-primary/80"
              dangerouslySetInnerHTML={createMarkup(job.description)}
            />
          ) : (
            <p className="text-muted-foreground italic">Job description not provided.</p>
          )}

          <div className="mt-12 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Employment Type</p>
              <p className="font-medium">{job.jobType || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Experience</p>
              <p className="font-medium">{job.experience || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Job ID</p>
              <p className="font-medium text-xs font-mono bg-muted p-1 rounded inline-block truncate w-full">{job.externalId || job._id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Provider</p>
              <p className="font-medium">{job.source || 'Internal'}</p>
            </div>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {showMockInterview && (
          <MockInterviewModal
            job={job}
            onClose={() => setShowMockInterview(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
