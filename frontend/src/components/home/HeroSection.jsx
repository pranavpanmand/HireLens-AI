import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const HeroSection = () => {
  const { user } = useAuth();
  
  return (
    <section className="relative min-h-screen flex items-center bg-background overflow-hidden pt-20 pb-16">
      
      {/* Background radial gradient (very subtle) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
        <div className="w-[1200px] h-[800px] bg-primary/5 rounded-full blur-[120px] -mt-40 opacity-70 dark:opacity-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left: Text Content */}
          <div className="w-full text-center lg:text-left flex flex-col items-center lg:items-start">
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border mb-8 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                AI-powered career acceleration
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-[4rem] lg:leading-[1.1] font-bold text-foreground mb-6 tracking-tight"
            >
              Practice smarter, land your dream job faster.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed"
            >
              Upload your resume, find perfectly matched jobs, and practice technical and HR interviews with AI-powered feedback.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button 
                asChild
                size="lg"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium px-8 h-12 shadow-md hover:shadow-lg transition-all"
              >
                <Link to={user ? "/interview" : "/register"} className="flex items-center gap-2">
                  Start interview <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-border bg-background hover:bg-muted text-foreground font-medium px-8 h-12 shadow-sm transition-all"
              >
                <Link to={user ? "/jobs" : "/login"}>
                  View jobs
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right: Mockup Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full relative lg:pl-10"
          >
            {/* Main Window Frame */}
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden w-full max-w-[500px] mx-auto lg:ml-auto">
              {/* Window Header */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              
              {/* Window Body (Chat) */}
              <div className="p-6 flex flex-col gap-6 bg-background">
                
                {/* AI Bubble */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-sm p-4 w-full max-w-[90%]"
                >
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">HIRELENS AI</p>
                  <p className="text-sm text-foreground">Explain useEffect in React.</p>
                </motion.div>

                {/* User Bubble */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-4 w-full max-w-[90%] self-end shadow-md"
                >
                  <p className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest mb-2">YOUR RESPONSE</p>
                  <p className="text-sm">useEffect handles side effects like API calls and DOM updates.</p>
                </motion.div>

                {/* AI Feedback Bubble */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 }}
                  className="bg-card border border-border rounded-2xl p-4 w-full shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center justify-between"
                >
                  <div>
                    <p className="text-[10px] font-bold text-[#00A99D] uppercase tracking-widest mb-1.5">AI FEEDBACK</p>
                    <p className="text-sm text-muted-foreground">Clear and concise explanation</p>
                  </div>
                  <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
                    Strong
                  </div>
                </motion.div>
                
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};