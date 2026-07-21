interface Props {
  columns: string[];
  matrix: (number | null)[][];
}

function colorFor(value: number | null): string {
  if (value === null) return "#e2e8f0";
  const clamped = Math.max(-1, Math.min(1, value));
  if (clamped >= 0) {
    const intensity = Math.round(clamped * 200);
    return `rgb(${79 + (255 - 79) * (1 - clamped)}, ${70 + (255 - 70) * (1 - clamped)}, ${229})`;
  }
  const abs = Math.abs(clamped);
  return `rgb(244, ${63 + (255 - 63) * (1 - abs)}, ${94 + (255 - 94) * (1 - abs)})`;
}

export default function CorrelationHeatmap({ columns, matrix }: Props) {
  if (!columns.length) {
    return <p className="text-sm text-slate-400">Not enough numeric columns to compute correlations.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-1"></th>
            {columns.map((c) => (
              <th key={c} className="p-1 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap max-w-[80px] truncate" title={c}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={columns[i]}>
              <td className="p-1 pr-2 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap text-right max-w-[100px] truncate" title={columns[i]}>
                {columns[i]}
              </td>
              {row.map((value, j) => (
                <td
                  key={j}
                  className="p-0 text-center"
                  title={value !== null ? value.toFixed(2) : "N/A"}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center text-[10px] font-medium text-slate-800"
                    style={{ backgroundColor: colorFor(value) }}
                  >
                    {value !== null ? value.toFixed(2) : "-"}
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
