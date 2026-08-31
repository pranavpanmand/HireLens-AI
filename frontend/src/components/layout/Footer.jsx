import { Link } from "react-router-dom";
import { Briefcase, Github, Twitter, Linkedin, Heart, Mail } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

export const Footer = () => {
  return (
    <footer className="relative bg-background border-t border-border overflow-hidden pt-20 pb-10">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="md:col-span-12 lg:col-span-5">
            <Link to="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Briefcase className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-2xl text-foreground">
                JobMatch<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-base max-w-sm mb-8 leading-relaxed">
              Your AI-powered career consultant. Find the perfect job match with intelligent resume analysis and dynamic market insights.
            </p>
            
            <div className="flex items-center max-w-md bg-card border border-border rounded-full p-1 shadow-sm">
              <div className="pl-4 pr-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                placeholder="Subscribe to our newsletter" 
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-4 lg:col-span-2 lg:col-start-7">
            <h4 className="font-display font-bold text-foreground mb-6">For Students</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/jobs" className="hover:text-primary transition-colors flex items-center gap-2 group"><span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300"></span>Browse Jobs</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2 group"><span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300"></span>Dashboard</Link></li>
              <li><Link to="/resume-analyzer" className="hover:text-primary transition-colors flex items-center gap-2 group"><span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300"></span>Resume Analysis</Link></li>
              <li><Link to="/saved-jobs" className="hover:text-primary transition-colors flex items-center gap-2 group"><span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300"></span>Saved Jobs</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-display font-bold text-foreground mb-6">For Recruiters</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/recruiter" className="hover:text-primary transition-colors flex items-center gap-2 group"><span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300"></span>Recruiter Dashboard</Link></li>
              <li><Link to="/post-job" className="hover:text-primary transition-colors flex items-center gap-2 group"><span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300"></span>Post a Job</Link></li>
              <li><Link to="/applicants" className="hover:text-primary transition-colors flex items-center gap-2 group"><span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300"></span>View Applicants</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-display font-bold text-foreground mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors flex items-center gap-2 group"><span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300"></span>About Us</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors flex items-center gap-2 group"><span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300"></span>Contact</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors flex items-center gap-2 group"><span className="w-0 h-[1px] bg-primary group-hover:w-3 transition-all duration-300"></span>Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © {new Date().getFullYear()} JobMatchAI. Made with <Heart className="w-4 h-4 text-red-500 mx-1" fill="currentColor" /> by our team.
          </p>
          
          <div className="flex items-center gap-4">
            <MagneticButton className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Twitter className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Github className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Linkedin className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>
      </div>
    </footer>
  );
};