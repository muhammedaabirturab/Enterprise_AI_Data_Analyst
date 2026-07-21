import { motion } from "framer-motion";
import { FileJson, FileSpreadsheet, FileText, Table } from "lucide-react";
import { useState } from "react";

import { exportCsv, exportExcel, exportJson, exportPdf } from "../../services/reportService";
import Spinner from "../ui/Spinner";

const OPTIONS = [
  {
    key: "pdf",
    label: "PDF Report",
    description: "Full branded report with executive summary, charts, and recommendations.",
    icon: FileText,
    action: exportPdf,
    accent: "from-danger-500 to-danger-600",
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
    accent: "from-success-500 to-success-600",
  },
  {
    key: "json",
    label: "JSON Export",
    description: "Structured JSON records for downstream systems.",
    icon: FileJson,
    action: exportJson,
    accent: "from-warning-500 to-warning-600",
  },
];

export default function ReportsSection({ datasetId, name }: { datasetId: number; name: string }) {
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const handle = async (key: string, action: (id: number, name: string) => Promise<void>) => {
    setBusyKey(key);
    try {
      await action(datasetId, name);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
      {OPTIONS.map((opt, i) => (
        <motion.div
          key={opt.key}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="card card-hover p-6 flex flex-col"
        >
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${opt.accent} flex items-center justify-center text-white mb-4 shadow-sm`}>
            <opt.icon size={20} />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{opt.label}</h3>
          <p className="text-xs text-slate-400 mt-1.5 flex-1 leading-relaxed">{opt.description}</p>
          <button onClick={() => handle(opt.key, opt.action)} disabled={busyKey === opt.key} className="btn-secondary mt-4 text-xs">
            {busyKey === opt.key ? <Spinner size={14} /> : <opt.icon size={14} />}
            Download
          </button>
        </motion.div>
      ))}
    </div>
  );
}
