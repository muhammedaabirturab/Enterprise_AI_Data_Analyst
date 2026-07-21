import { LogOut, Moon, Sparkles, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useDataset } from "../../context/DatasetContext";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { activeDataset } = useDataset();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200/70 dark:border-white/5 glass">
      <div className="flex items-center gap-3">
        {activeDataset ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-soft absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{activeDataset.name}</p>
              <p className="text-xs text-slate-400 leading-tight">
                {activeDataset.n_rows.toLocaleString()} rows · {activeDataset.n_columns} columns
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">No dataset selected</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {activeDataset && location.pathname !== "/workspace" && (
          <button onClick={() => navigate("/workspace")} className="btn-primary hidden sm:inline-flex px-3.5 py-2 text-xs">
            <Sparkles size={14} /> Open Workspace
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-300 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div className="hidden sm:flex items-center gap-2.5 pl-3 ml-1 border-l border-slate-200 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-800 dark:text-slate-100 leading-tight">{user?.full_name}</p>
            <p className="text-xs text-slate-400 leading-tight">{user?.company || user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="p-2.5 rounded-xl text-slate-500 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10 transition-colors"
          aria-label="Log out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
