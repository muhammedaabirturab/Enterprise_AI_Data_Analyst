import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Solid, high-contrast colors — deliberately not gradients/URL paint servers.
// Recharts silently drops <defs> supplied via a wrapper component (it only
// recognizes host <defs> elements passed directly as chart children), so a
// url(#gradient) fill can end up pointing at nothing and render invisible.
const BAR_COLOR = "#4F46E5"; // indigo-600
const DISTRIBUTION_COLOR = "#0891B2"; // cyan-600 (darker than accent-500 for contrast on white)
const LINE_COLOR = "#4F46E5";
const AREA_COLOR = "#4F46E5";
const PALETTE = ["#4F46E5", "#0891B2", "#059669", "#D97706", "#E11D48", "#7C3AED", "#DB2777", "#65A30D"];
const AXIS_TICK = { fontSize: 11, fill: "#94a3b8" };

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-surface-darkraised/95 backdrop-blur px-3.5 py-2.5 shadow-hover text-xs">
      {label !== undefined && <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">{String(label)}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-slate-700 dark:text-slate-200 font-medium">
          {p.name || p.dataKey}: <span className="font-bold">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function ChartRenderer({ chart }: { chart: any }) {
  if (!chart) return null;

  switch (chart.chart_type) {
    case "histogram":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
            <XAxis dataKey="bin" tick={AXIS_TICK} interval={Math.ceil(chart.data.length / 10)} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(79,70,229,0.08)" }} />
            <Bar dataKey="count" fill={BAR_COLOR} radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      );

    case "bar":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
            <XAxis dataKey="name" tick={AXIS_TICK} interval={0} angle={-20} textAnchor="end" height={60} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(79,70,229,0.08)" }} />
            <Bar dataKey="value" fill={BAR_COLOR} radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Pie
              data={chart.data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={2}
              label
              isAnimationActive={false}
            >
              {chart.data.map((_: any, idx: number) => (
                <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} stroke="none" />
              ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      );

    case "line":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
            <XAxis dataKey="x" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="y" stroke={LINE_COLOR} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
            <XAxis dataKey="x" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="y" stroke={AREA_COLOR} strokeWidth={2.5} fill={AREA_COLOR} fillOpacity={0.22} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
            <XAxis dataKey="x" name={chart.x} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis dataKey="y" name={chart.y} tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={chart.data} fill={BAR_COLOR} fillOpacity={0.7} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      );

    case "boxplot":
      return <BoxPlot data={chart.data} column={chart.column} />;

    case "distribution":
      return <DistributionSummary data={chart.data} column={chart.column} />;

    default:
      return <p className="text-sm text-slate-400">Unsupported chart type.</p>;
  }
}

function BoxPlot({ data, column }: { data: any; column: string }) {
  const { min, q1, median, q3, max } = data;
  const range = max - min || 1;
  const pct = (v: number) => ((v - min) / range) * 100;

  return (
    <div className="p-8">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-6">Box plot — {column}</p>
      <div className="relative h-16">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300 dark:bg-slate-700" />
        <div
          className="absolute top-1/2 h-px bg-slate-400"
          style={{ left: `${pct(min)}%`, width: `${pct(q1) - pct(min)}%`, transform: "translateY(-50%)" }}
        />
        <div
          className="absolute top-1/2 h-px bg-slate-400"
          style={{ left: `${pct(q3)}%`, width: `${pct(max) - pct(q3)}%`, transform: "translateY(-50%)" }}
        />
        <div
          className="absolute top-2 bottom-2 bg-brand-100 dark:bg-brand-500/20 border-2 border-brand-600 dark:border-brand-400 rounded-lg"
          style={{ left: `${pct(q1)}%`, width: `${Math.max(pct(q3) - pct(q1), 1)}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-1 bg-accent-600 dark:bg-accent-400 rounded"
          style={{ left: `${pct(median)}%` }}
          title={`Median: ${median.toFixed(2)}`}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-3">
        <span>Min: {min.toFixed(2)}</span>
        <span>Q1: {q1.toFixed(2)}</span>
        <span className="font-semibold text-accent-700 dark:text-accent-400">Median: {median.toFixed(2)}</span>
        <span>Q3: {q3.toFixed(2)}</span>
        <span>Max: {max.toFixed(2)}</span>
      </div>
    </div>
  );
}

function DistributionSummary({ data, column }: { data: any; column: string }) {
  const bins = 20;
  const values: number[] = data.values;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / bins || 1;
  const counts = new Array(bins).fill(0);
  values.forEach((v) => {
    const idx = Math.min(bins - 1, Math.floor((v - min) / width));
    counts[idx]++;
  });
  const chartData = counts.map((c, i) => ({ bin: (min + i * width).toFixed(1), count: c }));

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-4 text-center">
        <StatBox label="Mean" value={data.mean.toFixed(2)} />
        <StatBox label="Std Dev" value={data.std.toFixed(2)} />
        <StatBox label="Skewness" value={data.skew.toFixed(2)} />
        <StatBox label="Kurtosis" value={data.kurtosis.toFixed(2)} />
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
          <XAxis dataKey="bin" tick={{ ...AXIS_TICK, fontSize: 9 }} interval={2} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(8,145,178,0.08)" }} />
          <Bar dataKey="count" fill={DISTRIBUTION_COLOR} radius={[6, 6, 0, 0]} maxBarSize={40} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 mt-2 text-center">Distribution of {column}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-800 dark:text-white tabular-nums">{value}</p>
    </div>
  );
}
