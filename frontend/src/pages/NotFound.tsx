import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-16 h-16 rounded-2xl bg-brand-gradient-soft flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6"
      >
        <Compass size={28} />
      </motion.div>
      <p className="section-eyebrow">404</p>
      <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-2">This page took a wrong turn</h1>
      <p className="text-slate-400 mt-2 max-w-sm">
        We couldn't find what you were looking for. It may have moved into the Workspace.
      </p>
      <Link to="/dashboard" className="btn-primary mt-6">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
    </div>
  );
}
