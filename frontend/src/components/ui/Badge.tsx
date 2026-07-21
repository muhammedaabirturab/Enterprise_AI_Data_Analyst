const VARIANTS: Record<string, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  success: "bg-success-100 text-success-600 dark:bg-success-500/10 dark:text-success-400",
  warning: "bg-warning-100 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400",
  danger: "bg-danger-100 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400",
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  accent: "bg-accent-100 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300",
};

export default function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${VARIANTS[variant]}`}>
      {children}
    </span>
  );
}
