import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, MapPin, GraduationCap, Briefcase, FileText, Lock, Loader2, Link as LinkIcon, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { API_URL } from "@/services/api";

export function ApplicantProfileModal({ applicationId, isOpen, onClose, onMessageClick }) {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['applicant-profile', applicationId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/applications/${applicationId}/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    enabled: !!applicationId && isOpen
  });

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'resume'

  // Reset tab when closing/opening
  useEffect(() => {
    if (!isOpen) setActiveTab("profile");
  }, [isOpen]);

  if (!isOpen) return null;

  const data = response?.data;
  const isPrivate = data?.isPrivate;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-card border border-border shadow-xl rounded-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border bg-muted/20 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden">
                {data?.user?.avatarUrl ? (
                  <img src={data.user.avatarUrl} alt={data.user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{data?.user?.fullName?.charAt(0) || '?'}</span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{data?.user?.fullName || 'Applicant'}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                  {data?.user?.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {data.user.email}</span>}
                  {data?.user?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {data.user.phone}</span>}
                  {data?.profile?.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {data.profile.location}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => onMessageClick(applicationId, data?.user)} variant="secondary" className="gap-2">
                <Mail className="w-4 h-4" /> Message Candidate
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 px-6 border-b border-border shrink-0">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              Full Profile
            </button>
            <button 
              onClick={() => setActiveTab("resume")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'resume' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <FileText className="w-4 h-4" /> Resume PDF
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                <p>Loading candidate profile...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-64 text-red-500">
                <p>Failed to load profile. Please try again.</p>
              </div>
            ) : (
              <>
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    {/* Match Score & Status */}
                    <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-xl p-5 flex items-center gap-6">
                      <div className="shrink-0">
                        <CircularProgress value={data?.application?.matchScore || 0} size={80} strokeWidth={8} showLabel={true} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" /> AI Match Score
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">Based on the candidate's primary resume vs your job description.</p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline" className="capitalize text-xs">Status: {data?.application?.status?.replace('_', ' ')}</Badge>
                          <Badge variant="outline" className="text-xs text-muted-foreground font-normal">Applied: {new Date(data?.application?.createdAt).toLocaleDateString()}</Badge>
                        </div>
                      </div>
                    </div>

                    {isPrivate ? (
                      <div className="bg-muted/30 border border-border rounded-xl p-8 flex flex-col items-center text-center">
                        <Lock className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Private Profile</h3>
                        <p className="text-muted-foreground max-w-md">
                          This candidate has set their profile to private. You can only view their contact info and their resume PDF.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Summary */}
                        {data?.profile?.summary && (
                          <section>
                            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Summary</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.profile.summary}</p>
                          </section>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Experience */}
                          {data?.profile?.experience?.length > 0 && (
                            <section>
                              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Experience</h3>
                              <div className="space-y-4">
                                {data.profile.experience.map((exp, i) => (
                                  <div key={i} className="border-l-2 border-border pl-4">
                                    <h4 className="font-semibold text-sm">{exp.position}</h4>
                                    <p className="text-sm text-primary font-medium">{exp.company}</p>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate).getFullYear()}
                                    </p>
                                    {exp.description && <p className="text-sm text-muted-foreground line-clamp-3">{exp.description}</p>}
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Education */}
                          {data?.profile?.education?.length > 0 && (
                            <section>
                              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Education</h3>
                              <div className="space-y-4">
                                {data.profile.education.map((edu, i) => (
                                  <div key={i} className="border-l-2 border-border pl-4">
                                    <h4 className="font-semibold text-sm">{edu.degree} in {edu.fieldOfStudy}</h4>
                                    <p className="text-sm text-primary font-medium">{edu.institution}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {edu.startYear} - {edu.isCurrent ? 'Present' : edu.endYear}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}
                        </div>

                        {/* Skills */}
                        {data?.profile?.skills?.length > 0 && (
                          <section>
                            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {data.profile.skills.map((skill, i) => (
                                <Badge key={i} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </section>
                        )}
                        
                        {/* Links */}
                        {(data?.profile?.linkedinUrl || data?.profile?.portfolioUrl || data?.profile?.codingProfiles?.github) && (
                          <section>
                            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><LinkIcon className="w-4 h-4 text-primary" /> External Links</h3>
                            <div className="flex gap-4">
                              {data.profile.linkedinUrl && (
                                <a href={data.profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                  LinkedIn <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {data.profile.portfolioUrl && (
                                <a href={data.profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                                  Portfolio <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {data.profile.codingProfiles?.github && (
                                <a href={data.profile.codingProfiles.github} target="_blank" rel="noreferrer" className="text-sm text-gray-800 dark:text-gray-200 hover:underline flex items-center gap-1">
                                  GitHub <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </section>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'resume' && (
                  <div className="h-[600px] w-full rounded-xl overflow-hidden border border-border bg-muted/20">
                    {data?.resume?.fileUrl ? (
                      <iframe 
                        src={`${data.resume.fileUrl}#toolbar=0`} 
                        className="w-full h-full"
                        title="Resume Document"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <FileText className="w-12 h-12 mb-4 opacity-50" />
                        <p>No resume PDF found.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
