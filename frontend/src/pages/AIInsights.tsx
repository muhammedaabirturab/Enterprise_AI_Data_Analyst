import { AlertTriangle, Lightbulb, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import Spinner from "../components/ui/Spinner";
import { useDataset } from "../context/DatasetContext";
import { getAIInsights } from "../services/aiService";
import { AIReport } from "../types";

export default function AIInsights() {
  const { activeDataset } = useDataset();
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeDataset) return;
    setLoading(true);
    getAIInsights(activeDataset.id)
      .then(setReport)
      .finally(() => setLoading(false));
  }, [activeDataset]);

  if (!activeDataset) return <p className="text-slate-400">Select or upload a dataset first.</p>;
  if (loading || !report) return <Spinner className="mx-auto mt-20" size={32} />;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-brand-600" /> AI Insights
        </h1>
        <p className="text-slate-400 mt-1">Automatically generated analysis for {activeDataset.name}</p>
      </div>

      <Section title="Executive Summary" icon={TrendingUp}>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {report.executive_summary_ai_enhanced || report.executive_summary}
        </p>
      </Section>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Dataset Summary">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{report.dataset_summary}</p>
        </Section>
        <Section title="Business Summary">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{report.business_summary}</p>
        </Section>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Section title="Recommendations" icon={Lightbulb} accent="accent">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
            {report.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Section>
        <Section title="Potential Problems" icon={AlertTriangle} accent="amber">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
            {report.potential_problems.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Section>
        <Section title="Opportunities" icon={Sparkles} accent="brand">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
            {report.opportunities.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Risk Analysis" icon={ShieldAlert} accent="rose">
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc pl-4">
          {report.risk_analysis.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Section>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Correlation Explanation">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
            {report.correlation_explanation}
          </p>
        </Section>
        <Section title="Outlier Explanation">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
            {report.outlier_explanation}
          </p>
        </Section>
      </div>

      <Section title="Data Quality Report">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{report.data_quality_report.summary}</p>
        {report.data_quality_report.flagged_columns.length > 0 && (
          <ul className="space-y-1 text-sm text-slate-500">
            {report.data_quality_report.flagged_columns.map((c, i) => (
              <li key={i}>
                <span className="font-medium text-slate-700 dark:text-slate-200">{c.column}</span>: {c.detail}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  accent = "brand",
  children,
}: {
  title: string;
  icon?: any;
  accent?: "brand" | "accent" | "amber" | "rose";
  children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    brand: "text-brand-600",
    accent: "text-accent-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-slate-800 dark:text-white">
        {Icon && <Icon size={18} className={colors[accent]} />} {title}
      </h2>
      {children}
    </div>
  );
}
