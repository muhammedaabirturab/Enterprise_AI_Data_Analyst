import {
  BarChart3,
  Brain,
  Database,
  FileText,
  LayoutDashboard,
  MessageSquare,
  SprayCan,
  Table2,
  UploadCloud,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import Logo from "../ui/Logo";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload Data", icon: UploadCloud },
  { to: "/preview", label: "Data Preview", icon: Table2 },
  { to: "/profiling", label: "Data Profiling", icon: Database },
  { to: "/cleaning", label: "Data Cleaning", icon: SprayCan },
  { to: "/charts", label: "Charts", icon: BarChart3 },
  { to: "/ml", label: "Machine Learning", icon: Brain },
  { to: "/insights", label: "AI Insights", icon: MessageSquare },
  { to: "/reports", label: "Reports & Export", icon: FileText },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-darkcard h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-600 text-white shadow-elevated"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400">
        Veridian v1.0 — AI Business Intelligence
      </div>
    </aside>
  );
}
