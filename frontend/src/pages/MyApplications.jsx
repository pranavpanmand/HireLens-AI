import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Clock, MapPin, DollarSign, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { API_URL } from "@/services/api";

export default function MyApplications() {
  const navigate = useNavigate();
  const { data: response, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/applications/my`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch applications');
      return res.json();
    }
  });

  const applications = response?.data || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shortlisted': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Shortlisted</Badge>;
      case 'interview_scheduled': return <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100">Interview Scheduled</Badge>;
      case 'offered': return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Offered 🎉</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'reviewed': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Reviewed</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Applied</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-5xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Applications</h1>
              <p className="text-muted-foreground">Track the status of your internal job applications</p>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium">
              {applications.length} Applications
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
              <p className="text-muted-foreground text-lg mb-4">You haven't applied to any internal jobs yet.</p>
              <Button asChild>
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={app._id} 
                  className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Building2 className="w-7 h-7 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link to={`/jobs/${app.jobId?._id}`}>
                          <h3 className="font-semibold text-xl hover:text-primary transition-colors">{app.jobId?.title}</h3>
                        </Link>
                        <p className="text-muted-foreground">{app.jobId?.company}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(app.status)}
                        <p className="text-xs text-muted-foreground mt-2">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {app.jobId?.location}</span>
                      {app.jobId?.salaryRange && (
                        <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {app.jobId.salaryRange}</span>
                      )}
                    </div>
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
