import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { previewDataset } from "../../services/datasetService";
import { PreviewResponse } from "../../types";
import { TableSkeleton } from "../ui/Skeleton";

export default function PreviewSection({ datasetId }: { datasetId: number }) {
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    setLoading(true);
    previewDataset(datasetId, { page, page_size: pageSize, search, sort_by: sortBy, sort_dir: sortDir })
      .then(setData)
      .finally(() => setLoading(false));
  }, [datasetId, page, search, sortBy, sortDir]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total_rows / pageSize)) : 1;

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 flex-wrap gap-3">
        <p className="text-sm text-slate-400">{data?.total_rows.toLocaleString() ?? 0} rows total</p>
        <div className="relative w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search all columns..."
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[420px]">
        {loading ? (
          <TableSkeleton rows={8} cols={data?.columns.length ?? 6} />
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 dark:bg-white/5 z-10">
              <tr>
                {data?.columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => toggleSort(col)}
                    className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none whitespace-nowrap hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      <ArrowUpDown size={12} className={sortBy === col ? "text-brand-600" : "text-slate-300 dark:text-slate-600"} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data?.rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  {data.columns.map((col) => (
                    <td key={col} className="px-4 py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {row[col] === null || row[col] === undefined ? (
                        <span className="text-slate-300 dark:text-slate-600 italic">null</span>
                      ) : (
                        String(row[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-white/5">
        <p className="text-xs text-slate-400">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary px-2.5 py-1.5 disabled:opacity-40">
            <ChevronLeft size={14} />
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary px-2.5 py-1.5 disabled:opacity-40">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
