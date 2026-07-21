import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

import { AIReport, ProfileResponse } from "../../types";
import { Skeleton } from "../ui/Skeleton";

interface Props {
  profile: ProfileResponse | null;
  insights: AIReport | null;
}

function scoreColor(score: number) {
  if (score >= 85) return { ring: "#10B981", text: "text-success-600 dark:text-success-400", label: "Excellent" };
  if (score >= 60) return { ring: "#F59E0B", text: "text-warning-600 dark:text-warning-400", label: "Needs attention" };
  return { ring: "#F43F5E", text: "text-danger-600 dark:text-danger-400", label: "Poor" };
}

export default function QualitySection({ profile, insights }: Props) {
  if (!profile) {
    return (
      <div className="card p-6">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const { ring, text, label } = scoreColor(profile.quality_score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (profile.quality_score / 100) * circumference;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="card p-6 flex flex-col items-center justify-center text-center">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-white/5" />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-display font-bold text-slate-900 dark:text-white tabular-nums">{profile.quality_score}</p>
            <p className="text-[11px] text-slate-400">out of 100</p>
          </div>
        </div>
        <p className={`mt-4 text-sm font-semibold ${text}`}>{label}</p>
        <p className="text-xs text-slate-400 mt-1">{profile.missing_pct}% missing · {profile.duplicate_rows} duplicate rows</p>
      </div>

      <div className="card p-6 lg:col-span-2">
        <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-white">Flagged Columns</h3>
        {insights?.data_quality_report.flagged_columns.length ? (
          <ul className="space-y-2.5">
            {insights.data_quality_report.flagged_columns.map((c, i) => (
              <li key={i} className="flex items-center justify-between text-sm rounded-xl bg-warning-50 dark:bg-warning-500/10 px-4 py-2.5">
                <span className="font-medium text-slate-700 dark:text-slate-200">{c.column}</span>
                <span className="text-warning-600 dark:text-warning-400 text-xs font-medium">{c.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No columns flagged — missingness is well within healthy limits.</p>
        )}

        <h3 className="text-sm font-semibold mt-6 mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
          <ShieldAlert size={16} className="text-danger-500" /> Risk Analysis
        </h3>
        {insights ? (
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
            {insights.risk_analysis.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        ) : (
          <Skeleton className="h-16 w-full" />
        )}
      </div>
    </div>
  );
}
