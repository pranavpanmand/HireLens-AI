import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Briefcase, Menu, X, User, LogIn, LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, signOut, hasRole } = useAuth();
  const { data: profile } = useProfile();
  
  const { scrollY } = useScroll();
  const navBackground = useTransform(
    scrollY,
    [0, 50],
    ["hsl(var(--background) / 0)", "hsl(var(--card) / 0.85)"]
  );
  
  const navBlur = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(16px)"]
  );

  const borderOpacity = useTransform(
    scrollY,
    [0, 50],
    [0, 1]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    ...(user && hasRole("student") ? [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/jobs", label: "Browse Jobs" },
      { href: "/saved-jobs", label: "Saved Jobs" }
    ] : []),
    ...(user && hasRole("recruiter") ? [{ href: "/recruiter", label: "Recruiter Dashboard" }] : [])
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      <motion.nav 
        style={{ backgroundColor: navBackground, backdropFilter: navBlur }}
        className="w-full max-w-6xl rounded-full border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] pointer-events-auto transition-all duration-300 relative group/nav"
      >
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          {/* Animated Gradient Border */}
          <motion.div 
            style={{ opacity: borderOpacity }}
            className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" 
          />
          
          {/* Subtle Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-700" />
        </div>

        <div className="px-6 relative">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-soft group-hover:shadow-card transition-shadow relative overflow-hidden">
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                <Briefcase className="w-4 h-4 text-primary-foreground relative z-10" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                JobMatch<span className="text-secondary">AI</span>
              </span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {navLinks.map((link) =>
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-all duration-300 relative group py-2 px-4 rounded-full ${
              isActive(link.href) ?
              "text-primary bg-primary/10 shadow-sm" :
              "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.div 
                  layoutId="navbar-indicator"
                  className="absolute inset-0 rounded-full border border-primary/20 bg-primary/5 -z-10"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
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
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm overflow-hidden">
                    {profile?.profilePhotoUrl ? (
                      <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()
                    )}
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
                      <Link to="/profile" className="px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition">Settings</Link>
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
            <div className="pl-2 ml-2 border-l border-border hidden md:block">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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
    </motion.nav>
    </div>
  );
};