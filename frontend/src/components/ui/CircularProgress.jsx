import { motion } from "framer-motion";
import { cn } from "@/lib/utils";









export const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 10,
  className,
  showLabel = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - value / 100 * circumference;

  const getScoreColor = (score) => {
    if (score >= 80) return "stroke-score-excellent";
    if (score >= 60) return "stroke-score-good";
    if (score >= 40) return "stroke-score-fair";
    return "stroke-score-poor";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Needs Work";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted" />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(getScoreColor(value))}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference
          }} />
        
      </svg>
      {showLabel &&
      <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
          className="text-3xl font-bold font-display text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}>
          
            {value}%
          </motion.span>
          <motion.span
          className="text-xs text-muted-foreground mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}>
          
            {getScoreLabel(value)}
          </motion.span>
        </div>
      }
    </div>);

};