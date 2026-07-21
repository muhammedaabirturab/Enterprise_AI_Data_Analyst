export default function Logo({ size = 32, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 64 64" className="shrink-0">
        <defs>
          <linearGradient id="veridian-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <path d="M32 2 L59 17 V47 L32 62 L5 47 V17 Z" fill="url(#veridian-g)" />
        <rect x="14" y="34" width="8" height="14" rx="1.5" fill="white" opacity="0.95" />
        <rect x="28" y="24" width="8" height="24" rx="1.5" fill="white" />
        <rect x="42" y="16" width="8" height="32" rx="1.5" fill="white" opacity="0.95" />
      </svg>
      {showText && (
        <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white">
          Veridian
        </span>
      )}
    </div>
  );
}
