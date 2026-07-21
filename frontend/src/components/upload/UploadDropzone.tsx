import { motion } from "framer-motion";
import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { DragEvent, useRef, useState } from "react";

import ProgressBar from "../ui/ProgressBar";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  uploading: boolean;
  progress: number;
}

const ACCEPTED = [".csv", ".xlsx", ".xls"];

export default function UploadDropzone({ onFileSelected, uploading, progress }: UploadDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const file = files[0];
    const isValid = ACCEPTED.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isValid) {
      alert(`Unsupported file type. Please upload one of: ${ACCEPTED.join(", ")}`);
      return;
    }
    setSelectedName(file.name);
    onFileSelected(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`card cursor-pointer border-2 border-dashed p-14 text-center transition-all duration-300 bg-mesh-light dark:bg-mesh-dark ${
        dragOver ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/5 scale-[1.01]" : "border-slate-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-700"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-brand-gradient p-4 text-white shadow-elevated">
          {selectedName ? <FileSpreadsheet size={30} /> : <UploadCloud size={30} className={dragOver ? "" : "animate-float"} />}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-800 dark:text-white">
            {selectedName || "Drag & drop your dataset here"}
          </p>
          <p className="text-sm text-slate-400 mt-1.5">or click to browse</p>
        </div>
        <div className="flex items-center gap-2">
          {["CSV", "XLSX", "XLS"].map((ext) => (
            <span key={ext} className="text-[11px] font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
              {ext}
            </span>
          ))}
          <span className="text-[11px] text-slate-400">· max 50MB</span>
        </div>
        {uploading && (
          <div className="w-full max-w-xs">
            <ProgressBar value={progress} />
            <p className="text-xs text-slate-400 mt-2">{progress}% uploaded</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
