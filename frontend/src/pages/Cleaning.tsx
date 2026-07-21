import { History, RotateCcw, SprayCan, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

import Select from "../components/ui/Select";
import Spinner from "../components/ui/Spinner";
import { useDataset } from "../context/DatasetContext";
import { apiErrorMessage } from "../services/api";
import { applyCleaning, getCleaningHistory, resetCleaning, undoCleaning } from "../services/cleaningService";
import { profileDataset } from "../services/datasetService";
import { CleaningStep, ProfileResponse } from "../types";

const OPERATIONS = [
  { value: "drop_rows_with_missing", label: "Drop rows with missing values", needsColumns: true },
  { value: "drop_columns", label: "Drop columns", needsColumns: true },
  { value: "fill_mean", label: "Fill missing with mean", needsColumns: true },
  { value: "fill_median", label: "Fill missing with median", needsColumns: true },
  { value: "fill_mode", label: "Fill missing with mode", needsColumns: true },
  { value: "fill_custom", label: "Fill missing with custom value", needsColumns: true, needsValue: true },
  { value: "drop_duplicates", label: "Remove duplicate rows", needsColumns: false },
  { value: "rename_column", label: "Rename column", needsRename: true },
  { value: "convert_type", label: "Convert column type", needsTypeConvert: true },
  { value: "normalize", label: "Normalize (Min-Max scale)", needsColumns: true },
  { value: "standardize", label: "Standardize (Z-score scale)", needsColumns: true },
  { value: "encode", label: "Encode categorical column", needsColumns: true, needsEncodeMethod: true },
];

export default function Cleaning() {
  const { activeDataset } = useDataset();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [history, setHistory] = useState<CleaningStep[]>([]);
  const [operation, setOperation] = useState(OPERATIONS[0].value);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState("");
  const [oldName, setOldName] = useState("");
  const [newName, setNewName] = useState("");
  const [targetType, setTargetType] = useState("numeric");
  const [encodeMethod, setEncodeMethod] = useState("label");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!activeDataset) return;
    profileDataset(activeDataset.id).then(setProfile);
    getCleaningHistory(activeDataset.id).then(setHistory);
  };

  useEffect(load, [activeDataset]);

  if (!activeDataset) return <p className="text-slate-400">Select or upload a dataset first.</p>;

  const opDef = OPERATIONS.find((o) => o.value === operation)!;
  const columnOptions = profile?.columns.map((c) => ({ value: c.name, label: c.name })) ?? [];

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const params: Record<string, unknown> = {};
      if (opDef.needsColumns) params.columns = selectedColumns;
      if (opDef.needsValue) params.value = customValue;
      if (opDef.needsRename) {
        params.old_name = oldName;
        params.new_name = newName;
      }
      if (opDef.needsTypeConvert) {
        params.column = selectedColumns[0];
        params.target_type = targetType;
      }
      if (opDef.needsEncodeMethod) params.method = encodeMethod;

      const updated = await applyCleaning(activeDataset.id, operation, params);
      setProfile(updated);
      load();
      setSelectedColumns([]);
      setCustomValue("");
      setOldName("");
      setNewName("");
    } catch (err) {
      setError(apiErrorMessage(err, "Cleaning operation failed."));
    } finally {
      setBusy(false);
    }
  };

  const handleUndo = async () => {
    setBusy(true);
    try {
      const updated = await undoCleaning(activeDataset.id);
      setProfile(updated);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all cleaning steps back to the original upload?")) return;
    setBusy(true);
    try {
      const updated = await resetCleaning(activeDataset.id);
      setProfile(updated);
      load();
    } finally {
      setBusy(false);
    }
  };

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Data Cleaning</h1>
          <p className="text-slate-400 mt-1">
            {profile ? `${profile.n_rows.toLocaleString()} rows · ${profile.missing_pct}% missing · quality ${profile.quality_score}/100` : ""}
          </p>
        </div>

        {error && <div className="rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 text-sm px-4 py-3">{error}</div>}

        <div className="card p-6 space-y-4">
          <Select label="Operation" value={operation} onChange={(e) => setOperation(e.target.value)} options={OPERATIONS} />

          {opDef.needsColumns && (
            <div>
              <label className="label-text">Columns</label>
              <div className="flex flex-wrap gap-2">
                {columnOptions.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => toggleColumn(c.value)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedColumns.includes(c.value)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {opDef.needsValue && (
            <div>
              <label className="label-text">Custom fill value</label>
              <input value={customValue} onChange={(e) => setCustomValue(e.target.value)} className="input-field" />
            </div>
          )}

          {opDef.needsRename && (
            <div className="grid grid-cols-2 gap-3">
              <Select label="Column to rename" value={oldName} onChange={(e) => setOldName(e.target.value)} options={columnOptions} placeholder="Select column" />
              <div>
                <label className="label-text">New name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input-field" />
              </div>
            </div>
          )}

          {opDef.needsTypeConvert && (
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Column"
                value={selectedColumns[0] || ""}
                onChange={(e) => setSelectedColumns([e.target.value])}
                options={columnOptions}
                placeholder="Select column"
              />
              <Select
                label="Target type"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                options={[
                  { value: "numeric", label: "Numeric" },
                  { value: "string", label: "String" },
                  { value: "datetime", label: "Datetime" },
                  { value: "boolean", label: "Boolean" },
                  { value: "category", label: "Category" },
                ]}
              />
            </div>
          )}

          {opDef.needsEncodeMethod && (
            <Select
              label="Encoding method"
              value={encodeMethod}
              onChange={(e) => setEncodeMethod(e.target.value)}
              options={[
                { value: "label", label: "Label Encoding" },
                { value: "onehot", label: "One-Hot Encoding" },
              ]}
            />
          )}

          <button onClick={submit} disabled={busy} className="btn-primary w-full">
            {busy ? <Spinner size={16} className="text-white" /> : <SprayCan size={16} />}
            Apply Operation
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={handleUndo} disabled={busy || history.length === 0} className="btn-secondary flex-1">
            <Undo2 size={16} /> Undo Last Step
          </button>
          <button onClick={handleReset} disabled={busy || history.length === 0} className="btn-secondary flex-1">
            <RotateCcw size={16} /> Reset to Original
          </button>
        </div>
      </div>

      <div className="card p-6 h-fit">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
          <History size={18} /> Cleaning History
        </h2>
        {history.length === 0 && <p className="text-sm text-slate-400">No cleaning steps applied yet.</p>}
        <ol className="space-y-3">
          {history.map((step, idx) => (
            <li key={step.id} className="text-sm border-l-2 border-brand-500 pl-3">
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {idx + 1}. {step.operation.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-slate-400">{new Date(step.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
