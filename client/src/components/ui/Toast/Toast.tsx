import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { IconButton } from '../Button/IconButton';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="toast__icon toast__icon--success" />;
    case 'error':
      return <XCircle className="toast__icon toast__icon--error" />;
    case 'warning':
      return <AlertCircle className="toast__icon toast__icon--warning" />;
    case 'info':
    default:
      return <Info className="toast__icon toast__icon--info" />;
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${nextId.current++}`;
    setToasts((prev) => [...prev, { ...toast, id }]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {createPortal(
        <div className="toast-container" role="region" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={clsx('toast', `toast--${toast.type}`)}>
              <div className="toast__icon-wrapper">
                <ToastIcon type={toast.type} />
              </div>
              <div className="toast__content">
                <h4 className="toast__title">{toast.title}</h4>
                {toast.description && <p className="toast__description">{toast.description}</p>}
              </div>
              <IconButton
                icon={<X size={16} />}
                aria-label="Close toast"
                onClick={() => removeToast(toast.id)}
                className="toast__close"
              />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
