import { motion } from "framer-motion";
import { ArrowUpRight, Rows3, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import KpiCard from "../components/dashboard/KpiCard";
import { KpiCardSkeleton, Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useDataset } from "../context/DatasetContext";
import { getAIInsights } from "../services/aiService";
import { listDatasets, profileDataset } from "../services/datasetService";
import { AIReport, Dataset, ProfileResponse } from "../types";

export default function ExecutiveDashboard() {
  const { user } = useAuth();
  const { activeDataset } = useDataset();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [insights, setInsights] = useState<AIReport | null>(null);
  const [datasetCount, setDatasetCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listDatasets().then((ds: Dataset[]) => setDatasetCount(ds.length)).catch(() => setDatasetCount(0));
  }, []);

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

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  if (!activeDataset) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <p className="section-eyebrow">{greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}</p>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-2">
          Let's turn your data into decisions.
        </h1>
        <p className="text-slate-400 mt-2 max-w-lg">
          {datasetCount ? `You have ${datasetCount} dataset${datasetCount === 1 ? "" : "s"} ready to explore.` : "Upload your first dataset to get started."}
        </p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 card p-10 text-center bg-mesh-light dark:bg-mesh-dark">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-elevated mx-auto mb-5 animate-float">
            <UploadCloud size={28} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Upload a dataset to begin</h2>
          <p className="text-sm text-slate-400 mt-1.5 max-w-sm mx-auto">
            CSV or Excel — Veridian will automatically profile, clean, visualize, and explain it for you.
          </p>
          <Link to="/upload" className="btn-primary mt-6">
            <UploadCloud size={16} /> Upload a Dataset
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="section-eyebrow">{greeting}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}</p>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-1">{activeDataset.name}</h1>
        </div>
        <Link to="/workspace" className="btn-primary">
          Open Workspace <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading || !profile ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard label="Rows" value={profile.n_rows.toLocaleString()} icon={Rows3} accent="brand" />
            <KpiCard
              label="Quality Score"
              value={`${profile.quality_score}/100`}
              icon={ShieldCheck}
              accent={profile.quality_score >= 85 ? "success" : profile.quality_score >= 60 ? "warning" : "danger"}
            />
            <KpiCard label="Missing Data" value={`${profile.missing_pct}%`} icon={ShieldCheck} accent="warning" />
            <KpiCard label="Datasets" value={datasetCount ?? "—"} icon={Rows3} accent="accent" />
          </>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand-gradient opacity-[0.06] blur-2xl" />
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-slate-800 dark:text-white">
          <Sparkles size={17} className="text-brand-600 dark:text-brand-400" /> AI Executive Summary
        </h3>
        {insights ? (
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 max-w-3xl">
            {insights.executive_summary_ai_enhanced || insights.executive_summary}
          </p>
        ) : (
          <div className="space-y-2 max-w-3xl">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        <Link to="/workspace#insights" className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-4 inline-flex items-center gap-1">
          View full analysis <ArrowUpRight size={14} />
        </Link>
      </motion.div>
    </div>
  );
}
