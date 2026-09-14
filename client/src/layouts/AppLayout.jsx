import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Phone,
  Video,
  MessageCircle,
  Users,
  Siren,
  Gauge,
  Shield,
  Settings,
  LogOut,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import NetworkIndicator from '../components/NetworkIndicator.jsx';
import IncomingCallOverlay from '../components/IncomingCallOverlay.jsx';

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/call', label: 'Voice', icon: Phone },
  { to: '/video-call', label: 'Video', icon: Video },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/contacts', label: 'Contacts', icon: Users },
  { to: '/emergency', label: 'Emergency', icon: Siren },
];

const toolsNav = [
  { to: '/network-test', label: 'Network Check', icon: Gauge },
  { to: '/security', label: 'Security', icon: Shield },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavItem = ({ item, mobile = false }) => (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl font-medium transition ${
          mobile ? 'flex-col gap-1 py-1 text-[10px]' : 'px-4 py-2.5 text-sm'
        } ${isActive ? 'bg-violet-500/15 text-violet-200' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'}`
      }
    >
      <item.icon className={mobile ? 'h-5 w-5' : 'h-5 w-5'} />
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-aurora">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-white/10 bg-[#0a0d16]/80 backdrop-blur-xl p-4 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            Call<span className="gradient-text">Zero</span>
          </span>
        </Link>

        <nav className="mt-2 flex flex-col gap-1">
          {mainNav.map((i) => (
            <NavItem key={i.to} item={i} />
          ))}
        </nav>

        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="px-4 pb-2 text-[10px] uppercase tracking-widest text-slate-600">Tools</p>
          <nav className="flex flex-col gap-1">
            {toolsNav.map((i) => (
              <NavItem key={i.to} item={i} />
            ))}
          </nav>
        </div>

        <div className="mt-auto space-y-3">
          <NetworkIndicator online={navigator.onLine} />
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/10 p-3 hover:bg-white/[0.08]"
          >
            <Avatar name={user?.name} src={user?.avatar} size="sm" online={user?.status === 'online'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">@{user?.username}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-slate-500 hover:text-rose-400">
              <LogOut className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0a0d16]/80 backdrop-blur-xl px-4 py-3 lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-white">
            Call<span className="gradient-text">Zero</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <NetworkIndicator online={navigator.onLine} label={connected ? 'Live' : 'Offline'} />
          <Link to="/profile">
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 px-4 py-6 pb-24 lg:pb-8 max-w-6xl mx-auto">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a0d16]/90 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-6">
          {mainNav.map((i) => (
            <NavItem key={i.to} item={i} mobile />
          ))}
        </div>
      </nav>

      <IncomingCallOverlay />
    </div>
  );
}
