import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, User, Video, Target, FileText, Briefcase, 
  Bookmark, Send, ChevronDown, ChevronRight, Mic, 
  FileEdit, Linkedin, MessageSquare, Star 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const { user, hasRole } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({ aiTools: true });

  // Only render for students
  if (!user || !hasRole("student")) return null;

  const isActive = (path) => location.pathname === path;

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuGroups = [
    {
      title: "Main",
      items: [
        { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
        { icon: User, label: "My Profile", href: "/profile" },
        { icon: Video, label: "Video Resume", href: "/video-resume" },
        { icon: Target, label: "Position AI", href: "/position-ai" },
        { icon: FileText, label: "Documents", href: "/documents" },
      ]
    },
    {
      title: "Jobs",
      items: [
        { icon: Briefcase, label: "Job Board", href: "/jobs" },
        { icon: Send, label: "My Applications", href: "/applications" },
        { icon: Bookmark, label: "Saved Jobs", href: "/saved-jobs" },
      ]
    },
    {
      title: "Assessments",
      key: "assessments",
      expandable: true,
      items: [
        { icon: Target, label: "Aptitude Quest", href: "/aptitude-quest" },
        { icon: User, label: "Personality Test", href: "/personality-test" },
      ]
    },
    {
      title: "Community",
      items: [
        { icon: Bookmark, label: "Events", href: "/events" },
      ]
    },
    {
      title: "AI Tools",
      key: "aiTools",
      expandable: true,
      items: [
        { icon: Mic, label: "Mock Interview", href: "/mock-interview" },
        { icon: FileEdit, label: "Resume Analyzer", href: "/resume-analyzer" },
        { icon: FileEdit, label: "Resume Builder", href: "/resume-generator" },
        { icon: FileText, label: "Cover Letter", href: "/cover-letter" },
        { icon: Linkedin, label: "LinkedIn Optimizer", href: "/linkedin-optimizer" },
        { icon: MessageSquare, label: "Networking", href: "/networking" },
        { icon: Star, label: "STAR Stories", href: "/star-stories" },
      ]
    }
  ];

  const SidebarContent = (
    <div className="h-full flex flex-col bg-card border-r border-border overflow-y-auto w-64 shadow-sm custom-scrollbar">
      <div className="p-6">
        <div className="space-y-8">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              {group.expandable ? (
                <button 
                  onClick={() => toggleMenu(group.key)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 hover:text-foreground transition-colors"
                >
                  {group.title}
                  {expandedMenus[group.key] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {group.title}
                </h4>
              )}

              <AnimatePresence>
                {(!group.expandable || expandedMenus[group.key]) && (
                  <motion.ul 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          onClick={() => setIsMobileOpen?.(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                            isActive(item.href)
                              ? "bg-primary/10 text-primary"
                              : "text-foreground/80 hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <item.icon className={`w-4 h-4 ${isActive(item.href) ? "text-primary" : "text-muted-foreground"}`} />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 pt-20 transition-transform">
        {SidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 pt-20 bg-background lg:hidden shadow-2xl border-r border-border"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
