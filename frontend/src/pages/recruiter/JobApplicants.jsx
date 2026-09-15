import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Mail, ExternalLink, Check, X, FileText,
  ChevronDown, Users, Filter, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { API_URL } from "@/services/api";
import { ApplicantProfileModal } from "@/components/recruiter/ApplicantProfileModal";
import { MessageCandidateModal } from "@/components/recruiter/MessageCandidateModal";

const PIPELINE_STAGES = [
  { key: "applied", label: "Applied", color: "bg-gray-100 text-gray-800 border-gray-200", dotColor: "bg-gray-400" },
  { key: "reviewed", label: "Reviewed", color: "bg-blue-100 text-blue-800 border-blue-200", dotColor: "bg-blue-500" },
  { key: "shortlisted", label: "Shortlisted", color: "bg-emerald-100 text-emerald-800 border-emerald-200", dotColor: "bg-emerald-500" },
  { key: "interview_scheduled", label: "Interview", color: "bg-violet-100 text-violet-800 border-violet-200", dotColor: "bg-violet-500" },
  { key: "offered", label: "Offered", color: "bg-amber-100 text-amber-800 border-amber-200", dotColor: "bg-amber-500" },
  { key: "rejected", label: "Rejected", color: "bg-red-100 text-red-800 border-red-200", dotColor: "bg-red-500" },
];

