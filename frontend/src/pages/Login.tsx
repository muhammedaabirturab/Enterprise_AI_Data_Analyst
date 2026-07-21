import { motion } from "framer-motion";
import { AlertCircle, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShowcase from "../components/ui/AuthShowcase";
import Logo from "../components/ui/Logo";
import PasswordInput from "../components/ui/PasswordInput";
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
    <div className="min-h-screen flex bg-surface-light dark:bg-surface-dark">
      <AuthShowcase />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex lg:hidden justify-center mb-8">
            <Logo size={36} />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1.5 mb-8">Sign in to your Veridian workspace</p>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 text-sm px-3.5 py-2.5 mb-5">
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
              <PasswordInput
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner size={16} className="text-white" /> : <LogIn size={16} />}
              Sign in
            </button>
          </form>

          <p className="text-sm text-center text-slate-400 mt-7">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
