import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Loader2, Mail, Lock, User, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created. Welcome to CallZero!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-aurora px-4 py-8">
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
        <h1 className="text-center font-display text-2xl font-semibold text-white">Create your account</h1>
        <p className="mt-1 text-center text-sm text-slate-400">Free internet calling & messaging, forever</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Full name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className="input-dark !pl-10" placeholder="Jane Doe" value={form.name} onChange={set('name')} required minLength={2} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Username</label>
            <div className="relative">
              <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className="input-dark !pl-10" placeholder="janedoe (3-20 chars)" value={form.username} onChange={set('username')} required pattern="[a-z0-9_]{3,20}" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type="email" className="input-dark !pl-10" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="password" className="input-dark !pl-10" placeholder="8+ chars" value={form.password} onChange={set('password')} required minLength={8} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="password" className="input-dark !pl-10" placeholder="repeat" value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
