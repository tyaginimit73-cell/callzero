import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, Phone, MessageCircle, UserPlus, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import apiService from '../services/apiService.js';
import Avatar from '../components/ui/Avatar.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import Modal from '../components/ui/Modal.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { VoiceButton, VideoButton } from '../components/CallButtons.jsx';

export default function Emergency() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();
  const [contacts, setContacts] = useState([]);
  const [activated, setActivated] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', contactUser: '', phone: '', priority: 1 });

  const load = () => apiService.getEmergencyContacts().then((d) => setContacts(d.data.contacts)).catch(() => {});
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      await apiService.addEmergencyContact(form);
      toast.success('Emergency contact added');
      setOpen(false);
      setForm({ name: '', relationship: '', contactUser: '', phone: '', priority: 1 });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (c) => {
    await apiService.deleteEmergencyContact(c._id);
    toast.info('Contact removed');
    load();
  };

  const call = (c) => {
    if (c.contactUser) navigate(`/call?to=${c.contactUser._id}&name=${encodeURIComponent(c.name)}`);
    else toast.info('No linked CallZero user for this contact');
  };
  const msg = (c) => {
    if (c.contactUser) navigate('/messages');
    else toast.info('No linked CallZero user for this contact');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.h1 className="font-display text-3xl font-bold text-white">Emergency Mode</motion.h1>
        <p className="mt-2 text-sm text-slate-400">One-tap access to your most important contacts.</p>
      </div>

      {/* Big activation button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setActivated((a) => !a)}
        className={`mx-auto flex max-w-md flex-col items-center justify-center gap-3 rounded-3xl p-10 transition ${activated ? 'bg-gradient-to-br from-rose-600 to-red-700 text-white' : 'glass hover:border-rose-500/50'}`}
      >
        <motion.div animate={{ scale: activated ? 1.1 : [1, 1.05, 1] }} transition={{ duration: activated ? 0.2 : 1.2, repeat: activated ? 0 : Infinity }}>
          <Siren className={`h-14 w-14 ${activated ? 'text-white' : 'text-rose-400'}`} />
        </motion.div>
        <span className="font-display text-2xl font-bold">{activated ? 'ACTIVE — Select a contact' : 'EMERGENCY CONTACT'}</span>
        {!activated && <span className="text-sm text-slate-400">Tap to reveal your trusted contacts</span>}
      </motion.button>

      {/* Disclaimer */}
      <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          CallZero is an <strong>internet communication platform</strong> and does <strong>not</strong> replace official
          emergency services. For life-threatening emergencies, call your country's official emergency number
          (e.g. 112 in the EU, 911 in the US & India, 999 in the UK) from any device with a signal. CallZero
          cannot place emergency-service calls.
        </p>
      </div>

      <AnimatePresence>
        {activated && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">Trusted Contacts</h2>
              <button onClick={() => setOpen(true)} className="btn-primary !px-4 !py-2 text-sm"><UserPlus className="h-4 w-4" /> Add contact</button>
            </div>
            {contacts.length === 0 ? (
              <GlassCard><EmptyState icon={Siren} title="No emergency contacts" subtitle="Add trusted people so they're one tap away." /></GlassCard>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {contacts.map((c, i) => {
                  const isOnline = c.contactUser && (onlineUsers.has(c.contactUser._id) || c.contactUser.status === 'online');
                  return (
                    <motion.div key={c._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="glass rounded-3xl p-6 text-center">
                      <div className="mx-auto mb-3 w-fit">
                        <Avatar name={c.name} src={c.contactUser?.avatar} size="xl" online={isOnline} />
                      </div>
                      <h3 className="font-display text-lg font-bold text-white">{c.name}</h3>
                      <p className="text-xs text-slate-500">{c.relationship}</p>
                      {c.contactUser && <p className="mt-1 text-xs text-slate-400">@{c.contactUser.username}</p>}
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button onClick={() => call(c)} className="flex flex-col items-center gap-1">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"><Phone className="h-5 w-5" /></span>
                          <span className="text-[10px] text-slate-400">Voice</span>
                        </button>
                        <button onClick={() => msg(c)} className="flex flex-col items-center gap-1">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg"><MessageCircle className="h-5 w-5" /></span>
                          <span className="text-[10px] text-slate-400">Message</span>
                        </button>
                        <button onClick={() => remove(c)} className="flex flex-col items-center gap-1">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-slate-400 hover:bg-rose-500/20"><Trash2 className="h-5 w-5" /></span>
                          <span className="text-[10px] text-slate-400">Remove</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add emergency contact">
        <div className="space-y-3">
          <input className="input-dark" placeholder="Name (e.g. Mom)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-dark" placeholder="Relationship (e.g. Mother)" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
          <input className="input-dark" placeholder="Phone number (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input-dark" placeholder="Linked CallZero user ID (optional, enables calling)" value={form.contactUser} onChange={(e) => setForm({ ...form, contactUser: e.target.value })} />
          <button onClick={add} className="btn-primary w-full">Save contact</button>
        </div>
      </Modal>
    </div>
  );
}
