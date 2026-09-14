import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, UserPlus, Check, X, Star, MoreVertical, Ban } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import apiService from '../services/apiService.js';
import Avatar from '../components/ui/Avatar.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { VoiceButton, VideoButton } from '../components/CallButtons.jsx';

function SearchResult({ u, onAdd }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/10 p-3">
      <Avatar name={u.name} src={u.avatar} size="md" online={u.status === 'online'} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{u.name}</p>
        <p className="text-xs text-slate-500">@{u.username}</p>
      </div>
      <button onClick={() => onAdd(u)} className="btn-ghost !px-3 !py-2 text-xs">
        {u.isContact ? 'Contact' : <><UserPlus className="h-3.5 w-3.5" /> Add</>}
      </button>
    </div>
  );
}

export default function Contacts() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();
  const [contacts, setContacts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiService.getContacts().then((d) => setContacts(d.data.contacts)).finally(() => setLoading(false));
    apiService.getContactRequests().then((d) => setRequests(d.data.requests)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      apiService.searchUsers(debouncedSearch).then((d) => { setResults(d.data.users); setShowResults(true); }).catch(() => {});
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedSearch]);

  const addContact = async (u) => {
    try {
      await apiService.sendRequest(u._id);
      toast.success(`Request sent to ${u.name}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const respond = async (req, action) => {
    try {
      await apiService.respondRequest(req._id, action);
      toast.success(action === 'accept' ? 'Contact added' : 'Request rejected');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleFavorite = async (c) => {
    try {
      await apiService.updateContact(c.user._id, { favorite: !c.favorite });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (c) => {
    try {
      await apiService.removeContact(c.user._id);
      toast.info(`${c.nickname || c.user.name} removed`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const block = async (c) => {
    try {
      await apiService.blockContact(c.user._id);
      toast.info(`${c.user.name} blocked`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const callContact = (c) => navigate(`/call?to=${c.user._id}&name=${encodeURIComponent(c.nickname || c.user.name)}`);
  const videoContact = (c) => navigate(`/video-call?to=${c.user._id}&name=${encodeURIComponent(c.nickname || c.user.name)}`);
  const msgContact = (c) => navigate(`/messages?c=${''}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Contacts</h1>
          <p className="mt-1 text-sm text-slate-400">Manage the people you connect with.</p>
        </div>
      </div>

      {/* Search */}
      <GlassCard>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="input-dark !pl-10"
            placeholder="Search all users to add…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {showResults && (
          <div className="mt-4 space-y-2">
            {results.length === 0 ? (
              <p className="text-center text-sm text-slate-500">No users found.</p>
            ) : (
              results.map((u) => <SearchResult key={u._id} u={u} onAdd={addContact} />)
            )}
          </div>
        )}
      </GlassCard>

      {/* Requests */}
      {requests.length > 0 && (
        <GlassCard>
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-slate-400">Pending requests</h3>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r._id} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/10 p-3">
                <Avatar name={r.sender.name} src={r.sender.avatar} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-white">{r.sender.name}</p>
                  <p className="text-xs text-slate-500">@{r.sender.username}</p>
                </div>
                <button onClick={() => respond(r, 'accept')} className="rounded-xl bg-emerald-500/15 p-2 text-emerald-400 hover:bg-emerald-500/25"><Check className="h-4 w-4" /></button>
                <button onClick={() => respond(r, 'reject')} className="rounded-xl bg-rose-500/15 p-2 text-rose-400 hover:bg-rose-500/25"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Contacts list */}
      <div className="space-y-3">
        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">Loading contacts…</p>
        ) : contacts.length === 0 ? (
          <GlassCard>
            <EmptyState icon={UserPlus} title="No contacts yet" subtitle="Search for people above and send them a request." />
          </GlassCard>
        ) : (
          contacts.map((c) => {
            const isOnline = onlineUsers.has(c.user._id) || c.user.status === 'online';
            return (
              <motion.div key={c.user._id} className="glass rounded-3xl p-4 flex items-center gap-3 card-hover">
                <Avatar name={c.user.name} src={c.user.avatar} size="lg" online={isOnline} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-white">{c.nickname || c.user.name}</p>
                    <button onClick={() => toggleFavorite(c)}>
                      <Star className={`h-4 w-4 ${c.favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-amber-400'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">@{c.user.username}</p>
                  <p className={`text-xs ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>{isOnline ? 'Online' : 'Offline'}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <VoiceButton onClick={() => callContact(c)} disabled={!isOnline} />
                  <VideoButton onClick={() => videoContact(c)} disabled={!isOnline} />
                  <button onClick={() => navigate('/messages')} title="Message" className="rounded-xl bg-cyan-500/15 p-2.5 text-cyan-400 hover:bg-cyan-500/25">
                    <UserPlus className="h-4 w-4" />
                  </button>
                  <div className="relative group">
                    <button className="rounded-xl bg-white/[0.05] p-2.5 text-slate-400 hover:bg-white/[0.1]" title="More">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <div className="absolute right-0 top-10 z-20 hidden w-40 rounded-2xl glass-strong p-1 group-hover:block group-focus-within:block">
                      <button onClick={() => remove(c)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.06]">Remove</button>
                      <button onClick={() => block(c)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-400 hover:bg-white/[0.06]"><Ban className="h-3.5 w-3.5" /> Block</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
