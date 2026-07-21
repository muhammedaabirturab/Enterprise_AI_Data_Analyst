import { motion } from "framer-motion";
import { CheckCircle2, Database, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import UploadDropzone from "../components/upload/UploadDropzone";
import { useDataset } from "../context/DatasetContext";
import { apiErrorMessage } from "../services/api";
import { deleteDataset, listDatasets, replaceDataset, uploadDataset } from "../services/datasetService";
import { Dataset } from "../types";

export default function Upload() {
  const { activeDataset, setActiveDataset } = useDataset();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const refresh = () => listDatasets().then(setDatasets).catch(() => {});

  useEffect(() => {
    refresh();
  }, []);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const dataset = await uploadDataset(file, setProgress);
      setActiveDataset(dataset);
      await refresh();
      navigate("/workspace");
    } catch (err) {
      setError(apiErrorMessage(err, "Upload failed. Please check the file and try again."));
    } finally {
      setUploading(false);
    }
  };

  const handleReplace = async (id: number, file: File) => {
    try {
      const dataset = await replaceDataset(id, file);
      setActiveDataset(dataset);
      await refresh();
      navigate("/workspace");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this dataset permanently? This cannot be undone.")) return;
    await deleteDataset(id);
    if (activeDataset?.id === id) setActiveDataset(null);
    await refresh();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <p className="section-eyebrow">Get started</p>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-1">Upload a dataset</h1>
        <p className="text-slate-400 mt-1">CSV or Excel — Veridian handles the rest.</p>
      </div>

      {error && <div className="rounded-xl bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 text-sm px-4 py-3">{error}</div>}

      <UploadDropzone onFileSelected={handleUpload} uploading={uploading} progress={progress} />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database size={15} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Your Datasets</h2>
        </div>
        {datasets.length === 0 && (
          <p className="text-sm text-slate-400 bg-slate-50 dark:bg-white/5 rounded-xl px-4 py-6 text-center">
            No datasets uploaded yet — your first one will appear here.
          </p>
        )}
        <div className="space-y-2.5">
          {datasets.map((ds, i) => (
            <motion.div
              key={ds.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card card-hover p-4 flex items-center justify-between ${
                activeDataset?.id === ds.id ? "ring-2 ring-brand-500" : ""
              }`}
            >
              <button
                className="flex items-center gap-3 text-left flex-1 min-w-0"
                onClick={() => {
                  setActiveDataset(ds);
                  navigate("/workspace");
                }}
              >
                {activeDataset?.id === ds.id && <CheckCircle2 size={18} className="text-brand-600 dark:text-brand-400 shrink-0" />}
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 dark:text-white truncate">{ds.name}</p>
                  <p className="text-xs text-slate-400">
                    {ds.n_rows.toLocaleString()} rows · {ds.n_columns} columns · {ds.file_type.toUpperCase()}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <label className="btn-secondary cursor-pointer text-xs px-3 py-2">
                  <RefreshCw size={14} /> Replace
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => e.target.files && handleReplace(ds.id, e.target.files[0])}
                  />
                </label>
                <button
                  onClick={() => handleDelete(ds.id)}
                  className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
