import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, ExternalLink, ChevronDown, Check, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function JobApplicants() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['job-applicants', jobId],
    queryFn: async () => {
      const res = await fetch(`/api/applications/job/${jobId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch applicants');
      return res.json();
    }
  });

  const applicants = response?.data || [];

  const updateStatus = useMutation({
    mutationFn: async ({ applicationId, status }) => {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['job-applicants', jobId]);
      toast.success('Applicant status updated');
    },
    onError: (err) => {
      toast.error(err.message || 'Error updating status');
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-5xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/recruiter')}
            className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">Applicants</h1>
              <p className="text-muted-foreground">Manage candidates for this role</p>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium">
              {applicants.length} Total Applicants
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : applicants.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
              <p className="text-muted-foreground text-lg">No applicants yet for this job.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((application, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={application._id} 
                  className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col md:flex-row gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                          {application.studentId?.avatarUrl ? (
                            <img src={application.studentId.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            application.studentId?.fullName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{application.studentId?.fullName}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {application.studentId?.email}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Match Score</span>
                          <span className={`text-lg font-bold ${application.matchScore >= 80 ? 'text-green-600' : application.matchScore >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>
                            {application.matchScore}%
                          </span>
                        </div>
                        <Badge variant="outline" className={`capitalize ${getStatusColor(application.status)}`}>
                          {application.status}
                        </Badge>
                      </div>
                    </div>

                    {application.resumeId && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <span className="font-medium">Candidate Resume</span>
                          </div>
                          {application.resumeId.fileUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={application.resumeId.fileUrl} target="_blank" rel="noopener noreferrer">
                                View PDF <ExternalLink className="w-4 h-4 ml-2" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 justify-center md:w-48 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => updateStatus.mutate({ applicationId: application._id, status: 'reviewed' })}
                      disabled={application.status === 'reviewed' || updateStatus.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" /> Mark Reviewed
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => updateStatus.mutate({ applicationId: application._id, status: 'shortlisted' })}
                      disabled={application.status === 'shortlisted' || updateStatus.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" /> Shortlist
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => updateStatus.mutate({ applicationId: application._id, status: 'rejected' })}
                      disabled={application.status === 'rejected' || updateStatus.isPending}
                    >
                      <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
