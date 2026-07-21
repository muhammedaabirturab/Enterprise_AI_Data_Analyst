import {
  BarChart3,
  Brain,
  Database,
  FileText,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Table2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import ChatSection from "../components/workspace/ChatSection";
import ChartsSection from "../components/workspace/ChartsSection";
import CleaningSection from "../components/workspace/CleaningSection";
import InsightsSection from "../components/workspace/InsightsSection";
import MLSection from "../components/workspace/MLSection";
import OverviewSection from "../components/workspace/OverviewSection";
import PreviewSection from "../components/workspace/PreviewSection";
import ProfilingSection from "../components/workspace/ProfilingSection";
import QualitySection from "../components/workspace/QualitySection";
import ReportsSection from "../components/workspace/ReportsSection";
import WorkspaceSection from "../components/workspace/WorkspaceSection";
import { useDataset } from "../context/DatasetContext";
import { useWorkspaceData } from "../hooks/useWorkspaceData";

const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "preview", label: "Preview", icon: Table2 },
  { id: "profiling", label: "Profiling", icon: Database },
  { id: "quality", label: "Quality", icon: ShieldCheck },
  { id: "cleaning", label: "Cleaning", icon: SprayCan },
  { id: "charts", label: "Charts", icon: BarChart3 },
  { id: "ml", label: "Machine Learning", icon: Brain },
  { id: "insights", label: "AI Insights", icon: Sparkles },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "chat", label: "Assistant", icon: MessageSquare },
];

export default function Workspace() {
  const { activeDataset } = useDataset();
  const { profile, correlation, nullHeatmap, insights, recommendations, loading, refetchAll } = useWorkspaceData(
    activeDataset?.id
  );
  const [activeSection, setActiveSection] = useState("overview");
  const location = useLocation();

  useEffect(() => {
    if (!activeDataset || !location.hash) return;
    const id = location.hash.replace("#", "");
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDataset, location.hash, loading]);

  useEffect(() => {
    if (!activeDataset) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 }
    );
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [activeDataset]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24">
        <div className="rounded-2xl bg-brand-gradient p-5 text-white shadow-elevated mb-6 animate-float">
          <UploadCloud size={36} />
        </div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">No dataset in the workspace yet</h1>
        <p className="text-slate-400 mt-2 max-w-md">
          Upload a dataset to unlock the full analytics workspace — profiling, cleaning, charts, machine learning,
          and AI insights in one continuous flow.
        </p>
        <Link to="/upload" className="btn-primary mt-6">
          <UploadCloud size={16} /> Upload a Dataset
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-8 items-start">
      <nav className="hidden xl:block w-52 shrink-0 sticky top-24 self-start">
        <p className="section-eyebrow mb-3 px-2">On this page</p>
        <ul className="space-y-0.5">
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === id
                    ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-1 min-w-0 space-y-14 pb-24">
        <div>
          <p className="section-eyebrow">Analytics Workspace</p>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-1">{activeDataset.name}</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Everything about this dataset, in one continuous flow — scroll to explore.
          </p>
        </div>

        <WorkspaceSection id="overview" eyebrow="Start here" title="Executive Overview" icon={LayoutDashboard}>
          <OverviewSection profile={profile} insights={insights} loading={loading} />
        </WorkspaceSection>

        <WorkspaceSection id="preview" eyebrow="Raw data" title="Dataset Preview" icon={Table2} description="Browse, search, and sort your records.">
          <PreviewSection datasetId={activeDataset.id} />
        </WorkspaceSection>

        <WorkspaceSection
          id="profiling"
          eyebrow="Statistics"
          title="Column Profiling & Correlations"
          icon={Database}
          description="Per-column types, missingness, and relationships between numeric fields."
        >
          <ProfilingSection profile={profile} correlation={correlation} nullHeatmap={nullHeatmap} loading={loading} />
        </WorkspaceSection>

        <WorkspaceSection
          id="quality"
          eyebrow="Health check"
          title="Data Quality"
          icon={ShieldCheck}
          description="An overall quality score plus flagged columns and statistical risks."
        >
          <QualitySection profile={profile} insights={insights} />
        </WorkspaceSection>

        <WorkspaceSection
          id="cleaning"
          eyebrow="Prepare"
          title="Cleaning Tools"
          icon={SprayCan}
          description="Fix missing values, duplicates, and types — every step is undoable."
        >
          <CleaningSection datasetId={activeDataset.id} profile={profile} onChanged={refetchAll} />
        </WorkspaceSection>

        <WorkspaceSection id="charts" eyebrow="Visualize" title="Charts" icon={BarChart3} description="Build histograms, scatter plots, and more from the cleaned data.">
          <ChartsSection datasetId={activeDataset.id} profile={profile} />
        </WorkspaceSection>

        <WorkspaceSection
          id="ml"
          eyebrow="Predict"
          title="Machine Learning"
          icon={Brain}
          description="AI-recommended models for regression, classification, clustering, anomalies, and forecasting."
        >
          <MLSection datasetId={activeDataset.id} profile={profile} recommendations={recommendations} />
        </WorkspaceSection>

        <WorkspaceSection
          id="insights"
          eyebrow="Understand"
          title="AI Insights & Recommendations"
          icon={Sparkles}
          description="Automatically generated findings, risks, and opportunities."
        >
          <InsightsSection insights={insights} />
        </WorkspaceSection>

        <WorkspaceSection id="reports" eyebrow="Share" title="Reports & Export" icon={FileText} description="Download a branded PDF report or export the cleaned data.">
          <ReportsSection datasetId={activeDataset.id} name={activeDataset.name} />
        </WorkspaceSection>

        <WorkspaceSection id="chat" eyebrow="Ask" title="Chat Assistant" icon={MessageSquare}>
          <ChatSection />
        </WorkspaceSection>
      </div>
    </div>
  );
}
