import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

/**
 * Central Socket.IO client.
 * Exposes the socket, an onlineUsers map (userId -> online), and an
 * incomingCall descriptor so any page can render an incoming-call UI.
 */
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [incomingCall, setIncomingCall] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

       const token = localStorage.getItem('callzero_token');
       const API_URL = import.meta.env.VITE_API_URL || '/';

    const s = io(API_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = s;

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', () => setConnected(false));

    s.on('user:online', ({ userId }) =>
      setOnlineUsers((m) => new Map(m).set(userId, true))
    );
    s.on('user:offline', ({ userId }) => {
      setOnlineUsers((m) => {
        const n = new Map(m);
        n.delete(userId);
        return n;
      });
    });

    s.on('call:incoming', (payload) => setIncomingCall(payload));

    setSocket(s);
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // clear incoming call when handled elsewhere
  const clearIncomingCall = () => setIncomingCall(null);

  return (
    <SocketContext.Provider
      value={{ socket, connected, onlineUsers, incomingCall, setIncomingCall, clearIncomingCall }}
    >
      {children}
    </SocketContext.Provider>
  );
}
