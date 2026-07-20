import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function Toast({ toasts, onClose }: ToastProps) {
  return (
    <div id="toast-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              id={`toast-${toast.id}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-white shadow-xl border-slate-100"
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess ? (
                  <CheckCircle2 id={`toast-success-icon-${toast.id}`} className="h-5 w-5 text-emerald-500" />
                ) : isWarning ? (
                  <AlertTriangle id={`toast-warning-icon-${toast.id}`} className="h-5 w-5 text-green-700" />
                ) : (
                  <Info id={`toast-info-icon-${toast.id}`} className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="flex-grow">
                <p id={`toast-text-${toast.id}`} className="text-sm font-medium text-slate-800 leading-tight">
                  {toast.message}
                </p>
              </div>
              <button
                id={`toast-close-btn-${toast.id}`}
                onClick={() => onClose(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
