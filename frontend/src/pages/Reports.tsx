import { motion } from "framer-motion";
import { FileJson, FileSpreadsheet, FileText, Table } from "lucide-react";
import { useState } from "react";

import Spinner from "../components/ui/Spinner";
import { useDataset } from "../context/DatasetContext";
import { exportCsv, exportExcel, exportJson, exportPdf } from "../services/reportService";

const OPTIONS = [
  {
    key: "pdf",
    label: "PDF Report",
    description: "Full branded report — executive summary, charts, tables, and recommendations.",
    icon: FileText,
    action: exportPdf,
    accent: "from-rose-500 to-rose-600",
  },
  {
    key: "csv",
    label: "CSV Export",
    description: "Raw cleaned data in comma-separated format.",
    icon: Table,
    action: exportCsv,
    accent: "from-brand-500 to-brand-600",
  },
  {
    key: "excel",
    label: "Excel Export",
    description: "Cleaned dataset as an .xlsx workbook.",
    icon: FileSpreadsheet,
    action: exportExcel,
    accent: "from-accent-500 to-accent-600",
  },
  {
    key: "json",
    label: "JSON Export",
    description: "Structured JSON records for downstream systems.",
    icon: FileJson,
    action: exportJson,
    accent: "from-amber-500 to-amber-600",
  },
];

export default function Reports() {
  const { activeDataset } = useDataset();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  if (!activeDataset) return <p className="text-slate-400">Select or upload a dataset first.</p>;

  const handle = async (key: string, action: (id: number, name: string) => Promise<void>) => {
    setBusyKey(key);
    try {
      await action(activeDataset.id, activeDataset.name);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Reports &amp; Export</h1>
        <p className="text-slate-400 mt-1">Generate a professional PDF report or export {activeDataset.name} in your preferred format.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {OPTIONS.map((opt, i) => (
          <motion.div
            key={opt.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-6 flex flex-col"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.accent} flex items-center justify-center text-white mb-4`}>
              <opt.icon size={22} />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white">{opt.label}</h3>
            <p className="text-sm text-slate-400 mt-1 flex-1">{opt.description}</p>
            <button onClick={() => handle(opt.key, opt.action)} disabled={busyKey === opt.key} className="btn-primary mt-4">
              {busyKey === opt.key ? <Spinner size={16} className="text-white" /> : <opt.icon size={16} />}
              Download {opt.label}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
