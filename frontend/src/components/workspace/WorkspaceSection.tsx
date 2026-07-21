import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import ErrorBoundary from "../ui/ErrorBoundary";

interface WorkspaceSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
}

export default function WorkspaceSection({ id, eyebrow, title, description, icon: Icon, actions, children }: WorkspaceSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="scroll-mt-24"
    >
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-brand-gradient-soft p-2.5 text-brand-600 dark:text-brand-400 shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <p className="section-eyebrow">{eyebrow}</p>
            <h2 className="section-title mt-0.5">{title}</h2>
            {description && <p className="text-sm text-slate-400 mt-1 max-w-xl">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <ErrorBoundary label={title}>{children}</ErrorBoundary>
    </motion.section>
  );
}
