import { motion } from "framer-motion";
import { BarChart3, Brain, Sparkles } from "lucide-react";

import Logo from "./Logo";

const HIGHLIGHTS = [
  { icon: Brain, text: "AI models trained on your data in one click" },
  { icon: BarChart3, text: "Live profiling, cleaning, and visualization" },
  { icon: Sparkles, text: "Executive summaries written by an AI analyst" },
];

export default function AuthShowcase() {
  return (
    <div className="hidden lg:flex flex-col justify-between w-[46%] relative overflow-hidden bg-surface-dark p-12 text-white">
      <div className="absolute inset-0 bg-mesh-dark" />
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-600 opacity-20 blur-[100px]" />
      <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-accent-500 opacity-20 blur-[100px]" />

      <div className="relative z-10">
        <Logo size={32} />
      </div>

      <div className="relative z-10 max-w-md">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-display font-bold leading-tight"
        >
          From raw file to boardroom insight —{" "}
          <span className="text-gradient bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
            in minutes.
          </span>
        </motion.h2>
        <div className="mt-8 space-y-4">
          {HIGHLIGHTS.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                <Icon size={16} />
              </div>
              <p className="text-sm text-white/80">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-xs text-white/40">© 2026 Veridian. AI-powered business intelligence.</p>
    </div>
  );
}
