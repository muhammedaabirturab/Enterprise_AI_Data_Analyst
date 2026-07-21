import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>();

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handle = (result: boolean) => {
    setOptions(null);
    resolver.current?.(result);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {options && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handle(false)}
          >
            <motion.div
              className="card w-full max-w-sm p-6"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  options.danger ? "bg-danger-50 dark:bg-danger-500/10 text-danger-500" : "bg-brand-50 dark:bg-brand-500/10 text-brand-600"
                }`}
              >
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{options.title}</h3>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{options.message}</p>
              <div className="flex gap-3 mt-6">
                <button className="btn-secondary flex-1" onClick={() => handle(false)}>
                  {options.cancelLabel || "Cancel"}
                </button>
                <button
                  className={options.danger ? "flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-danger-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-danger-600" : "btn-primary flex-1"}
                  onClick={() => handle(true)}
                >
                  {options.confirmLabel || "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}
