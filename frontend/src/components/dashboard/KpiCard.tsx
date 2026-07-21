import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "brand" | "accent" | "amber" | "rose";
  hint?: string;
  delay?: number;
}

const ACCENTS: Record<string, { bg: string; text: string }> = {
  brand: { bg: "bg-brand-50 dark:bg-brand-900/30", text: "text-brand-600 dark:text-brand-400" },
  accent: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-accent-600 dark:text-accent-400" },
  amber: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
  rose: { bg: "bg-rose-50 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400" },
};

export default function KpiCard({ label, value, icon: Icon, accent = "brand", hint, delay = 0 }: KpiCardProps) {
  const colors = ACCENTS[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="card p-5 flex items-start justify-between hover:shadow-elevated transition-shadow"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-display font-bold text-slate-900 dark:text-white">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      <div className={`rounded-xl p-2.5 ${colors.bg}`}>
        <Icon size={20} className={colors.text} />
      </div>
    </motion.div>
  );
}
