import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

let seed = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', duration = 3800) => {
      const id = ++seed;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
    warning: (m) => push(m, 'warning'),
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    error: <XCircle className="h-5 w-5 text-rose-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    info: <Info className="h-5 w-5 text-cyan-400" />,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-96">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              className="glass-strong flex items-start gap-3 rounded-2xl px-4 py-3"
            >
              {icons[t.type]}
              <p className="flex-1 text-sm text-slate-100">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-slate-500 hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
