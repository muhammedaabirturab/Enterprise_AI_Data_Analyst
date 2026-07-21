import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { useToast } from "../../context/ToastContext";

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const COLORS = {
  success: "text-success-500 bg-success-50 dark:bg-success-500/10",
  error: "text-danger-500 bg-danger-50 dark:bg-danger-500/10",
  info: "text-brand-500 bg-brand-50 dark:bg-brand-500/10",
};

export default function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.variant];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
              className="card pointer-events-auto flex items-start gap-3 p-4 shadow-elevated"
            >
              <span className={`rounded-lg p-1.5 shrink-0 ${COLORS[toast.variant]}`}>
                <Icon size={16} />
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-200 flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 shrink-0"
              >
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
