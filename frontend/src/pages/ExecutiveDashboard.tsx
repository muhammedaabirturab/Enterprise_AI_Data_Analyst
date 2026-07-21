import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Copy,
  Database,
  Hash,
  HardDrive,
  Rows3,
  ShieldCheck,
  Sparkles,
  Type,
  UploadCloud,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import KpiCard from "../components/dashboard/KpiCard";
import Spinner from "../components/ui/Spinner";
import { useDataset } from "../context/DatasetContext";
import { getAIInsights } from "../services/aiService";
import { profileDataset } from "../services/datasetService";
import { AIReport, ProfileResponse } from "../types";

export default function ExecutiveDashboard() {
  const { activeDataset } = useDataset();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [insights, setInsights] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeDataset) return;
    setLoading(true);
    Promise.all([profileDataset(activeDataset.id), getAIInsights(activeDataset.id)])
      .then(([p, ai]) => {
        setProfile(p);
        setInsights(ai);
      })
      .finally(() => setLoading(false));
  }, [activeDataset]);

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24">
        <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 p-5 text-white shadow-elevated mb-6">
          <UploadCloud size={36} />
        </div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Welcome to Veridian</h1>
        <p className="text-slate-400 mt-2 max-w-md">
          Upload a dataset to unlock your executive dashboard, AI insights, and machine learning tools.
        </p>
        <Link to="/upload" className="btn-primary mt-6">
          <UploadCloud size={16} /> Upload a Dataset
        </Link>
      </div>
    );
  }

  if (loading || !profile) return <Spinner className="mx-auto mt-20" size={32} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Executive Dashboard</h1>
        <p className="text-slate-400 mt-1">Live health snapshot of {activeDataset.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Rows" value={profile.n_rows.toLocaleString()} icon={Rows3} accent="brand" delay={0} />
        <KpiCard label="Columns" value={profile.n_columns} icon={Hash} accent="brand" delay={0.05} />
        <KpiCard label="Quality Score" value={`${profile.quality_score}/100`} icon={ShieldCheck} accent="accent" delay={0.1} />
        <KpiCard label="Missing Data" value={`${profile.missing_pct}%`} icon={AlertTriangle} accent="amber" delay={0.15} />
        <KpiCard label="Duplicate Rows" value={profile.duplicate_rows} icon={Copy} accent="rose" delay={0.2} />
        <KpiCard label="Memory Usage" value={`${profile.memory_usage_mb} MB`} icon={HardDrive} accent="brand" delay={0.25} />
        <KpiCard label="Numeric Columns" value={profile.numeric_columns} icon={BarChart3} accent="accent" delay={0.3} />
        <KpiCard label="Categorical Columns" value={profile.categorical_columns} icon={Type} accent="amber" delay={0.35} />
      </div>

      {insights && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-slate-800 dark:text-white">
            <Sparkles size={18} className="text-brand-600" /> Executive Summary
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {insights.executive_summary_ai_enhanced || insights.executive_summary}
          </p>
          <Link to="/insights" className="text-sm font-semibold text-brand-600 hover:underline mt-3 inline-block">
            View full AI insights →
          </Link>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <QuickLink to="/preview" icon={Database} title="Explore Data" desc="Browse, search, and sort raw records" />
        <QuickLink to="/cleaning" icon={ShieldCheck} title="Clean Data" desc="Fix missing values and duplicates" />
        <QuickLink to="/ml" icon={Sparkles} title="Run ML Models" desc="Get predictions and feature insights" />
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="card p-5 hover:shadow-elevated transition-shadow flex items-start gap-3">
      <div className="rounded-xl bg-brand-50 dark:bg-brand-900/30 p-2.5 text-brand-600">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-semibold text-slate-800 dark:text-white">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{desc}</p>
      </div>
    </Link>
  );
}
