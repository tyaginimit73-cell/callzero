import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Send,
  Smile,
  Phone,
  Video,
  ArrowLeft,
  CornerUpLeft,
  Trash2,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import apiService from '../services/apiService.js';
import Avatar from '../components/ui/Avatar.jsx';
import MessageBubble from '../components/MessageBubble.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { timeAgo, lastSeen } from '../utils/format.js';

const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '😢', '🔥', '🎉', '❤️', '🤔', '😎', '💯'];

export default function Messages() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const activeId = params.get('c'); // conversation id
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [searchResults, setSearchResults] = useState([]);
  const [typing, setTyping] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // load conversations
  useEffect(() => {
    apiService
      .getConversations()
      .then((d) => setConversations(d.data.conversations))
      .finally(() => setLoading(false));
  }, []);

  // load active conversation messages
  useEffect(() => {
    if (!activeId) {
      setActive(null);
      setMessages([]);
      return;
    }
    setMessages([]);
    apiService
      .getMessages(activeId)
      .then((d) => setMessages(d.data.messages))
      .catch(() => toast.error('Could not load messages'));
    const conv = conversations.find((c) => c._id === activeId);
    setActive(conv || null);
  }, [activeId, conversations, toast]);

  // scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeId]);

  // user search
  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults([]);
      return;
    }
    apiService.searchUsers(debouncedSearch).then((d) => setSearchResults(d.data.users)).catch(() => {});
  }, [debouncedSearch]);

  // socket listeners
  useEffect(() => {
    if (!socket) return;
    const onReceive = ({ message }) => {
      setMessages((m) => (m.some((x) => x._id === message._id) ? m : [...m, message]));
      if (message.receiver === user._id) {
        // update conversation preview
        setConversations((cs) =>
          cs.map((c) =>
            c._id === message.conversation ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt, unread: 0 } : c
          )
        );
      }
    };
    const onTypingStart = ({ userId }) => setTyping((t) => ({ ...t, [userId]: true }));
    const onTypingStop = ({ userId }) => setTyping((t) => ({ ...t, [userId]: false }));
    socket.on('message:receive', onReceive);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    return () => {
      socket.off('message:receive', onReceive);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [socket, user]);

  // typing emit
  const typingTimeout = useRef(null);
  const emitTyping = (state) => {
    if (!socket || !active) return;
    if (state === 'start') socket.emit('typing:start', { conversationId: active._id, receiverId: active.participant._id });
    else socket.emit('typing:stop', { conversationId: active._id, receiverId: active.participant._id });
  };
  const handleType = (e) => {
    setText(e.target.value);
    emitTyping('start');
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping('stop'), 1000);
  };

  const send = useCallback(async () => {
    if (!text.trim() || !active) return;
    const payload = {
      conversationId: active._id,
      receiverId: active.participant._id,
      content: text.trim(),
      replyTo: replyTo?._id || null,
    };
    try {
      const { data } = await apiService.sendMessage(payload);
      const msg = { ...data.message, status: 'sent', createdAt: new Date().toISOString() };
      setMessages((m) => [...m, msg]);
      // update preview
      setConversations((cs) =>
        cs.map((c) => (c._id === active._id ? { ...c, lastMessage: text.trim(), lastMessageAt: new Date().toISOString() } : c))
      );
      setText('');
      setReplyTo(null);
      emitTyping('stop');
    } catch (err) {
      toast.error(err.message);
    }
  }, [text, active, replyTo, toast]);

  const openUser = async (u) => {
    try {
      const { data } = await apiService.getOrCreateConversation(u._id);
      setParams({ c: data.conversation._id });
      setActive({ _id: data.conversation._id, participant: u, lastMessage: '', lastMessageAt: new Date() });
      setSearch('');
      setSearchResults([]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const peer = active?.participant;
  const isOnline = peer ? onlineUsers.has(peer._id) || peer.status === 'online' : false;

  // Layout
  return (
    <div className="flex h-[calc(100dvh-7rem)] lg:h-[calc(100vh-9rem)] overflow-hidden rounded-3xl glass">
      {/* Conversations sidebar */}
      <aside className={`w-full max-w-sm flex-col border-r border-white/10 ${activeId ? 'hidden md:flex' : 'flex'} `}>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="input-dark !pl-10"
              placeholder="Search people…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {search && (
          <div className="px-3 pb-2 space-y-1 max-h-56 overflow-y-auto">
            {searchResults.map((u) => (
              <button key={u._id} onClick={() => openUser(u)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.06] text-left">
                <Avatar name={u.name} src={u.avatar} size="sm" online={u.status === 'online'} />
                <div>
                  <p className="text-sm text-white">{u.name}</p>
                  <p className="text-xs text-slate-500">@{u.username}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {loading ? (
            <p className="p-6 text-center text-sm text-slate-500">Loading conversations…</p>
          ) : conversations.length === 0 ? (
            <EmptyState icon={MessageCircle} title="No conversations" subtitle="Search for someone above to start chatting." />
          ) : (
            conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => setParams({ c: c._id })}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${activeId === c._id ? 'bg-violet-500/15' : 'hover:bg-white/[0.05]'}`}
              >
                <Avatar name={c.participant?.name} src={c.participant?.avatar} size="md" online={onlineUsers.has(c.participant?._id) || c.participant?.status === 'online'} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-white">{c.participant?.name}</p>
                    <span className="text-[10px] text-slate-500">{timeAgo(c.lastMessageAt)}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">{c.lastMessage || 'Say hi 👋'}</p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-500 px-1.5 text-[10px] font-bold text-white">{c.unread}</span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat window */}
      {active ? (
        <div className="flex flex-1 flex-col">
          {/* header */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <button className="md:hidden text-slate-400" onClick={() => setParams({})}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar name={peer.name} src={peer.avatar} size="sm" online={isOnline} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{peer.name}</p>
              <p className="text-xs text-slate-500">
                {typing[peer._id] ? <span className="text-emerald-400">typing…</span> : lastSeen(peer.lastSeen, isOnline ? 'online' : peer.status)}
              </p>
            </div>
            <button onClick={() => navigate(`/call?to=${peer._id}&name=${encodeURIComponent(peer.name)}`)} title="Voice call" className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-400 hover:bg-emerald-500/25">
              <Phone className="h-4 w-4" />
            </button>
            <button onClick={() => navigate(`/video-call?to=${peer._id}&name=${encodeURIComponent(peer.name)}`)} title="Video call" className="rounded-xl bg-violet-500/15 p-2.5 text-violet-400 hover:bg-violet-500/25">
              <Video className="h-4 w-4" />
            </button>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {replyTo && (
              <div className="mb-2 flex items-center justify-between rounded-xl bg-violet-500/10 border border-violet-500/30 px-3 py-2 text-xs text-violet-200">
                <span className="flex items-center gap-2"><CornerUpLeft className="h-3 w-3" /> Replying to: {replyTo.content.slice(0, 50)}</span>
                <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-white"><Trash2 className="h-3 w-3" /></button>
              </div>
            )}
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No messages yet — say hello!</div>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m._id}
                  message={m}
                  isMine={String(m.sender?._id || m.sender) === String(user._id)}
                  onReply={() => setReplyTo(m)}
                />
              ))
            )}
          </div>

          {/* composer */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button className="rounded-xl bg-white/[0.05] p-2.5 text-slate-300 hover:bg-white/[0.1]" title="Emoji"><Smile className="h-4 w-4" /></button>
                <div className="absolute bottom-12 left-0 z-10 grid w-44 grid-cols-6 gap-1 rounded-2xl glass-strong p-2">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setText((t) => t + e)} className="text-lg hover:scale-125 transition">{e}</button>
                  ))}
                </div>
              </div>
              <input
                className="input-dark flex-1"
                placeholder="Type a message…"
                value={text}
                onChange={handleType}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={send} className="rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2.5 text-white">
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center md:flex">
          <EmptyState icon={MessageCircle} title="Select a conversation" subtitle="Choose a chat on the left to start messaging." />
        </div>
      )}
    </div>
  );
}
