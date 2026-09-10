import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

export const AppLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onMenuClick={() => setIsMobileOpen(true)} />
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="flex-1 lg:pl-64 pt-20 transition-all duration-300">
        {children || <Outlet />}
      </div>
    </div>
  );
};
