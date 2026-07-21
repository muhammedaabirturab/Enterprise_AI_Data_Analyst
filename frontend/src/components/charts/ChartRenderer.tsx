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

const PALETTE = ["#4F46E5", "#10B981", "#F59E0B", "#F43F5E", "#0EA5E9", "#8B5CF6", "#EC4899", "#84CC16"];

export default function ChartRenderer({ chart }: { chart: any }) {
  if (!chart) return null;

  switch (chart.chart_type) {
    case "histogram":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="bin" tick={{ fontSize: 10 }} interval={Math.ceil(chart.data.length / 10)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );

    case "bar":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
              {chart.data.map((_: any, idx: number) => (
                <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );

    case "line":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="x" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#4F46E5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={chart.data}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="x" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="y" stroke="#4F46E5" fill="url(#areaFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="x" name={chart.x} tick={{ fontSize: 11 }} />
            <YAxis dataKey="y" name={chart.y} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={chart.data} fill="#4F46E5" fillOpacity={0.6} />
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
          className="absolute top-2 bottom-2 bg-brand-100 dark:bg-brand-900/40 border-2 border-brand-500 rounded"
          style={{ left: `${pct(q1)}%`, width: `${Math.max(pct(q3) - pct(q1), 1)}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-accent-600"
          style={{ left: `${pct(median)}%` }}
          title={`Median: ${median.toFixed(2)}`}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-3">
        <span>Min: {min.toFixed(2)}</span>
        <span>Q1: {q1.toFixed(2)}</span>
        <span className="font-semibold text-accent-600">Median: {median.toFixed(2)}</span>
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
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="bin" tick={{ fontSize: 9 }} interval={2} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 mt-2 text-center">Distribution of {column}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}
