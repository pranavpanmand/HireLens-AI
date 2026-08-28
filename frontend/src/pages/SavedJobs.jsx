import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/jobs/JobCard";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useAnalyzeMatch } from "@/hooks/useMatchAnalysis";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { MatchAnalysisModal } from "@/components/analysis/MatchAnalysisModal";

export default function SavedJobs() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { data: savedJobs, isLoading } = useSavedJobs();
  
  // Match Analysis state
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const analyzeMatch = useAnalyzeMatch();

  const handleAnalyzeMatch = async (job) => {
    setSelectedJob(job);
    setIsAnalysisModalOpen(true);
    await analyzeMatch.mutateAsync(job.id || job._id);
  };

  const filteredJobs = savedJobs?.filter(job => 
    job.title?.toLowerCase().includes(search.toLowerCase()) || 
    job.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">Saved Jobs</h1>
            <p className="text-muted-foreground">Keep track of the opportunities you're interested in.</p>
          </div>

          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-card border border-border mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search saved jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your saved jobs...</p>
            </div>
          ) : !savedJobs || savedJobs.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">No saved jobs yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                When you find a job you like, click the bookmark icon to save it here for later.
              </p>
              <Button onClick={() => navigate('/jobs')} className="bg-gradient-primary">
                Explore Jobs
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence mode="popLayout">
                {filteredJobs?.map((job, index) => (
                  <JobCard 
                    key={job._id}
                    job={{...job, id: job._id}} 
                    onAnalyze={() => handleAnalyzeMatch(job)}
                    index={index}
                  />
                ))}
              </AnimatePresence>

              {filteredJobs?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No saved jobs match your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selectedJob && (
        <MatchAnalysisModal
          isOpen={isAnalysisModalOpen}
          onClose={() => {
            setIsAnalysisModalOpen(false);
            analyzeMatch.reset();
            setSelectedJob(null);
          }}
          job={selectedJob}
          result={analyzeMatch.data}
          isLoading={analyzeMatch.isPending}
          error={analyzeMatch.error?.message}
        />
      )}
    </div>
  );
}
