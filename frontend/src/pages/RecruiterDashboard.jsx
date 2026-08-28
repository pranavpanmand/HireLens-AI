import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useRecruiterJobs, useCreateJob } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase, MapPin, DollarSign, Clock, Users, Loader2 } from "lucide-react";

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { data: jobs, isLoading } = useRecruiterJobs();
  const createJob = useCreateJob();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    salary_range: "",
    job_type: "Full-time",
    description: "",
    skills: "",
    requirements: "",
    apply_url: "",
    is_active: true
  });

  const handleCreateJob = async (e) => {
    e.preventDefault();

    await createJob.mutateAsync({
      ...newJob,
      skills: newJob.skills.split(",").map((s) => s.trim()).filter(Boolean),
      requirements: newJob.requirements.split(",").map((s) => s.trim()).filter(Boolean)
    });

    setNewJob({
      title: "",
      company: "",
      location: "",
      salary_range: "",
      job_type: "Full-time",
      description: "",
      skills: "",
      requirements: "",
      apply_url: "",
      is_active: true
    });
    setIsDialogOpen(false);
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
                Manage your job postings and find top talent
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Plus className="w-5 h-5 mr-2" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Job Posting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateJob} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        placeholder="Senior Frontend Developer"
                        required />
                      
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newJob.company}
                        onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                        placeholder="Your Company"
                        required />
                      
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        placeholder="San Francisco, CA (Remote)"
                        required />
                      
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input
                        id="salary"
                        value={newJob.salary_range}
                        onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                        placeholder="$120K - $150K" />
                      
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Type</Label>
                      <Select value={newJob.job_type} onValueChange={(v) => setNewJob({ ...newJob, job_type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apply_url">Application URL</Label>
                      <Input
                        id="apply_url"
                        value={newJob.apply_url}
                        onChange={(e) => setNewJob({ ...newJob, apply_url: e.target.value })}
                        placeholder="https://..." />
                      
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Describe the role and responsibilities..."
                      rows={4}
                      required />
                    
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      value={newJob.skills}
                      onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                      placeholder="React, TypeScript, Node.js" />
                    
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                    <Input
                      id="requirements"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                      placeholder="5+ years experience, Bachelor's degree" />
                    
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createJob.isPending}>
                      {createJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Job"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Jobs
                </CardTitle>
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobs?.filter((j) => j.is_active).length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Jobs Posted
                </CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobs?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <Card>
            <CardHeader>
              <CardTitle>Your Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ?
              <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div> :
              jobs && jobs.length > 0 ?
              <div className="space-y-4">
                  {jobs.map((job) =>
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
                  
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                            {job.salary_range &&
                        <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {job.salary_range}
                              </span>
                        }
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.skills?.slice(0, 3).map((skill) =>
                        <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                        )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={job.is_active ? "default" : "outline"}>
                            {job.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                )}
                </div> :

              <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No job postings yet</p>
                  <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}>
                  
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Button>
                </div>
              }
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>);

};

export default RecruiterDashboard;