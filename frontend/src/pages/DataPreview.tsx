import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";

import Spinner from "../components/ui/Spinner";
import { useDataset } from "../context/DatasetContext";
import { previewDataset } from "../services/datasetService";
import { PreviewResponse } from "../types";

export default function DataPreview() {
  const { activeDataset } = useDataset();
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const pageSize = 25;

  useEffect(() => {
    if (!activeDataset) return;
    setLoading(true);
    previewDataset(activeDataset.id, { page, page_size: pageSize, search, sort_by: sortBy, sort_dir: sortDir })
      .then(setData)
      .finally(() => setLoading(false));
  }, [activeDataset, page, search, sortBy, sortDir]);

  if (!activeDataset) {
    return <EmptyState />;
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total_rows / pageSize)) : 1;

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Data Preview</h1>
          <p className="text-slate-400 mt-1">{data?.total_rows.toLocaleString() ?? 0} rows total</p>
        </div>
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search all columns..."
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
              <tr>
                {data?.columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => toggleSort(col)}
                    className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none whitespace-nowrap hover:text-brand-600"
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      <ArrowUpDown size={12} className={sortBy === col ? "text-brand-600" : "text-slate-300"} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={data?.columns.length || 1} className="text-center py-10">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              ) : (
                data?.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary px-2.5 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary px-2.5 py-1.5 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <p className="text-slate-500 dark:text-slate-400">Select or upload a dataset first.</p>
    </div>
  );
}
