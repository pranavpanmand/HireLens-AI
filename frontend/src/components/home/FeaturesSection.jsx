import { motion } from "framer-motion";
import { FileSearch, Brain, BookOpen, Rocket, Building2, Users } from "lucide-react";

const features = [
{
  icon: FileSearch,
  title: "Smart Resume Parsing",
  description: "Upload your PDF resume and our AI extracts skills, experience, and qualifications automatically."
},
{
  icon: Brain,
  title: "AI Match Analysis",
  description: "Get a detailed match score showing exactly how your profile aligns with each job description."
},
{
  icon: BookOpen,
  title: "Learning Recommendations",
  description: "Discover what skills you're missing and get personalized learning paths to improve."
},
{
  icon: Rocket,
  title: "Live Job Feed",
  description: "Access thousands of real-time job openings from top companies and job boards."
},
{
  icon: Building2,
  title: "Company Insights",
  description: "Learn about company culture, salary ranges, and growth opportunities before applying."
},
{
  icon: Users,
  title: "Recruiter Connection",
  description: "Let recruiters find you based on your skills and match score for their openings."
}];


export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-secondary uppercase tracking-wider">
            
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            
            Your AI Career Consultant
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground">
            
            More than just job listings—we analyze, recommend, and guide you toward your ideal career path.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) =>
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-card transition-all duration-300">
            
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-5 shadow-soft group-hover:shadow-card transition-shadow">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

};