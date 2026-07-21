import { motion } from "framer-motion";
import { ArrowUpRight, Bot } from "lucide-react";

import { useChatWidget } from "../../context/ChatContext";

const PROMPTS = [
  "What does this dataset show?",
  "Which columns have missing values?",
  "Recommend an ML model for this data.",
  "What should I clean first?",
  "Explain the correlations you found.",
];

export default function ChatSection() {
  const { openWithMessage } = useChatWidget();

  return (
    <div className="card p-8 relative overflow-hidden">
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-brand-gradient opacity-[0.07] blur-3xl" />
      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1">
          <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center text-white shadow-glow mb-4">
            <Bot size={22} />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">Ask Veridian anything about this data</h3>
          <p className="text-sm text-slate-400 mt-1.5 max-w-md">
            The assistant is grounded in this dataset's live statistics — no hallucinated numbers, just answers backed
            by what's actually in your file.
          </p>
          <button onClick={() => openWithMessage()} className="btn-primary mt-5">
            Open Chat Assistant <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="flex-1 space-y-2 w-full">
          {PROMPTS.map((prompt, i) => (
            <motion.button
              key={prompt}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              onClick={() => openWithMessage(prompt)}
              className="w-full text-left text-sm px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-brand-400 dark:hover:border-brand-500 transition-colors flex items-center justify-between group"
            >
              <span className="text-slate-600 dark:text-slate-300">{prompt}</span>
              <ArrowUpRight size={14} className="text-slate-300 group-hover:text-brand-500 transition-colors shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
