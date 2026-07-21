import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-10 flex flex-col items-center justify-center text-center bg-mesh-light dark:bg-mesh-dark"
    >
      <div className="w-12 h-12 rounded-2xl bg-brand-gradient-soft flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
        <Icon size={22} />
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="text-xs text-slate-400 mt-1.5 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
