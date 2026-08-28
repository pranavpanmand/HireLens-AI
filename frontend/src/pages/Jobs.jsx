import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobCard } from "@/components/jobs/JobCard";
import { MatchAnalysis } from "@/components/analysis/MatchAnalysis";
import { useJobs } from "@/hooks/useJobs";
import { usePrimaryResume } from "@/hooks/useResumes";
import { useAnalyzeMatch } from "@/hooks/useMatchAnalysis";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, SearchX, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const DEFAULT_FILTERS = {
  search: "", location: "All", source: "All", workMode: "All",
  jobType: "All", experienceLevel: "All", minSalary: "",
  maxSalary: "", skills: [], postedWithin: "", page: 1
};

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedJob, setSelectedJob] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [sort, setSort] = useState(searchParams.get("sort") || "recent");

  // Initialize filters from URL
  const [filters, setFilters] = useState(() => {
    const skills = searchParams.get("skills");
    return {
      search: searchParams.get("search") || "",
      location: searchParams.get("location") || "All",
      source: searchParams.get("source") || "All",
      workMode: searchParams.get("workMode") || "All",
      jobType: searchParams.get("jobType") || "All",
      experienceLevel: searchParams.get("experienceLevel") || "All",
      minSalary: searchParams.get("minSalary") || "",
      maxSalary: searchParams.get("maxSalary") || "",
      skills: skills ? skills.split(",").filter(Boolean) : [],
      postedWithin: searchParams.get("postedWithin") || "",
      page: parseInt(searchParams.get("page")) || 1,
    };
  });

  const { user } = useAuth();
  const { data, isLoading, isError, error } = useJobs({ ...filters, sort });
  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  const { data: primaryResume } = usePrimaryResume();
  const analyzeMatch = useAnalyzeMatch();
  
  const { data: recommendations, isLoading: loadingRecs } = useRecommendations(5);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.location && filters.location !== "All") params.set("location", filters.location);
    if (filters.source && filters.source !== "All") params.set("source", filters.source);
    if (filters.workMode && filters.workMode !== "All") params.set("workMode", filters.workMode);
    if (filters.jobType && filters.jobType !== "All") params.set("jobType", filters.jobType);
    if (filters.experienceLevel && filters.experienceLevel !== "All") params.set("experienceLevel", filters.experienceLevel);
    if (filters.minSalary) params.set("minSalary", filters.minSalary);
    if (filters.maxSalary) params.set("maxSalary", filters.maxSalary);
    if (filters.skills?.length > 0) params.set("skills", filters.skills.join(","));
    if (filters.postedWithin) params.set("postedWithin", filters.postedWithin);
    if (sort !== "recent") params.set("sort", sort);
    if (filters.page > 1) params.set("page", filters.page.toString());
    setSearchParams(params, { replace: true });
  }, [filters, sort, setSearchParams]);

  const handleFiltersChange = useCallback((newFilters) => {
    // Reset to page 1 when any filter other than page changes
    const pageChanged = newFilters.page !== filters.page;
    setFilters(pageChanged ? newFilters : { ...newFilters, page: 1 });
  }, [filters.page]);

  const handleSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSort(newSort);
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleAnalyze = async (job) => {
    if (!user) {
      toast.error("Please sign in to analyze job matches");
      return;
    }
    if (!primaryResume) {
      toast.error("Please upload a resume first");
      return;
    }
    setSelectedJob(job);
    try {
      const result = await analyzeMatch.mutateAsync({
        resumeId: primaryResume.id,
        jobId: job.id
      });
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis failed:", err);
    }
  };

  // Transform to JobCard format
  const transformedJobs = jobs.map((job) => ({
    id: job.id || job._id,
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salaryRange || "Competitive",
    type: job.jobType,
    workMode: job.workMode,
    posted: job.postedAt ? new Date(job.postedAt).toLocaleDateString() : (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"),
    description: job.description,
    skills: job.skills || [],
    applyUrl: job.applyUrl || "#",
    source: job.source
  }));

  // Loading skeleton
  const SkeletonCard = () => (
    <div className="bg-card rounded-xl p-6 border border-border animate-pulse">
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-xl bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="flex gap-3 mt-3">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-4 bg-muted rounded w-20" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-6 bg-muted rounded-full w-16" />
            <div className="h-6 bg-muted rounded-full w-20" />
            <div className="h-6 bg-muted rounded-full w-14" />
          </div>
          <div className="h-4 bg-muted rounded w-full mt-3" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      </div>
    </div>
  );

  // Pagination with numbered pages
  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null;
    const { page: currentPage, pages: totalPages } = pagination;
    const pageNumbers = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pageNumbers.push(i);

    return (
      <div className="flex items-center justify-center gap-1 mt-8">
        <Button
          variant="outline" size="sm"
          disabled={currentPage === 1}
          onClick={() => setFilters(prev => ({ ...prev, page: currentPage - 1 }))}
        >← Previous</Button>

        {start > 1 && (
          <>
            <Button variant="ghost" size="sm" onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}>1</Button>
            {start > 2 && <span className="text-muted-foreground px-1">...</span>}
          </>
        )}

        {pageNumbers.map(num => (
          <Button
            key={num}
            variant={num === currentPage ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, page: num }))}
            className={num === currentPage ? "bg-primary text-primary-foreground" : ""}
          >{num}</Button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-muted-foreground px-1">...</span>}
            <Button variant="ghost" size="sm" onClick={() => setFilters(prev => ({ ...prev, page: totalPages }))}>{totalPages}</Button>
          </>
        )}

        <Button
          variant="outline" size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setFilters(prev => ({ ...prev, page: currentPage + 1 }))}
        >Next →</Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Find Your Next Opportunity
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse {pagination?.total ? `${pagination.total.toLocaleString()}+` : ""} jobs and let AI analyze how well you match each position
              {!user && " — Sign in to analyze matches"}
            </p>
          </div>

          {/* Recommendations */}
          {user && (recommendations?.length > 0 || loadingRecs) && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-xl text-foreground">Recommended for You</h2>
              </div>
              
              {loadingRecs ? (
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="min-w-[320px] bg-card rounded-xl p-5 border border-border animate-pulse h-40" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {recommendations.map(job => (
                    <div key={job._id || job.id} className="min-w-[340px] max-w-[340px] bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-5 border border-primary/20 flex flex-col cursor-pointer hover:shadow-md transition" onClick={() => setSelectedJob(job)}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-foreground line-clamp-1">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                          {job.matchPercent}% Match
                        </div>
                      </div>
                      <div className="mt-auto">
                        <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 text-xs text-foreground/80 leading-relaxed italic border border-primary/10">
                          "{job.matchReason || 'Your profile skills align well with the requirements for this role.'}"
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6">
            <JobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
              totalJobs={pagination?.total}
              sortValue={sort}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Job Cards */}
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">Something went wrong</p>
              <p className="text-muted-foreground text-sm mb-4">{error?.message || "Failed to load jobs"}</p>
              <Button variant="outline" onClick={() => setFilters(prev => ({ ...prev }))}>Try Again</Button>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid gap-4">
              {transformedJobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onAnalyze={() => handleAnalyze(jobs[index])}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">No jobs found</p>
              <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search query</p>
              <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear Filters</Button>
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </div>
      </main>

      <Footer />

      {/* Match Analysis Modal */}
      <AnimatePresence>
        {selectedJob && (
          <MatchAnalysis
            job={{
              id: selectedJob.id || selectedJob._id,
              title: selectedJob.title,
              company: selectedJob.company,
              location: selectedJob.location,
              salary: selectedJob.salaryRange || "Competitive",
              type: selectedJob.jobType,
              posted: selectedJob.postedAt ? new Date(selectedJob.postedAt).toLocaleDateString() : "Recently",
              description: selectedJob.description,
              skills: selectedJob.skills || [],
              applyUrl: selectedJob.applyUrl || "#"
            }}
            analysisResult={analysisResult}
            isLoading={analyzeMatch.isPending}
            onClose={() => {
              setSelectedJob(null);
              setAnalysisResult(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;