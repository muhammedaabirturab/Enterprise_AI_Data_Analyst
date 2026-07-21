import { AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

import { AIReport } from "../../types";
import { Skeleton } from "../ui/Skeleton";

export default function InsightsSection({ insights }: { insights: AIReport | null }) {
  if (!insights) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-5/6 mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <InsightCard title="Recommendations" icon={Lightbulb} accent="success" items={insights.recommendations} />
        <InsightCard title="Potential Problems" icon={AlertTriangle} accent="warning" items={insights.potential_problems} />
        <InsightCard title="Opportunities" icon={Sparkles} accent="brand" items={insights.opportunities} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-white">Correlation Explanation</h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{insights.correlation_explanation}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-3 text-slate-800 dark:text-white">Outlier Explanation</h3>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{insights.outlier_explanation}</p>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  icon: Icon,
  accent,
  items,
}: {
  title: string;
  icon: any;
  accent: "success" | "warning" | "brand";
  items: string[];
}) {
  const colors = {
    success: "text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-500/10",
    warning: "text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-500/10",
    brand: "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10",
  }[accent];

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
        <span className={`rounded-lg p-1.5 ${colors}`}>
          <Icon size={14} />
        </span>
        {title}
      </h3>
      <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-slate-300 dark:text-slate-600 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
