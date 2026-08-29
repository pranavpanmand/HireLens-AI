import React from 'react';
import { useSkillGapAnalytics } from '@/hooks/useAnalytics';
import { Loader2, AlertCircle, Target, TrendingUp } from 'lucide-react';

export const SkillGapChart = () => {
  const { data: response, isLoading, isError } = useSkillGapAnalytics();
  const skillGaps = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-card rounded-2xl border border-border">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing your skill gaps...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-card rounded-2xl border border-destructive/20 text-destructive">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p>Failed to load analytics</p>
      </div>
    );
  }

  if (skillGaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-card rounded-2xl border border-border">
        <Target className="w-12 h-12 text-emerald-500 mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-foreground mb-2">No Skill Gaps Found</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          You haven't run any match analyses yet, or you possess all the required skills for the jobs you've analyzed!
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...skillGaps.map(s => s.count));

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">Top Skills to Prioritize</h3>
            <p className="text-sm text-muted-foreground">Based on jobs you've analyzed</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {skillGaps.map((item, index) => {
          const percentage = (item.count / maxCount) * 100;
          return (
            <div key={item.skill} className="group">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {item.skill}
                </span>
                <span className="text-muted-foreground font-mono">
                  {item.count} {item.count === 1 ? 'time' : 'times'} missing
                </span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-primary/80 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Analyzed from your Match History</span>
      </div>
    </div>
  );
};
