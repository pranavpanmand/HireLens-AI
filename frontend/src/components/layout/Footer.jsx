import { Link } from "react-router-dom";
import { Briefcase, Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl">
                JobMatch<span className="text-secondary">AI</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm">
              Your AI-powered career consultant. Find the perfect job match with intelligent resume analysis.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">For Students</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/jobs" className="hover:text-primary-foreground transition-colors">Browse Jobs</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/resume" className="hover:text-primary-foreground transition-colors">Resume Analysis</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">For Recruiters</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/post-job" className="hover:text-primary-foreground transition-colors">Post a Job</Link></li>
              <li><Link to="/applicants" className="hover:text-primary-foreground transition-colors">View Applicants</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © 2024 JobMatchAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>);

};