import { AlertTriangle, Copy, Database, HardDrive } from "lucide-react";
import { useEffect, useState } from "react";

import CorrelationHeatmap from "../components/charts/CorrelationHeatmap";
import KpiCard from "../components/dashboard/KpiCard";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { useDataset } from "../context/DatasetContext";
import { getCorrelation, getNullHeatmap, profileDataset } from "../services/datasetService";
import { ProfileResponse } from "../types";

export default function Profiling() {
  const { activeDataset } = useDataset();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [correlation, setCorrelation] = useState<{ columns: string[]; matrix: (number | null)[][] } | null>(null);
  const [nullHeatmap, setNullHeatmap] = useState<{ columns: string[]; matrix: number[][] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeDataset) return;
    setLoading(true);
    Promise.all([
      profileDataset(activeDataset.id),
      getCorrelation(activeDataset.id),
      getNullHeatmap(activeDataset.id),
    ])
      .then(([p, c, n]) => {
        setProfile(p);
        setCorrelation(c);
        setNullHeatmap(n);
      })
      .finally(() => setLoading(false));
  }, [activeDataset]);

  if (!activeDataset) return <p className="text-slate-400">Select or upload a dataset first.</p>;
  if (loading || !profile) return <Spinner className="mx-auto mt-20" size={32} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Data Profiling</h1>
        <p className="text-slate-400 mt-1">Deep statistical profile of {activeDataset.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Quality Score" value={`${profile.quality_score}`} icon={Database} accent="brand" hint="out of 100" />
        <KpiCard label="Missing Cells" value={`${profile.missing_pct}%`} icon={AlertTriangle} accent="amber" hint={`${profile.missing_cells} cells`} />
        <KpiCard label="Duplicate Rows" value={profile.duplicate_rows} icon={Copy} accent="rose" />
        <KpiCard label="Memory Usage" value={`${profile.memory_usage_mb} MB`} icon={HardDrive} accent="accent" />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Column Profile</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 pr-4">Column</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Missing</th>
                <th className="py-2 pr-4">Unique</th>
                <th className="py-2 pr-4">Mean</th>
                <th className="py-2 pr-4">Std</th>
                <th className="py-2 pr-4">Min / Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {profile.columns.map((col) => (
                <tr key={col.name}>
                  <td className="py-2.5 pr-4 font-medium text-slate-700 dark:text-slate-200">{col.name}</td>
                  <td className="py-2.5 pr-4">
                    <Badge variant={col.inferred_type === "numeric" ? "brand" : col.inferred_type === "datetime" ? "success" : "default"}>
                      {col.inferred_type}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500">
                    {col.missing_count} ({col.missing_pct}%)
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500">{col.unique_count}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{col.mean !== null && col.mean !== undefined ? col.mean.toFixed(2) : "—"}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{col.std !== null && col.std !== undefined ? col.std.toFixed(2) : "—"}</td>
                  <td className="py-2.5 pr-4 text-slate-500">
                    {col.min !== null && col.min !== undefined ? `${col.min.toFixed(1)} / ${col.max?.toFixed(1)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Correlation Matrix</h2>
          {correlation && <CorrelationHeatmap columns={correlation.columns} matrix={correlation.matrix} />}
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Null Value Heatmap</h2>
          <p className="text-xs text-slate-400 mb-3">First 200 rows — red indicates a missing value</p>
          {nullHeatmap && (
            <div className="overflow-x-auto">
              <div className="flex gap-px">
                {nullHeatmap.columns.map((col, colIdx) => (
                  <div key={col} className="flex flex-col gap-px" title={col}>
                    {nullHeatmap.matrix.map((row, rowIdx) => (
                      <div
                        key={rowIdx}
                        className="w-2 h-2"
                        style={{ backgroundColor: row[colIdx] ? "#F43F5E" : "#10B98133" }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
