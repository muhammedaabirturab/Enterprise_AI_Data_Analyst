import { motion } from "framer-motion";
import { LucideIcon, Minus, TrendingDown, TrendingUp } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "brand" | "accent" | "success" | "warning" | "danger";
  hint?: string;
  trend?: "up" | "down" | "flat";
  delay?: number;
}

const ACCENTS: Record<string, { bg: string; text: string; ring: string }> = {
  brand: { bg: "bg-brand-50 dark:bg-brand-500/10", text: "text-brand-600 dark:text-brand-400", ring: "group-hover:ring-brand-200 dark:group-hover:ring-brand-800" },
  accent: { bg: "bg-accent-50 dark:bg-accent-500/10", text: "text-accent-600 dark:text-accent-400", ring: "group-hover:ring-accent-200 dark:group-hover:ring-accent-800" },
  success: { bg: "bg-success-50 dark:bg-success-500/10", text: "text-success-600 dark:text-success-400", ring: "group-hover:ring-success-200 dark:group-hover:ring-success-800" },
  warning: { bg: "bg-warning-50 dark:bg-warning-500/10", text: "text-warning-600 dark:text-warning-400", ring: "group-hover:ring-warning-200 dark:group-hover:ring-warning-800" },
  danger: { bg: "bg-danger-50 dark:bg-danger-500/10", text: "text-danger-600 dark:text-danger-400", ring: "group-hover:ring-danger-200 dark:group-hover:ring-danger-800" },
};

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };

export default function KpiCard({ label, value, icon: Icon, accent = "brand", hint, trend, delay = 0 }: KpiCardProps) {
  const colors = ACCENTS[accent];
  const TrendIcon = trend ? TREND_ICON[trend] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group card card-hover ring-1 ring-transparent p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <div className={`rounded-xl p-2 ${colors.bg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={16} className={colors.text} />
        </div>
      </div>
      <div>
        <p className="text-[28px] leading-none font-display font-bold text-slate-900 dark:text-white tabular-nums">{value}</p>
        {(hint || trend) && (
          <div className="mt-2 flex items-center gap-1.5">
            {TrendIcon && (
              <TrendIcon
                size={13}
                className={trend === "up" ? "text-success-500" : trend === "down" ? "text-danger-500" : "text-slate-400"}
              />
            )}
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