export default function JobApplicants() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeStageFilter, setActiveStageFilter] = useState("all");

  const [profileModalAppId, setProfileModalAppId] = useState(null);
  const [messageModalState, setMessageModalState] = useState({ isOpen: false, applicationId: null, candidate: null });

  const handleOpenProfile = (appId) => setProfileModalAppId(appId);
  const handleCloseProfile = () => setProfileModalAppId(null);
  
  const handleOpenMessage = (appId, candidate) => {
    setMessageModalState({ isOpen: true, applicationId: appId, candidate });
  };
  const handleCloseMessage = () => {
    setMessageModalState({ isOpen: false, applicationId: null, candidate: null });
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ['job-applicants', jobId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/applications/job/${jobId}`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch applicants');
      return res.json();
    }
  });

  const applicants = response?.data || [];

  const updateStatus = useMutation({
    mutationFn: async ({ applicationId, status, note }) => {
      const res = await fetch(`${API_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, note })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['job-applicants', jobId]);
      toast.success('Status updated');
    },
    onError: (err) => {
      toast.error(err.message || 'Error updating status');
    }
  });

  const bulkUpdateStatus = useMutation({
    mutationFn: async ({ ids, status }) => {
      const promises = ids.map(id =>
        fetch(`${API_URL}/applications/${id}/status`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status })
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['job-applicants', jobId]);
      setSelectedIds(new Set());
      toast.success('Bulk update complete');
    },
    onError: () => {
      toast.error('Some updates failed');
    }
  });

  const getStageInfo = (status) => PIPELINE_STAGES.find(s => s.key === status) || PIPELINE_STAGES[0];

  // Pipeline counts
  const stageCounts = useMemo(() => {
    const counts = {};
    PIPELINE_STAGES.forEach(s => { counts[s.key] = 0; });
    applicants.forEach(a => {
      const key = a.status || 'applied';
      if (counts[key] !== undefined) counts[key]++;
    });
    return counts;
  }, [applicants]);

  const filteredApplicants = activeStageFilter === "all"
    ? applicants
    : applicants.filter(a => (a.status || 'applied') === activeStageFilter);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredApplicants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredApplicants.map(a => a._id)));
    }
  };

  const handleBulkAction = (status) => {
    if (selectedIds.size === 0) return;
    bulkUpdateStatus.mutate({ ids: Array.from(selectedIds), status });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-6xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/recruiter')}
            className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Applicant Pipeline</h1>
            <p className="text-muted-foreground">Track and manage candidates through the hiring process</p>
          </div>

          {/* Pipeline Stage Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 p-1 bg-muted/50 rounded-xl">
            <button
              onClick={() => setActiveStageFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeStageFilter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({applicants.length})
            </button>
            {PIPELINE_STAGES.map(stage => (
              <button
                key={stage.key}
                onClick={() => setActiveStageFilter(stage.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeStageFilter === stage.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                {stage.label} ({stageCounts[stage.key] || 0})
              </button>
            ))}
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3 flex-wrap"
            >
              <span className="text-sm font-medium text-foreground">
                {selectedIds.size} selected
              </span>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => handleBulkAction('reviewed')}>
                  Mark Reviewed
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleBulkAction('shortlisted')}>
                  Shortlist
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1 text-violet-600 border-violet-200 hover:bg-violet-50" onClick={() => handleBulkAction('interview_scheduled')}>
                  Schedule Interview
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleBulkAction('rejected')}>
                  Reject
                </Button>
              </div>
              <Button size="sm" variant="ghost" className="text-xs ml-auto" onClick={() => setSelectedIds(new Set())}>
                Clear
              </Button>
            </motion.div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-16 text-center shadow-sm">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground text-lg">
                {activeStageFilter === "all"
                  ? "No applicants yet for this job."
                  : `No applicants in "${getStageInfo(activeStageFilter).label}" stage.`}
              </p>
            </div>
          ) : (
            <>
              {/* Select all */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredApplicants.length && filteredApplicants.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                  Select all
                </label>
                <span className="text-xs text-muted-foreground">
                  {filteredApplicants.length} candidate{filteredApplicants.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {filteredApplicants.map((application, index) => {
                  const stageInfo = getStageInfo(application.status);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      key={application._id}
                      className={`bg-card rounded-xl p-5 shadow-sm border transition-all ${
                        selectedIds.has(application._id) ? "border-primary/50 bg-primary/[0.02]" : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedIds.has(application._id)}
                          onChange={() => toggleSelect(application._id)}
                          className="mt-1 rounded border-border"
                        />

                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                          {application.studentId?.avatarUrl ? (
                            <img src={application.studentId.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            application.studentId?.fullName?.charAt(0) || 'U'
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 cursor-pointer group" onClick={() => handleOpenProfile(application._id)}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {application.studentId?.fullName}
                            </h3>
                            <Badge variant="outline" className={`capitalize text-[10px] ${stageInfo.color}`}>
                              {stageInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3.5 h-3.5" />
                            {application.studentId?.email}
                          </p>
                          {application.resumeId?.fileUrl && (
                            <a
                              href={application.resumeId.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View Resume
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 ml-4 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMessage(application._id, application.studentId);
                            }}
                          >
                            <Mail className="w-3 h-3" /> Message
                          </Button>
                        </div>

                        {/* Match Score */}
                        <div className="text-right shrink-0">
                          <div className={`text-2xl font-bold tabular-nums ${
                            application.matchScore >= 80 ? 'text-emerald-600' :
                            application.matchScore >= 60 ? 'text-amber-600' : 'text-orange-600'
                          }`}>
                            {application.matchScore}%
                          </div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Match</p>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col gap-1 shrink-0">
                          {PIPELINE_STAGES.filter(s => s.key !== 'applied' && s.key !== application.status).slice(0, 3).map(stage => (
                            <Button
                              key={stage.key}
                              variant="ghost"
                              size="sm"
                              className={`text-[11px] h-7 px-2 justify-start`}
                              onClick={() => {
                                const note = window.prompt(`Add an optional personal note for ${application.studentId.fullName} (leave blank to skip):`);
                                if (note !== null) {
                                  updateStatus.mutate({ applicationId: application._id, status: stage.key, note });
                                }
                              }}
                              disabled={updateStatus.isPending}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${stage.dotColor} mr-1.5`} />
                              {stage.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <ApplicantProfileModal 
        isOpen={!!profileModalAppId}
        applicationId={profileModalAppId}
        onClose={handleCloseProfile}
        onMessageClick={(appId, candidate) => {
          handleCloseProfile();
          handleOpenMessage(appId, candidate);
        }}
      />
      
      <MessageCandidateModal 
        isOpen={messageModalState.isOpen}
        applicationId={messageModalState.applicationId}
        candidate={messageModalState.candidate}
        onClose={handleCloseMessage}
      />

      <Footer />
    </div>
  );
}
