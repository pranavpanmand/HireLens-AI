import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Building2, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";






















import { Link } from "react-router-dom";
import { useSavedJobs, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { useAuth } from "@/contexts/AuthContext";
import { ShareMenu } from "./ShareMenu";

import { SpotlightCard } from "@/components/ui/SpotlightCard";

import { TiltCard } from "@/components/ui/TiltCard";

export const JobCard = ({ job, onAnalyze, index = 0 }) => {
  const { user } = useAuth();
  const { data: savedJobs } = useSavedJobs();
  const toggleSaveJob = useToggleSaveJob();
  
  const isSaved = savedJobs?.some(sj => sj._id === job.id || sj._id === job._id);

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return; // Optionally prompt to login
    const jobId = job.id || job._id;
    if (jobId) {
      await toggleSaveJob(jobId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <TiltCard>
        <SpotlightCard className="group p-6 h-full flex flex-col">
          <div className="flex flex-col gap-4 relative z-10 h-full">
            <div className="flex items-start justify-between gap-3 w-full">
              {/* Company Logo */}
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
                {job.logo ? (
                  <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain" />
                ) : (
                  <Building2 className="w-7 h-7 text-primary-foreground" />
                )}
              </div>

              {/* Title & Save */}
              <div className="flex-1 min-w-0 pr-2">
                <Link to={`/jobs/${job.id || job._id}`}>
                  <h3 className="font-display font-semibold text-lg text-foreground hover:text-primary transition-colors line-clamp-2">
                    {job.title}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm truncate">{job.company}</p>
              </div>

              <div className="flex items-center">
                <div className="relative z-[20] -mt-2 -mr-1">
                  <ShareMenu job={job} />
                </div>
                <button onClick={handleSaveClick} className="p-2 -mr-2 -mt-2 rounded-lg hover:bg-muted/50 backdrop-blur-sm transition-colors flex-shrink-0 relative z-[20]">
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      animate={{ scale: isSaved ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Bookmark className={`w-5 h-5 transition-colors ${isSaved ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`} />
                    </motion.div>
                  </button>
              </div>
            </div>

            {/* Job Info Details */}
            <div className="flex-1 flex flex-col min-w-0 mt-2">

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                {job.source && (
                  job.source === 'internal' ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-semibold text-[11px]">
                      ✦ Direct Apply
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[11px]">
                      {job.source}
                    </Badge>
                  )
                )}
                {job.match_score >= 80 && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-transparent font-bold">
                    ✨ Great Match — Apply Now
                  </Badge>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  {job.salary}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {job.posted}
                </span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {job.skills.slice(0, 4).map((skill) =>
                <Badge key={skill} variant="secondary" className="text-xs bg-secondary/10 hover:bg-secondary/20 border-transparent">
                    {skill}
                  </Badge>
                )}
                {job.skills.length > 4 &&
                <Badge variant="outline" className="text-xs backdrop-blur-sm">
                    +{job.skills.length - 4} more
                  </Badge>
                }
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {job.description}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 relative z-[30] pointer-events-auto">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAnalyze(job);
                  }}
                  className="w-full sm:flex-1 min-h-[44px] bg-gradient-primary hover:opacity-90 transition-opacity whitespace-nowrap">
                  Analyze
                </Button>
                <Button variant="outline" className="w-full sm:flex-1 min-h-[44px] bg-background/50 backdrop-blur-sm hover:bg-background/80" asChild>
                  <Link to={`/jobs/${job.id || job._id}`} onClick={(e) => e.stopPropagation()}>View →</Link>
                </Button>
                {job.applyUrl && (
                  <Button 
                    variant={job.match_score >= 80 ? "default" : "ghost"} 
                    className={`w-full min-h-[44px] ${job.match_score >= 80 ? "bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md transform hover:scale-[1.02] transition-all" : "hover:bg-muted/50 backdrop-blur-sm border border-border"}`}
                    asChild
                  >
                    <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-2">
                      Apply Now
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SpotlightCard>
      </TiltCard>
    </motion.div>);

};