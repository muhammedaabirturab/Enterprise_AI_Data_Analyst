import { motion } from "framer-motion";
import { AlertTriangle, BarChart3, Copy, Hash, HardDrive, Rows3, ShieldCheck, Sparkles, Type } from "lucide-react";

import { AIReport, ProfileResponse } from "../../types";
import { KpiCardSkeleton, Skeleton } from "../ui/Skeleton";
import KpiCard from "../dashboard/KpiCard";

interface Props {
  profile: ProfileResponse | null;
  insights: AIReport | null;
  loading: boolean;
}

export default function OverviewSection({ profile, insights, loading }: Props) {
  if (loading || !profile) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const qualityAccent = profile.quality_score >= 85 ? "success" : profile.quality_score >= 60 ? "warning" : "danger";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Rows" value={profile.n_rows.toLocaleString()} icon={Rows3} accent="brand" delay={0} />
        <KpiCard label="Columns" value={profile.n_columns} icon={Hash} accent="accent" delay={0.04} />
        <KpiCard label="Quality Score" value={`${profile.quality_score}/100`} icon={ShieldCheck} accent={qualityAccent} delay={0.08} />
        <KpiCard label="Missing Data" value={`${profile.missing_pct}%`} icon={AlertTriangle} accent="warning" delay={0.12} />
        <KpiCard label="Duplicate Rows" value={profile.duplicate_rows} icon={Copy} accent="danger" delay={0.16} />
        <KpiCard label="Memory Usage" value={`${profile.memory_usage_mb} MB`} icon={HardDrive} accent="brand" delay={0.2} />
        <KpiCard label="Numeric Columns" value={profile.numeric_columns} icon={BarChart3} accent="accent" delay={0.24} />
        <KpiCard label="Categorical Columns" value={profile.categorical_columns} icon={Type} accent="success" delay={0.28} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="card p-6 relative overflow-hidden"
      >
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
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
