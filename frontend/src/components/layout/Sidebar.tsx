import { motion } from "framer-motion";
import { LayoutDashboard, Settings, Sparkles, UploadCloud } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import Logo from "../ui/Logo";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload", icon: UploadCloud },
  { to: "/workspace", label: "Workspace", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-slate-200/70 dark:border-white/5 bg-white/80 dark:bg-surface-darkcard/80 backdrop-blur-xl h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200/70 dark:border-white/5">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className="group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-3 ${
                  isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                }`}
              >
                <Icon size={18} />
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 mx-3 mb-4 rounded-2xl bg-brand-gradient-soft border border-brand-100 dark:border-brand-500/20">
        <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
          <Sparkles size={13} /> Veridian v1.0
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          AI-powered business intelligence, from raw file to boardroom insight.
        </p>
      </div>
    </aside>
  );
}
