import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Target, TrendingUp, Users, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useAuth } from "@/contexts/AuthContext";

export const HeroSection = () => {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-secondary/20 blur-3xl" />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left: Text Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-primary-foreground">AI-Powered Career Matching</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Find Your Perfect
              <br />
              <motion.span 
                animate={{ 
                  backgroundImage: [
                    "linear-gradient(to right, #2b9d80, #e5b124)",
                    "linear-gradient(to right, #e5b124, #2b9d80)",
                    "linear-gradient(to right, #2b9d80, #e5b124)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="text-transparent bg-clip-text"
              >
                Career Match
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-xl mx-auto lg:mx-0">
              Upload your resume, browse real jobs, and let AI analyze your match score. 
              Get personalized insights to land your dream role today.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start relative z-20"
            >
              <MagneticButton 
                to={user ? "/jobs" : "/register"}
                className="relative px-8 py-4 bg-gradient-primary text-primary-foreground rounded-full font-bold transition-all flex items-center justify-center gap-2 group"
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-primary opacity-50 blur-md pointer-events-none"
                  animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </MagneticButton>
              
              <MagneticButton 
                to={user ? "/profile" : "/login"}
                className="px-8 py-4 bg-secondary/10 text-secondary border border-secondary/30 rounded-full font-bold hover:bg-secondary hover:text-secondary-foreground transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-secondary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none" />
                <span className="relative z-10 flex items-center gap-2">
                  <FileSearch className="w-5 h-5" />
                  Upload Resume
                </span>
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center lg:justify-start gap-8 mt-12">
              {[
              { value: "95%", label: "Match Accuracy" },
              { value: "50K+", label: "Students" },
              { value: "10K+", label: "Live Jobs" }].
              map((stat, i) =>
                <div key={i}>
                  <div className="font-display text-2xl font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/60">{stat.label}</div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Hero Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ y }}
            className="w-full lg:w-1/2 relative mt-8 lg:mt-0 perspective-1000"
          >
            <motion.div 
              animate={{ 
                rotateX: [0, 5, 0, -5, 0],
                rotateY: [0, -5, 0, 5, 0],
                y: [0, -10, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video lg:aspect-square max-h-[500px]"
            >
              <img 
                src="/hero_image.jpg" 
                alt="AI Career Platform" 
                className="w-full h-full object-cover scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              
              {/* Floating Element 1 */}
              <motion.div 
                animate={{ y: [0, -15, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 -left-4 bg-background/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl flex items-center gap-3 hidden md:flex"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Match Score</p>
                  <p className="font-bold text-foreground">94% Fit</p>
                </div>
              </motion.div>

              {/* Floating Element 2 */}
              <motion.div 
                animate={{ y: [0, 15, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-8 -right-4 bg-background/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl flex items-center gap-3 hidden md:flex"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resume ATS</p>
                  <p className="font-bold text-foreground">Optimized</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};