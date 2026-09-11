import { motion } from "framer-motion";
import { ArrowRight, Bot, Mic, Clock, BarChart, FileText, LayoutDashboard, BrainCircuit, Target, Video, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background overflow-hidden relative border-t border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* HOW IT WORKS SECTION */}
        <div className="mb-32">
          <div className="mb-12">
            <h2 className="text-xs font-bold text-primary tracking-widest uppercase mb-3">HOW IT WORKS</h2>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">A simpler career workflow</h3>
            <p className="text-muted-foreground text-lg">Focus on practice, feedback, and consistent improvement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Upload & Match",
                desc: "Upload your resume and get instantly matched to thousands of live jobs.",
                icon: FileText
              },
              {
                step: "02",
                title: "Practice with AI",
                desc: "Answer technical and HR interview questions tailored to the role.",
                icon: Mic
              },
              {
                step: "03",
                title: "Improve every session",
                desc: "Review feedback and track your progress to land the job.",
                icon: Clock
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-8 hover:shadow-md transition-all hover:border-primary/30 group"
              >
                <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center mb-10 group-hover:bg-primary/5 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-2">STEP {item.step}</div>
                <h4 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h4>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* PLATFORM FEATURES SECTION */}
        <div className="mb-32">
          <div className="mb-12">
            <h2 className="text-xs font-bold text-primary tracking-widest uppercase mb-3">PLATFORM FEATURES</h2>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Built for focused career growth</h3>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Mock interviews, AI evaluation, smart resume parsing, and tailored cover letters — designed to help you prepare with clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "AI Match Analysis",
                desc: "Instantly see how your resume aligns with job requirements.",
                icon: BarChart
              },
              {
                title: "Smart Resume Parsing",
                desc: "Optimize your resume for ATS systems to avoid auto-rejection.",
                icon: FileText
              },
              {
                title: "Tailored Cover Letters",
                desc: "Generate highly personalized cover letters in one click.",
                icon: LayoutDashboard
              },
              {
                title: "Resume-based questions",
                desc: "Questions generated directly from your skills and projects.",
                icon: BrainCircuit
              },
              {
                title: "Session tracking",
                desc: "Track interview history and improvement trends over time.",
                icon: Clock
              },
              {
                title: "Communication insights",
                desc: "Improve speaking confidence and delivery with audio feedback.",
                icon: Mic
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-sm transition-all flex items-start gap-5"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-muted/50 border border-border flex items-center justify-center mt-1">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-foreground mb-1">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* INTERVIEW MODES SECTION */}
        <div>
          <div className="mb-12">
            <h2 className="text-xs font-bold text-primary tracking-widest uppercase mb-3">INTERVIEW MODES</h2>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Practice for different rounds</h3>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Switch between interview styles and improve specific parts of your preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "HR interview mode",
                desc: "Behavioral and recruiter-style interview preparation.",
                icon: Target
              },
              {
                title: "Technical interview mode",
                desc: "Role-focused technical interview preparation.",
                icon: Video
              },
              {
                title: "Confidence insights",
                desc: "Improve speaking and communication quality.",
                icon: Sparkles
              },
              {
                title: "Flexible credits",
                desc: "Simple usage-based interview sessions.",
                icon: ShieldCheck
              }
            ].map((mode, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-sm hover:border-primary/30 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                    <mode.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-bold text-foreground mb-0.5">{mode.title}</h4>
                    <p className="text-muted-foreground text-sm">{mode.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-4" />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};