import { History, RotateCcw, SprayCan, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { apiErrorMessage } from "../../services/api";
import { applyCleaning, getCleaningHistory, resetCleaning, undoCleaning } from "../../services/cleaningService";
import { CleaningStep, ProfileResponse } from "../../types";
import Select from "../ui/Select";
import Spinner from "../ui/Spinner";

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

interface Props {
  datasetId: number;
  profile: ProfileResponse | null;
  onChanged: () => void;
}

export default function CleaningSection({ datasetId, profile, onChanged }: Props) {
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
  const confirm = useConfirm();
  const { showToast } = useToast();

  const loadHistory = () => getCleaningHistory(datasetId).then(setHistory);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

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

      await applyCleaning(datasetId, operation, params);
      await loadHistory();
      onChanged();
      showToast(`Applied "${opDef.label}".`, "success");
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
      await undoCleaning(datasetId);
      await loadHistory();
      onChanged();
      showToast("Last cleaning step undone.", "success");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: "Reset all cleaning?",
      message: "This discards every cleaning step and restores the dataset to its original uploaded state.",
      confirmLabel: "Reset",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await resetCleaning(datasetId);
      await loadHistory();
      onChanged();
      showToast("Dataset reset to its original state.", "success");
    } finally {
      setBusy(false);
    }
  };

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {error && <div className="rounded-xl bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 text-sm px-4 py-3">{error}</div>}

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
                        ? "bg-brand-gradient text-white border-transparent"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-brand-300"
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
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
          <History size={16} /> Cleaning History
        </h3>
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
