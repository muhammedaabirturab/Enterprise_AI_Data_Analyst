import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, User as UserIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useDataset } from "../../context/DatasetContext";
import { getChatHistory, sendChatMessage } from "../../services/aiService";
import { ChatMessage } from "../../types";
import Spinner from "../ui/Spinner";

const SUGGESTIONS = [
  "What does this dataset show?",
  "Which columns have missing values?",
  "Recommend an ML model.",
  "What should I clean first?",
  "Explain the correlations.",
];

export default function ChatWidget() {
  const { activeDataset } = useDataset();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && activeDataset) {
      getChatHistory(activeDataset.id).then(setMessages).catch(() => setMessages([]));
    }
  }, [open, activeDataset]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const submit = async (text: string) => {
    if (!activeDataset || !text.trim()) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: text, created_at: new Date().toISOString() },
    ]);
    setLoading(true);
    try {
      const { history } = await sendChatMessage(activeDataset.id, text);
      setMessages(history);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Sorry, I couldn't process that. Please try again.", created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!activeDataset) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="card w-[380px] h-[520px] flex flex-col mb-4 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
              <div className="flex items-center gap-2">
                <Bot size={18} />
                <span className="font-semibold text-sm">Veridian AI Assistant</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 mb-2">Try asking:</p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-400 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      m.role === "user" ? "bg-brand-600 text-white" : "bg-accent-500 text-white"
                    }`}
                  >
                    {m.role === "user" ? <UserIcon size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[75%] whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-brand-600 text-white rounded-tr-sm"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
                  <Spinner size={14} /> Thinking...
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your data..."
                className="input-field text-sm"
              />
              <button type="submit" className="btn-primary px-3 py-2.5" disabled={loading}>
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-elevated flex items-center justify-center"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </div>
  );
}
