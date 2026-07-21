export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function KpiCardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-16" />
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2.5 p-1">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return <Skeleton className="w-full" style={{ height }} />;
}
