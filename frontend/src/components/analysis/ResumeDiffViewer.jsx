import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResumeDiffViewer = ({ resumeText, matchedSkills, missingSkills }) => {
  // Pre-process resume text to highlight matched skills
  const highlightedText = useMemo(() => {
    if (!resumeText) return null;
    if (!matchedSkills || matchedSkills.length === 0) return resumeText;

    // Create a safe regex pattern from matched skills
    // Sort by length descending to match longest phrases first (e.g., "React Native" before "React")
    const sortedSkills = [...matchedSkills].sort((a, b) => b.length - a.length);
    const escapedSkills = sortedSkills.map(skill => skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Create regex matching whole words (case insensitive)
    const regex = new RegExp(`\\b(${escapedSkills.join('|')})\\b`, 'gi');

    // Split text and inject markup
    const parts = resumeText.split(regex);
    
    return parts.map((part, index) => {
      // Check if this part matches one of our skills
      const isMatch = sortedSkills.some(skill => skill.toLowerCase() === part?.toLowerCase());
      
      if (isMatch) {
        return (
          <mark key={index} className="bg-emerald-100 text-emerald-900 px-1 rounded-sm font-medium border border-emerald-200">
            {part}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, [resumeText, matchedSkills]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-[400px]">
      
      {/* Sidebar: Missing Skills */}
      <div className="lg:col-span-1 bg-muted/30 rounded-xl p-5 border border-border flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <h3 className="font-semibold text-foreground">Missing Keywords</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          These job requirements were not found in your resume. Consider adding them if you possess the skills.
        </p>
        
        <div className="flex flex-wrap gap-2 overflow-y-auto">
          {missingSkills?.length > 0 ? (
            missingSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200">
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-emerald-600 font-medium">You have all the required skills!</p>
          )}
        </div>
        
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-foreground">Matched Keywords</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            The highlighted terms in your resume exactly match the job requirements.
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {matchedSkills?.slice(0, 5).map(skill => (
              <span key={skill} className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{skill}</span>
            ))}
            {matchedSkills?.length > 5 && <span className="text-xs text-muted-foreground px-1">+{matchedSkills.length - 5} more</span>}
          </div>
        </div>
      </div>
      
      {/* Main Content: Highlighted Resume */}
      <div className="lg:col-span-3 flex flex-col h-full bg-background rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Resume Text Analysis</h3>
        </div>
        
        <div className="p-6 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90 h-[500px]">
          {highlightedText || <span className="text-muted-foreground italic">No resume text available for this match.</span>}
        </div>
      </div>
      
    </div>
  );
};
