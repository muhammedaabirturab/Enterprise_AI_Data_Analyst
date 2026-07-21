import { motion } from "framer-motion";
import { Building2, Database, LogOut, Mail, Moon, Palette, Sun, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "../components/ui/Logo";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { useDataset } from "../context/DatasetContext";
import { useTheme } from "../context/ThemeContext";
import { deleteDataset, listDatasets } from "../services/datasetService";
import { Dataset } from "../types";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeDataset, setActiveDataset } = useDataset();
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refresh = () => listDatasets().then(setDatasets).catch(() => setDatasets([])).finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this dataset? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteDataset(id);
      if (activeDataset?.id === id) setActiveDataset(null);
      await refresh();
    } finally {
      setDeletingId(null);
    }
  };

  const totalRows = datasets.reduce((sum, d) => sum + d.n_rows, 0);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your profile, appearance, and datasets.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h2 className="text-sm font-semibold mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
          <UserIcon size={16} className="text-brand-600 dark:text-brand-400" /> Profile
        </h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-xl font-semibold shrink-0">
            {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{user?.full_name}</p>
            <p className="text-sm text-slate-400">{user?.company || "No company set"}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow icon={Mail} label="Email" value={user?.email ?? "—"} />
          <InfoRow icon={Building2} label="Company" value={user?.company || "Not provided"} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
        <h2 className="text-sm font-semibold mb-5 flex items-center gap-2 text-slate-800 dark:text-white">
          <Palette size={16} className="text-brand-600 dark:text-brand-400" /> Appearance
        </h2>
        <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/5 px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</p>
            <p className="text-xs text-slate-400">Choose how Veridian looks on this device.</p>
          </div>
          <button onClick={toggleTheme} className="btn-secondary text-xs">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
            <Database size={16} className="text-brand-600 dark:text-brand-400" /> Your Datasets
          </h2>
          <p className="text-xs text-slate-400">
            {datasets.length} dataset{datasets.length === 1 ? "" : "s"} · {totalRows.toLocaleString()} total rows
          </p>
        </div>

        {loading ? (
          <Spinner className="mx-auto my-6" />
        ) : datasets.length === 0 ? (
          <p className="text-sm text-slate-400">No datasets uploaded yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {datasets.map((ds) => (
              <li
                key={ds.id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-colors ${
                  activeDataset?.id === ds.id
                    ? "border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-500/5"
                    : "border-slate-100 dark:border-white/5"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ds.name}</p>
                  <p className="text-xs text-slate-400">
                    {ds.n_rows.toLocaleString()} rows · {ds.n_columns} columns · {ds.file_type.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(ds.id)}
                  disabled={deletingId === ds.id}
                  className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors disabled:opacity-40"
                >
                  {deletingId === ds.id ? <Spinner size={15} /> : <Trash2 size={15} />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo showText={false} size={28} />
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Veridian v1.0.0</p>
            <p className="text-xs text-slate-400">AI-powered business intelligence platform</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="btn-danger-ghost text-xs"
        >
          <LogOut size={14} /> Sign out
        </button>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/5 px-4 py-3">
      <Icon size={15} className="text-slate-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}
