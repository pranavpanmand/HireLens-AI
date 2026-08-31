import { motion } from "framer-motion";
import { FileSearch, Brain, BookOpen, Rocket, Building2 } from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { TiltCard } from "@/components/ui/TiltCard";

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-secondary uppercase tracking-wider"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-5xl font-bold text-foreground mt-4 mb-6"
          >
            Your AI Career Consultant
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            More than just job listings—we analyze, recommend, and guide you toward your ideal career path.
          </motion.p>
        </div>

        {/* Featured Top Row (2 Large Cards with Images) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-3xl bg-card border border-border shadow-sm transition-all duration-300 min-h-[400px]"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80" 
                alt="Resume Analysis" 
                className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
            </div>
            <div className="relative z-10 p-10 h-full flex flex-col justify-end">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <FileSearch className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-3xl font-bold text-foreground mb-4">Smart Resume Parsing</h3>
              <p className="text-muted-foreground text-lg max-w-md">
                Upload your PDF resume and our AI extracts your skills, experience, and qualifications instantly. 
                We optimize it for ATS systems so you never get auto-rejected.
              </p>
            </div>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_100%,_rgba(43,157,128,0.15),_transparent_60%)] pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl bg-card border border-border shadow-sm transition-all duration-300 min-h-[400px]"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" 
                alt="AI Analysis" 
                className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
            </div>
            <div className="relative z-10 p-10 h-full flex flex-col justify-end">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Brain className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="font-display text-3xl font-bold text-foreground mb-4">AI Match Analysis</h3>
              <p className="text-muted-foreground text-lg max-w-md">
                Don't guess if you're a fit. Get a detailed match score showing exactly how your profile aligns 
                with each job description before you apply.
              </p>
            </div>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_100%,_rgba(229,177,36,0.15),_transparent_60%)] pointer-events-none" />
          </motion.div>
        </div>

        {/* Secondary Bottom Row (3 Smaller Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: "Learning Paths",
              description: "Discover what skills you're missing and get personalized learning recommendations.",
              color: "text-blue-500",
              bg: "bg-blue-500/10"
            },
            {
              icon: Rocket,
              title: "Live Job Feed",
              description: "Access thousands of real-time job openings from top companies across the globe.",
              color: "text-purple-500",
              bg: "bg-purple-500/10"
            },
            {
              icon: Building2,
              title: "Company Insights",
              description: "Learn about company culture, salary ranges, and growth opportunities upfront.",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10"
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + (i * 0.1) }}
            >
              <TiltCard className="h-full">
                <SpotlightCard className="h-full group">
                  <div className="p-8 h-full flex flex-col relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </SpotlightCard>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};