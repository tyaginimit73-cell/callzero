import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import LoadingScreen from './components/ui/LoadingScreen.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Lazy-load route chunks for performance (code splitting)
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Call = lazy(() => import('./pages/Call.jsx'));
const VideoCall = lazy(() => import('./pages/VideoCall.jsx'));
const Messages = lazy(() => import('./pages/Messages.jsx'));
const Contacts = lazy(() => import('./pages/Contacts.jsx'));
const Emergency = lazy(() => import('./pages/Emergency.jsx'));
const NetworkTest = lazy(() => import('./pages/NetworkTest.jsx'));
const Security = lazy(() => import('./pages/Security.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Pricing = lazy(() => import('./pages/Pricing.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function withLazy(el) {
  return <Suspense fallback={<LoadingScreen />}>{el}</Suspense>;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={withLazy(<Landing />)} />
      <Route path="/login" element={withLazy(<Login />)} />
      <Route path="/register" element={withLazy(<Register />)} />
      <Route path="/pricing" element={withLazy(<Pricing />)} />

      {/* Protected app shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={withLazy(<Dashboard />)} />
        <Route path="/call" element={withLazy(<Call />)} />
        <Route path="/video-call" element={withLazy(<VideoCall />)} />
        <Route path="/messages" element={withLazy(<Messages />)} />
        <Route path="/contacts" element={withLazy(<Contacts />)} />
        <Route path="/emergency" element={withLazy(<Emergency />)} />
        <Route path="/network-test" element={withLazy(<NetworkTest />)} />
        <Route path="/security" element={withLazy(<Security />)} />
        <Route path="/settings" element={withLazy(<Settings />)} />
        <Route path="/profile" element={withLazy(<Profile />)} />
      </Route>

      {/* Admin (separately protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute admin>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={withLazy(<Admin />)} />
      </Route>

      <Route path="*" element={withLazy(<NotFound />)} />
    </Routes>
  );
}
