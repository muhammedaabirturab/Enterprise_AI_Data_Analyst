import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw, Trash2 } from "lucide-react";
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
      navigate("/preview");
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Upload Data</h1>
        <p className="text-slate-400 mt-1">Upload a CSV or Excel file to begin your analysis.</p>
      </div>

      {error && <div className="rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 text-sm px-4 py-3">{error}</div>}

      <UploadDropzone onFileSelected={handleUpload} uploading={uploading} progress={progress} />

      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Your Datasets</h2>
        {datasets.length === 0 && <p className="text-sm text-slate-400">No datasets uploaded yet.</p>}
        <div className="space-y-3">
          {datasets.map((ds, i) => (
            <motion.div
              key={ds.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card p-4 flex items-center justify-between ${
                activeDataset?.id === ds.id ? "ring-2 ring-brand-500" : ""
              }`}
            >
              <button className="flex items-center gap-3 text-left flex-1" onClick={() => setActiveDataset(ds)}>
                {activeDataset?.id === ds.id && <CheckCircle2 size={18} className="text-brand-600 shrink-0" />}
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">{ds.name}</p>
                  <p className="text-xs text-slate-400">
                    {ds.n_rows.toLocaleString()} rows · {ds.n_columns} columns · {ds.file_type.toUpperCase()}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <label className="btn-secondary cursor-pointer text-xs px-3 py-2">
                  <RefreshCw size={14} /> Replace
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => e.target.files && handleReplace(ds.id, e.target.files[0])}
                  />
                </label>
                <button onClick={() => handleDelete(ds.id)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30">
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
