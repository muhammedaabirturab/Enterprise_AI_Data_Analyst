import { Brain, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiErrorMessage } from "../../services/api";
import { trainModel } from "../../services/mlService";
import { MLRecommendation, MLRunResult, ProfileResponse } from "../../types";
import Badge from "../ui/Badge";
import Select from "../ui/Select";
import Spinner from "../ui/Spinner";

const ALGORITHMS: Record<string, { value: string; label: string }[]> = {
  regression: [
    { value: "linear_regression", label: "Linear Regression" },
    { value: "random_forest_regressor", label: "Random Forest Regressor" },
    { value: "decision_tree_regressor", label: "Decision Tree Regressor" },
  ],
  classification: [
    { value: "logistic_regression", label: "Logistic Regression" },
    { value: "random_forest_classifier", label: "Random Forest Classifier" },
    { value: "decision_tree_classifier", label: "Decision Tree Classifier" },
    { value: "svm_classifier", label: "Support Vector Machine" },
  ],
  clustering: [{ value: "kmeans", label: "K-Means" }],
  anomaly_detection: [{ value: "isolation_forest", label: "Isolation Forest" }],
  time_series: [{ value: "trend_forecast", label: "Trend Forecast" }],
};

const TASK_LABELS: Record<string, string> = {
  regression: "Regression",
  classification: "Classification",
  clustering: "Clustering",
  anomaly_detection: "Anomaly Detection",
  time_series: "Time Series Forecasting",
};

interface Props {
  datasetId: number;
  profile: ProfileResponse | null;
  recommendations: MLRecommendation[];
}

