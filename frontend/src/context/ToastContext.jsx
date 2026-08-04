import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // cleanup on unmount
  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  const COLORS = {
    success: { bg: '#052e16', border: '#22c55e', text: '#4ade80', icon: '✓' },
    error: { bg: '#450a0a', border: '#ef4444', text: '#f87171', icon: '✕' },
    warning: { bg: '#422006', border: '#f59e0b', text: '#fbbf24', icon: '⚠' },
    info: { bg: '#0c1a2e', border: '#3b82f6', text: '#60a5fa', icon: 'ℹ' },
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 380,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          const c = COLORS[t.type] || COLORS.info;
          return (
            <div
              key={t.id}
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${c.border}`,
                borderRadius: 10,
                padding: '12px 16px',
                boxShadow: `0 8px 24px -4px ${c.border}30`,
                pointerEvents: 'all',
                animation: 'toastSlideIn 0.2s ease-out',
                maxWidth: 380,
              }}
            >
              <span style={{ color: c.icon === '✓' ? '#22c55e' : c.text, fontSize: 16, fontWeight: 700, lineHeight: 1.3, flexShrink: 0 }}>
                {c.icon}
              </span>
              <span style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
                {t.message}
              </span>
              <button
                onClick={() => dismiss(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: '0 0 0 4px',
                  flexShrink: 0,
                }}
                aria-label="Tutup notifikasi"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
