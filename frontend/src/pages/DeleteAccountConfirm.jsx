import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, Check, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/services/api";
import { toast } from "react-toastify";
import { Reveal } from "@/components/ui/Reveal";

export default function DeleteAccountConfirm() {
  const { user, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [confirmationText, setConfirmationText] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch deletion stats
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['deletion-stats'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/auth/deletion-stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  const stats = statsData?.data || {};

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/auth/account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to delete account');
      return res.json();
    },
    onSuccess: async () => {
      await signOut();
      navigate('/account-deleted');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete account");
      setIsDeleting(false);
    }
  });

  const handleDelete = () => {
    if (!understood || confirmationText !== "DELETE") return;
    
    // Final native confirmation
    if (window.confirm("Are you absolutely sure you want to PERMANENTLY delete your account? This action CANNOT be undone.")) {
      setIsDeleting(true);
      deleteAccountMutation.mutate();
    }
  };

  const isConfirmed = understood && confirmationText === "DELETE";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <Reveal width="100%" className="w-full max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>

          <div className="bg-card border-2 border-red-500/20 rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="bg-red-50 dark:bg-red-950/30 p-8 border-b border-red-200 dark:border-red-900/50 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-display font-bold text-red-700 dark:text-red-400 mb-2">
                Delete Your Account
              </h1>
              <p className="text-red-600 dark:text-red-300 font-medium max-w-md">
                This is a permanent action. All your data will be immediately and irrevocably destroyed.
              </p>
            </div>

            <div className="p-8 space-y-8">
              {/* What will be deleted */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4">What will be permanently deleted:</h3>
                
                {isLoadingStats ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading your data footprint...
                  </div>
                ) : (
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 min-w-4 text-red-500">•</div>
                      <div>
                        <span className="font-semibold text-foreground">Your Profile Information:</span>
                        <span className="text-muted-foreground ml-1">Personal details, education, skills, and experience.</span>
                      </div>
                    </li>
                    {hasRole("student") && (
                      <>
                        <li className="flex items-start gap-3">
                          <div className="mt-1 min-w-4 text-red-500">•</div>
                          <div>
                            <span className="font-semibold text-foreground">Resumes & Files:</span>
                            <span className="text-muted-foreground ml-1">{stats.resumes || 0} uploaded resumes and video resumes.</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="mt-1 min-w-4 text-red-500">•</div>
                          <div>
                            <span className="font-semibold text-foreground">Mock Interviews:</span>
                            <span className="text-muted-foreground ml-1">{stats.interviews || 0} recorded sessions and performance history.</span>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="mt-1 min-w-4 text-red-500">•</div>
                          <div>
                            <span className="font-semibold text-foreground">Applications & Match Data:</span>
                            <span className="text-muted-foreground ml-1">{stats.applications || 0} job applications and all match analyses.</span>
                          </div>
                        </li>
                      </>
                    )}
                    {hasRole("recruiter") && (
                      <li className="flex items-start gap-3">
                        <div className="mt-1 min-w-4 text-amber-500">•</div>
                        <div>
                          <span className="font-semibold text-foreground">Job Postings:</span>
                          <span className="text-muted-foreground ml-1">{stats.jobs || 0} active/inactive jobs will be archived (not hard-deleted, to preserve applicant data).</span>
                        </div>
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Confirmation Steps */}
              <div className="bg-muted/50 p-6 rounded-xl space-y-6 border border-border">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${understood ? 'bg-red-600 border-red-600' : 'border-input group-hover:border-foreground'}`}>
                    {understood && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={understood} 
                    onChange={(e) => setUnderstood(e.target.checked)} 
                  />
                  <span className="font-medium text-foreground">
                    I understand that this action is permanent and cannot be undone.
                  </span>
                </label>

                <div className="space-y-2">
                  <label htmlFor="confirm-text" className="text-sm font-medium text-foreground block">
                    To verify, type <span className="font-bold text-foreground bg-muted px-1.5 py-0.5 rounded select-all">DELETE</span> below:
                  </label>
                  <Input
                    id="confirm-text"
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="DELETE"
                    className="max-w-xs font-mono tracking-widest text-center uppercase"
                  />
                </div>
              </div>

              {/* Final Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="sm:flex-1 h-12"
                  onClick={() => navigate('/profile')}
                  disabled={isDeleting}
                >
                  Cancel and Keep My Account
                </Button>
                <Button 
                  variant="destructive" 
                  className="sm:flex-1 h-12 font-bold"
                  disabled={!isConfirmed || isDeleting}
                  onClick={handleDelete}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Permanently Delete My Account"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