export default function MLSection({ datasetId, profile, recommendations }: Props) {
  const [taskType, setTaskType] = useState("regression");
  const [algorithm, setAlgorithm] = useState(ALGORITHMS.regression[0].value);
  const [targetColumn, setTargetColumn] = useState("");
  const [dateColumn, setDateColumn] = useState("");
  const [nClusters, setNClusters] = useState(3);
  const [forecastPeriods, setForecastPeriods] = useState(12);
  const [result, setResult] = useState<MLRunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columnOptions = profile?.columns.map((c) => ({ value: c.name, label: c.name })) ?? [];

  const applyRecommendation = (rec: MLRecommendation) => {
    setTaskType(rec.task_type);
    setAlgorithm(rec.algorithm);
    if (rec.target_column) setTargetColumn(rec.target_column);
  };

  const train = async () => {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const run = await trainModel(datasetId, {
        task_type: taskType,
        algorithm,
        target_column: targetColumn || undefined,
        n_clusters: nClusters,
        date_column: dateColumn || undefined,
        forecast_periods: forecastPeriods,
      });
      setResult(run);
    } catch (err) {
      setError(apiErrorMessage(err, "Training failed — check your column selections."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {recommendations.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
            <Sparkles size={16} className="text-brand-600 dark:text-brand-400" /> AI Model Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {recommendations.map((rec, i) => (
              <button
                key={i}
                onClick={() => applyRecommendation(rec)}
                className="text-left rounded-xl border border-slate-200 dark:border-white/10 p-4 hover:border-brand-400 dark:hover:border-brand-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="brand">{TASK_LABELS[rec.task_type]}</Badge>
                  <span className="text-xs text-slate-400">{Math.round(rec.suitability_score * 100)}% match</span>
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{rec.algorithm.replace(/_/g, " ")}</p>
                <p className="text-xs text-slate-400 mt-1">{rec.reason}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <Select
            label="Task Type"
            value={taskType}
            onChange={(e) => {
              setTaskType(e.target.value);
              setAlgorithm(ALGORITHMS[e.target.value][0].value);
            }}
            options={Object.entries(TASK_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <Select label="Algorithm" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} options={ALGORITHMS[taskType]} />

          {(taskType === "regression" || taskType === "classification") && (
            <Select label="Target Column" value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)} options={columnOptions} placeholder="Select target" />
          )}
          {taskType === "clustering" && (
            <div>
              <label className="label-text">Number of Clusters</label>
              <input type="number" min={2} max={10} value={nClusters} onChange={(e) => setNClusters(Number(e.target.value))} className="input-field" />
            </div>
          )}
          {taskType === "time_series" && (
            <>
              <Select label="Date Column" value={dateColumn} onChange={(e) => setDateColumn(e.target.value)} options={columnOptions} placeholder="Select date column" />
              <Select label="Target Column" value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)} options={columnOptions} placeholder="Select value column" />
              <div>
                <label className="label-text">Forecast Periods</label>
                <input type="number" min={1} max={60} value={forecastPeriods} onChange={(e) => setForecastPeriods(Number(e.target.value))} className="input-field" />
              </div>
            </>
          )}
        </div>
        <button onClick={train} disabled={loading} className="btn-primary">
          {loading ? <Spinner size={16} className="text-white" /> : <Brain size={16} />}
          Train Model
        </button>
      </div>

      {error && <div className="rounded-xl bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 text-sm px-4 py-3">{error}</div>}

      {result && <ResultsPanel result={result} />}
    </div>
  );
}

function ResultsPanel({ result }: { result: MLRunResult }) {
  return (
    <div className="space-y-5">
      <div className="card p-6">
        <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-white">Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(result.metrics).map(([key, value]) => (
            <div key={key} className="rounded-xl bg-slate-50 dark:bg-white/5 p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">{key.replace(/_/g, " ")}</p>
              <p className="text-xl font-semibold text-slate-800 dark:text-white mt-1 tabular-nums">
                {typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : String(value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {result.artifacts.feature_importance?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-white">Feature Importance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={result.artifacts.feature_importance} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fill: "#94a3b8" }} width={120} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="importance" fill="#4F46E5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {result.artifacts.confusion_matrix && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-white">Confusion Matrix</h3>
          <ConfusionMatrix data={result.artifacts.confusion_matrix} />
        </div>
      )}

      {result.artifacts.roc_curve && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-1 text-slate-800 dark:text-white">ROC Curve</h3>
          <p className="text-sm text-slate-400 mb-4">AUC: {result.artifacts.roc_curve.auc}</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={result.artifacts.roc_curve.points}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="fpr" type="number" domain={[0, 1]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="tpr" type="number" domain={[0, 1]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="tpr" stroke="#06B6D4" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {result.artifacts.scatter_sample?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-white">Cluster Visualization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="x" type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="y" type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Scatter data={result.artifacts.scatter_sample} fill="#4F46E5" fillOpacity={0.65} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {result.artifacts.historical && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-white">Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[...result.artifacts.historical, ...result.artifacts.forecast]}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                interval={Math.ceil((result.artifacts.historical.length + result.artifacts.forecast.length) / 12)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="actual" stroke="#4F46E5" dot={false} strokeWidth={2.5} />
              <Line type="monotone" dataKey="forecast" stroke="#F59E0B" dot={false} strokeWidth={2.5} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function ConfusionMatrix({ data }: { data: { labels: string[]; matrix: number[][] } }) {
  const max = Math.max(...data.matrix.flat(), 1);
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <thead>
          <tr>
            <th></th>
            {data.labels.map((l) => (
              <th key={l} className="text-xs font-medium text-slate-400 p-2">
                Pred: {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.matrix.map((row, i) => (
            <tr key={i}>
              <td className="text-xs font-medium text-slate-400 p-2 text-right">Actual: {data.labels[i]}</td>
              {row.map((value, j) => (
                <td key={j} className="p-1">
                  <div
                    className="w-16 h-16 flex items-center justify-center rounded-xl font-semibold text-sm transition-transform hover:scale-105"
                    style={{
                      backgroundColor: `rgba(79, 70, 229, ${0.12 + (value / max) * 0.75})`,
                      color: value / max > 0.5 ? "white" : "#334155",
                    }}
                  >
                    {value}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
