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
      className={`card cursor-pointer border-2 border-dashed p-12 text-center transition-colors ${
        dragOver ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-slate-300 dark:border-slate-700"
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
        <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 p-4 text-white shadow-elevated">
          {selectedName ? <FileSpreadsheet size={32} /> : <UploadCloud size={32} />}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-800 dark:text-white">
            {selectedName || "Drag & drop your dataset here"}
          </p>
          <p className="text-sm text-slate-400 mt-1">or click to browse — CSV, XLSX, or XLS (max 50MB)</p>
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
