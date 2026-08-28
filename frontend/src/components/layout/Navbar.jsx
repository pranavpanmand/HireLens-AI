import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Briefcase, Menu, X, User, LogIn, LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, signOut, hasRole } = useAuth();

  const navLinks = [
  { href: "/jobs", label: "Find Jobs" },
  ...(user && hasRole("student") ? [
    { href: "/resume-analyzer", label: "Resume Analyzer" },
    { href: "/saved-jobs", label: "Saved Jobs" }
  ] : []),
  ...(user && hasRole("recruiter") ? [{ href: "/recruiter", label: "Recruiter Dashboard" }] : [])];


  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft group-hover:shadow-card transition-shadow">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              JobMatch<span className="text-secondary">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors relative ${
              isActive(link.href) ?
              "text-primary" :
              "text-muted-foreground hover:text-foreground"}`
              }>
              
                {link.label}
                {isActive(link.href) &&
              <motion.div
                layoutId="activeNav"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-primary rounded-full" />

              }
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ?
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" /> :
            user ?
            <div className="relative group">
                <button className="flex items-center gap-2 hover:bg-muted/50 p-1.5 rounded-full transition">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-background rounded-xl shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 flex flex-col z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="font-medium text-foreground truncate">{user.fullName || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {hasRole("student") && (
                    <>
                      <Link to="/profile" className="px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition">View Profile</Link>
                      <Link to="/dashboard" className="px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition">Dashboard</Link>
                      <Link to="/applications" className="px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition">My Applications</Link>
                      <Link to="/profile#resume" className="px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition">My Resume</Link>
                    </>
                  )}
                  {hasRole("recruiter") && (
                    <Link to="/recruiter" className="px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition">Recruiter Dashboard</Link>
                  )}
                  <button onClick={handleSignOut} className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition text-left mt-1 border-t border-border">
                    Sign Out
                  </button>
                </div>
              </div> :

            <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity" asChild>
                  <Link to="/register" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Get Started
                  </Link>
                </Button>
              </>
            }
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}>
            
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background border-b border-border overflow-hidden">
          
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) =>
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-sm font-medium py-2 ${
              isActive(link.href) ?
              "text-primary" :
              "text-muted-foreground"}`
              }>
              
                  {link.label}
                </Link>
            )}
            {user && hasRole("student") && (
              <Link to="/saved-jobs" onClick={() => setIsOpen(false)} className="text-sm font-medium text-muted-foreground py-2">
                Saved Jobs
              </Link>
            )}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ?
              <>
                    <p className="text-sm text-muted-foreground py-2">{user.email}</p>
                    <Button variant="outline" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </> :

              <>
                    <Button variant="outline" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button className="bg-gradient-primary" asChild>
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
              }
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </nav>);

};