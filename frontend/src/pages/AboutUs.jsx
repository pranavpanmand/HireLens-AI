import { motion } from "framer-motion";
import { Users, Target, Shield, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const AboutUs = () => {
  const stats = [
    { label: "Active Users", value: "50K+" },
    { label: "Jobs Matched", value: "100K+" },
    { label: "Success Rate", value: "94%" },
    { label: "Partner Companies", value: "500+" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              Revolutionizing the <span className="text-primary">Job Search</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              At HireLens, we believe finding the perfect career shouldn't be a shot in the dark. We use advanced AI to match your unique skills with opportunities where you'll thrive.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Values Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We started HireLens with a simple goal: to eliminate the friction between talented professionals and the companies that need them. Traditional job boards rely on outdated keyword matching, leading to frustration on both sides. 
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By leveraging large language models and semantic matching, we analyze not just what's on your resume, but the trajectory of your career, your soft skills, and your potential.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                { icon: Users, title: "Candidate First", desc: "Your career goals drive our algorithms." },
                { icon: Target, title: "Precision", desc: "No more spray-and-pray applications." },
                { icon: Shield, title: "Privacy", desc: "Your data is secured and never sold." },
                { icon: Zap, title: "Efficiency", desc: "Automating the tedious parts of searching." }
              ].map((val, i) => (
                <div key={i} className="bg-card border border-border p-6 rounded-2xl hover:shadow-md transition-all">
                  <val.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-bold text-foreground mb-2">{val.title}</h3>
                  <p className="text-sm text-muted-foreground">{val.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
