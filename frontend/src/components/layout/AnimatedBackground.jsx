import React from "react";

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background">
      {/* 
        Pure CSS animated gradients instead of heavy Framer Motion JS particles.
        This provides a rich, vibrant look without dropping frames or lagging the browser. 
      */}
      <div className="css-animated-blob css-animated-blob-1" />
      <div className="css-animated-blob css-animated-blob-2" />
      <div className="css-animated-blob css-animated-blob-3" />
      
      {/* Optional CSS animated grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
  );
};
