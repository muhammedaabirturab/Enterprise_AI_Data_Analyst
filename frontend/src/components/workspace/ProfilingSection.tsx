import Badge from "../ui/Badge";
import { TableSkeleton } from "../ui/Skeleton";
import CorrelationHeatmap from "../charts/CorrelationHeatmap";
import { ProfileResponse } from "../../types";

interface Props {
  profile: ProfileResponse | null;
  correlation: { columns: string[]; matrix: (number | null)[][] } | null;
  nullHeatmap: { columns: string[]; matrix: number[][] } | null;
  loading: boolean;
}

export default function ProfilingSection({ profile, correlation, nullHeatmap, loading }: Props) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-white">Column Profile</h3>
        <div className="overflow-x-auto">
          {loading || !profile ? (
            <TableSkeleton rows={6} cols={7} />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-white/5">
                  <th className="py-2 pr-4 font-medium">Column</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Missing</th>
                  <th className="py-2 pr-4 font-medium">Unique</th>
                  <th className="py-2 pr-4 font-medium">Mean</th>
                  <th className="py-2 pr-4 font-medium">Std</th>
                  <th className="py-2 pr-4 font-medium">Min / Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {profile.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-slate-700 dark:text-slate-200">{col.name}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={col.inferred_type === "numeric" ? "brand" : col.inferred_type === "datetime" ? "accent" : "default"}>
                        {col.inferred_type}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {col.missing_count} ({col.missing_pct}%)
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500">{col.unique_count}</td>
                    <td className="py-2.5 pr-4 text-slate-500 tabular-nums">{col.mean !== null && col.mean !== undefined ? col.mean.toFixed(2) : "—"}</td>
                    <td className="py-2.5 pr-4 text-slate-500 tabular-nums">{col.std !== null && col.std !== undefined ? col.std.toFixed(2) : "—"}</td>
                    <td className="py-2.5 pr-4 text-slate-500 tabular-nums">
                      {col.min !== null && col.min !== undefined ? `${col.min.toFixed(1)} / ${col.max?.toFixed(1)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-white">Correlation Matrix</h3>
          {correlation ? <CorrelationHeatmap columns={correlation.columns} matrix={correlation.matrix} /> : <TableSkeleton rows={5} cols={5} />}
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-1 text-slate-800 dark:text-white">Null Value Heatmap</h3>
          <p className="text-xs text-slate-400 mb-3">First 200 rows — highlighted cells are missing</p>
          {nullHeatmap ? (
            <div className="overflow-x-auto">
              <div className="flex gap-px">
                {nullHeatmap.columns.map((col, colIdx) => (
                  <div key={col} className="flex flex-col gap-px" title={col}>
                    {nullHeatmap.matrix.map((row, rowIdx) => (
                      <div
                        key={rowIdx}
                        className="w-2 h-2 rounded-[1px]"
                        style={{ backgroundColor: row[colIdx] ? "#F43F5E" : "#06B6D41a" }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <TableSkeleton rows={5} cols={5} />
          )}
        </div>
      </div>
    </div>
  );
}
