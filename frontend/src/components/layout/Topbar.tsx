import { LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useDataset } from "../../context/DatasetContext";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { activeDataset } = useDataset();
  const navigate = useNavigate();

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-surface-darkcard/80 backdrop-blur">
      <div>
        {activeDataset ? (
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeDataset.name}</p>
            <p className="text-xs text-slate-400">
              {activeDataset.n_rows.toLocaleString()} rows · {activeDataset.n_columns} columns
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No dataset selected</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
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
          className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
