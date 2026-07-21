import { BarChart3 } from "lucide-react";
import { useState } from "react";

import { apiErrorMessage } from "../../services/api";
import { generateChart } from "../../services/chartService";
import { ProfileResponse } from "../../types";
import ChartRenderer from "../charts/ChartRenderer";
import EmptyState from "../ui/EmptyState";
import Select from "../ui/Select";
import Spinner from "../ui/Spinner";

const CHART_TYPES = [
  { value: "histogram", label: "Histogram", needsX: true },
  { value: "boxplot", label: "Box Plot", needsX: true },
  { value: "scatter", label: "Scatter Plot", needsX: true, needsY: true },
  { value: "pie", label: "Pie Chart", needsCategory: true },
  { value: "bar", label: "Bar Chart", needsCategory: true, needsY: true, yLabel: "Value (optional, sums if numeric)" },
  { value: "line", label: "Line Chart", needsX: true, needsY: true },
  { value: "area", label: "Area Chart", needsX: true, needsY: true },
  { value: "distribution", label: "Distribution Summary", needsX: true },
];

export default function ChartsSection({ datasetId, profile }: { datasetId: number; profile: ProfileResponse | null }) {
  const [chartType, setChartType] = useState("histogram");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [category, setCategory] = useState("");
  const [bins, setBins] = useState(20);
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const def = CHART_TYPES.find((c) => c.value === chartType)!;
  const allColumns = profile?.columns.map((c) => ({ value: c.name, label: c.name })) ?? [];

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await generateChart(datasetId, {
        chart_type: chartType,
        x: def.needsX ? x : undefined,
        y: def.needsY ? y : undefined,
        category: def.needsCategory ? category : undefined,
        bins,
      });
      setChart(result);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not generate this chart — check your column selections."));
      setChart(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <Select label="Chart Type" value={chartType} onChange={(e) => setChartType(e.target.value)} options={CHART_TYPES} />
          {def.needsX && (
            <Select
              label={chartType === "scatter" || chartType === "line" || chartType === "area" ? "X Axis" : "Column"}
              value={x}
              onChange={(e) => setX(e.target.value)}
              options={allColumns}
              placeholder="Select column"
            />
          )}
          {def.needsY && (
            <Select label={def.yLabel || "Y Axis"} value={y} onChange={(e) => setY(e.target.value)} options={allColumns} placeholder="Select column" />
          )}
          {def.needsCategory && (
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={allColumns} placeholder="Select column" />
          )}
          {chartType === "histogram" && (
            <div>
              <label className="label-text">Bins</label>
              <input type="number" min={5} max={100} value={bins} onChange={(e) => setBins(Number(e.target.value))} className="input-field" />
            </div>
          )}
        </div>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary">
          {loading ? <Spinner size={16} className="text-white" /> : <BarChart3 size={16} />}
          Generate Chart
        </button>
      </div>

      {error && <div className="rounded-xl bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 text-sm px-4 py-3">{error}</div>}

      {chart ? (
        <div className="card p-6">
          <ChartRenderer chart={chart} />
        </div>
      ) : (
        !error && (
          <EmptyState
            icon={BarChart3}
            title="No chart yet"
            description="Pick a chart type and columns above, then generate to see it rendered here."
          />
        )
      )}
    </div>
  );
}
