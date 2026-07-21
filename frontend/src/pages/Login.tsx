import { motion } from "framer-motion";
import { AlertCircle, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Logo from "../components/ui/Logo";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-surface-dark dark:via-surface-dark dark:to-surface-dark px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-8"
      >
        <div className="flex justify-center mb-6">
          <Logo size={40} />
        </div>
        <h1 className="text-xl font-display font-bold text-center text-slate-900 dark:text-white">Welcome back</h1>
        <p className="text-sm text-slate-400 text-center mt-1 mb-6">Sign in to your Veridian workspace</p>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm px-3 py-2.5 mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner size={16} className="text-white" /> : <LogIn size={16} />}
            Sign in
          </button>
        </form>

        <p className="text-sm text-center text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
