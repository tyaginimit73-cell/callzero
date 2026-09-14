import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-aurora px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-400">
        <Compass className="h-10 w-10 text-white" />
      </div>
      <h1 className="mt-6 font-display text-6xl font-bold text-white">404</h1>
      <p className="mt-2 text-slate-400">This page seems to have drifted off the network.</p>
      <Link to="/" className="btn-primary mt-6">Back home</Link>
    </div>
  );
}
