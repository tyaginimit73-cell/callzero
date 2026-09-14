import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.identifier, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-aurora px-4">
      <div className="pointer-events-none absolute inset-0 grid-overlay" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative w-full max-w-md rounded-3xl p-8"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-white">
            Call<span className="gradient-text">Zero</span>
          </span>
        </Link>
        <h1 className="text-center font-display text-2xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-slate-400">Log in to keep the conversation going</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Email or username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                className="input-dark !pl-10"
                placeholder="you@example.com or username"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                className="input-dark !pl-10"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          New to CallZero?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-slate-600">
          Demo accounts: alice@callzero.app / bob@callzero.app — password: password123
        </p>
      </motion.div>
    </div>
  );
}
