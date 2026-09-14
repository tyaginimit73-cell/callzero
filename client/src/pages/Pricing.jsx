import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard.jsx';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    highlight: false,
    features: ['Internet messaging', 'Browser-to-browser voice calling', 'Basic video calling', 'Contacts & presence', 'Network diagnostics'],
  },
  {
    name: 'Pro',
    price: '₹299',
    period: '/month',
    highlight: true,
    features: ['Everything in Free', 'Advanced calling features', 'Higher-quality infrastructure', 'Full call history', 'Advanced privacy settings', 'Additional message storage'],
  },
  {
    name: 'Business',
    price: 'Custom',
    period: '',
    highlight: false,
    features: ['Everything in Pro', 'Team communication', 'Organization accounts', 'Admin dashboard', 'Analytics & reporting', 'Priority support'],
  },
];

export default function Pricing() {
  return (
    <div className="space-y-10">
      <div className="text-center">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold text-white sm:text-4xl">
          Simple, honest <span className="gradient-text">pricing</span>
        </motion.h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Core internet calling, video and messaging are always free. Upgrading adds convenience —
          it never gates the basic experience behind payment.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard hover className={`h-full p-7 ${p.highlight ? 'border-violet-500/50 shadow-glow' : ''}`}>
              {p.highlight && (
                <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-300 border border-violet-500/30">
                  <Sparkles className="h-3 w-3" /> Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-white">{p.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="font-display text-4xl font-bold text-white">{p.price}</span>
                <span className="pb-1 text-sm text-slate-400">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {f}
                  </li>
                ))}
              </ul>
              <button className={`${p.highlight ? 'btn-primary' : 'btn-ghost'} mt-6 w-full`}>Choose {p.name}</button>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="text-center">
        <p className="text-sm text-slate-400">
          ⚠️ CallZero is an internet communication platform. It does not provide carrier or emergency-service
          calling. Prices are indicative and can be configured for your deployment.
        </p>
      </GlassCard>
    </div>
  );
}
