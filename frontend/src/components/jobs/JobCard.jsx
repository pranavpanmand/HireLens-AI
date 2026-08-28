import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Building2, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";






















import { Link } from "react-router-dom";
import { useSavedJobs, useToggleSaveJob } from "@/hooks/useSavedJobs";
import { useAuth } from "@/contexts/AuthContext";

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
      className="group bg-card rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300 border border-border hover:border-primary/20">
      
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
          {job.logo ?
          <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain" /> :

          <Building2 className="w-7 h-7 text-primary-foreground" />
          }
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/jobs/${job.id || job._id}`}>
                <h3 className="font-display font-semibold text-lg text-foreground hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
              </Link>
              <p className="text-muted-foreground text-sm">{job.company}</p>
            </div>
            <button onClick={handleSaveClick} className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
              <Bookmark className={`w-5 h-5 transition-colors ${isSaved ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`} />
            </button>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            {job.source && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {job.source}
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
            <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            )}
            {job.skills.length > 4 &&
            <Badge variant="outline" className="text-xs">
                +{job.skills.length - 4} more
              </Badge>
            }
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {job.description}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              onClick={() => onAnalyze(job)}
              className="bg-gradient-primary hover:opacity-90 transition-opacity">
              
              Analyze Match
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/jobs/${job.id || job._id}`}>View Details →</Link>
            </Button>
            {job.applyUrl && (
              <Button variant="ghost" asChild>
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  Apply Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>);

};