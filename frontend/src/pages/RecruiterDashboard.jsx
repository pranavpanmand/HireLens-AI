import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useRecruiterJobs, useCreateJob, useRecruiterStats, useUpdateJob, useDeleteJob } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import {
  Plus, Briefcase, MapPin, DollarSign, Clock, Users, Loader2,
  BarChart3, TrendingUp, Copy, Trash2, ToggleLeft, ToggleRight,
  Globe, Building2, Eye
} from "lucide-react";

const EMPTY_JOB = {
  title: "",
  company: "",
  location: "",
  salaryRange: "",
  jobType: "Full-time",
  workMode: "",
  experienceLevel: "",
  description: "",
  skills: "",
  requirements: "",
  applyUrl: "",
  isActive: true
};

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useRecruiterJobs();
  const { data: statsResponse } = useRecruiterStats();
  const stats = statsResponse?.data || {};
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({ ...EMPTY_JOB });

  const handleCreateJob = async (e) => {
    e.preventDefault();
    await createJob.mutateAsync({
      ...newJob,
      skills: newJob.skills.split(",").map((s) => s.trim()).filter(Boolean),
      requirements: newJob.requirements.split(",").map((s) => s.trim()).filter(Boolean)
    });
    setNewJob({ ...EMPTY_JOB });
    setIsDialogOpen(false);
  };

  const handleDuplicate = (job) => {
    setNewJob({
      title: job.title + " (Copy)",
      company: job.company,
      location: job.location,
      salaryRange: job.salaryRange || "",
      jobType: job.jobType || "Full-time",
      workMode: job.workMode || "",
      experienceLevel: job.experienceLevel || "",
      description: job.description || "",
      skills: (job.skills || []).join(", "),
      requirements: (job.requirements || []).join(", "),
      applyUrl: job.applyUrl || "",
      isActive: true
    });
    setIsDialogOpen(true);
    toast.info("Job duplicated — edit and post!");
  };

  const handleToggleActive = (job) => {
    updateJob.mutate(
      { id: job._id, data: { isActive: !job.isActive } },
      { onSuccess: () => toast.success(job.isActive ? "Job deactivated" : "Job activated") }
    );
  };

  const handleDelete = (job) => {
    if (window.confirm(`Delete "${job.title}"? This cannot be undone.`)) {
      deleteJob.mutate(job._id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Recruiter Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage postings, track applicants, and find top talent
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90 gap-2">
                  <Plus className="w-5 h-5" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Job Posting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateJob} className="space-y-5 mt-4">
                  {/* Row 1: Title + Company */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        placeholder="Senior Frontend Developer"
                        required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={newJob.company}
                        onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                        placeholder="Your Company"
                        required />
                    </div>
                  </div>

                  {/* Row 2: Location + Salary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        placeholder="San Francisco, CA"
                        required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input
                        id="salary"
                        value={newJob.salaryRange}
                        onChange={(e) => setNewJob({ ...newJob, salaryRange: e.target.value })}
                        placeholder="$120K - $150K / 12-18 LPA" />
                    </div>
                  </div>

                  {/* Row 3: Job Type + Work Mode + Experience */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Job Type *</Label>
                      <Select value={newJob.jobType} onValueChange={(v) => setNewJob({ ...newJob, jobType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Work Mode</Label>
                      <Select value={newJob.workMode || "none"} onValueChange={(v) => setNewJob({ ...newJob, workMode: v === "none" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not specified</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="On-site">On-site</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select value={newJob.experienceLevel || "none"} onValueChange={(v) => setNewJob({ ...newJob, experienceLevel: v === "none" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not specified</SelectItem>
                          <SelectItem value="Fresher">Fresher</SelectItem>
                          <SelectItem value="Entry Level">Entry Level</SelectItem>
                          <SelectItem value="Mid Level">Mid Level</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                      rows={5}
                      required />
                  </div>

                  {/* Skills + Requirements */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Required Skills</Label>
                      <Input
                        id="skills"
                        value={newJob.skills}
                        onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                        placeholder="React, TypeScript, Node.js" />
                      <p className="text-[11px] text-muted-foreground">Comma-separated</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requirements</Label>
                      <Input
                        id="requirements"
                        value={newJob.requirements}
                        onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                        placeholder="5+ years experience, Bachelor's degree" />
                      <p className="text-[11px] text-muted-foreground">Comma-separated</p>
                    </div>
                  </div>

                  {/* Apply URL */}
                  <div className="space-y-2">
                    <Label htmlFor="applyUrl">External Application URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input
                      id="applyUrl"
                      value={newJob.applyUrl}
                      onChange={(e) => setNewJob({ ...newJob, applyUrl: e.target.value })}
                      placeholder="Leave blank for in-app applications" />
                    <p className="text-[11px] text-muted-foreground">If left empty, candidates will apply directly on HireLens and you can track them here.</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createJob.isPending} className="gap-2 bg-gradient-primary hover:opacity-90">
                      {createJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {createJob.isPending ? "Posting..." : "Post Job"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active Jobs", value: stats.activeJobs ?? (jobs?.filter(j => j.isActive).length || 0), icon: Briefcase, color: "text-emerald-500" },
              { label: "Total Posted", value: stats.totalJobs ?? (jobs?.length || 0), icon: Globe, color: "text-blue-500" },
              { label: "Total Applicants", value: stats.totalApplicants ?? 0, icon: Users, color: "text-violet-500" },
              { label: "Avg Match Score", value: stats.avgMatchScore ? `${stats.avgMatchScore}%` : "—", icon: TrendingUp, color: "text-amber-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Job Listings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Job Postings</CardTitle>
              <Badge variant="secondary" className="text-xs">{jobs?.length || 0} total</Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {jobs.map((job) => {
                      const jobStats = stats.perJob?.[job._id];
                      const applicantCount = jobStats?.count || 0;
                      const avgScore = applicantCount > 0 ? Math.round(jobStats.totalScore / applicantCount) : 0;
                      return (
                        <motion.div
                          key={job._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={`p-5 rounded-xl border transition-all ${
                            job.isActive
                              ? "border-border hover:border-primary/30 bg-card"
                              : "border-border/50 bg-muted/30 opacity-70"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground text-lg truncate">{job.title}</h3>
                                <Badge variant={job.isActive ? "default" : "outline"} className="text-[10px] shrink-0">
                                  {job.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {job.workMode && (
                                  <Badge variant="secondary" className="text-[10px] shrink-0">{job.workMode}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{job.company}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {job.location}
                                </span>
                                {job.salaryRange && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    {job.salaryRange}
                                  </span>
                                )}
                                {job.experienceLevel && (
                                  <span className="flex items-center gap-1">
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    {job.experienceLevel}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {job.skills?.slice(0, 4).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-[10px]">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills?.length > 4 && (
                                  <Badge variant="outline" className="text-[10px]">+{job.skills.length - 4}</Badge>
                                )}
                              </div>
                            </div>

                            {/* Right side: Stats + Actions */}
                            <div className="flex flex-col items-end gap-3 shrink-0">
                              {/* Applicant count */}
                              <div className="text-right">
                                <p className="text-2xl font-bold text-foreground tabular-nums">{applicantCount}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Applicants</p>
                              </div>
                              {avgScore > 0 && (
                                <p className="text-xs text-muted-foreground">Avg Score: <span className="font-semibold text-foreground">{avgScore}%</span></p>
                              )}

                              {/* Action buttons */}
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 text-xs"
                                  onClick={() => navigate(`/recruiter/jobs/${job._id}/applicants`)}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleToggleActive(job)}
                                  title={job.isActive ? "Deactivate" : "Activate"}
                                >
                                  {job.isActive
                                    ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                                    : <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                                  }
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDuplicate(job)}
                                  title="Duplicate"
                                >
                                  <Copy className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(job)}
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">No job postings yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">Create your first job posting and start receiving applications</p>
                  <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-gradient-primary hover:opacity-90">
                    <Plus className="w-4 h-4" />
                    Post Your First Job
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecruiterDashboard;