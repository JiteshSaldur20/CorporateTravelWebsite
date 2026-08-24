import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

const TOAST_STYLES = {
  success: { icon: 'fa-check-circle', iconColor: '#627b68', borderColor: '#a4c5a9' },
  danger:  { icon: 'fa-exclamation-circle', iconColor: '#c0392b', borderColor: '#c0392b' },
  warning: { icon: 'fa-exclamation-triangle', iconColor: '#f29a69', borderColor: '#f29a69' },
  info:    { icon: 'fa-info-circle', iconColor: '#9bbbd0', borderColor: '#9bbbd0' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Bottom-right toast container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => {
          const s = TOAST_STYLES[toast.type] || TOAST_STYLES.info
          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                background: 'rgba(23, 35, 31, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderLeft: `3px solid ${s.borderColor}`,
                borderRadius: '6px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
                color: '#fff9f1',
                fontSize: '13px',
                fontWeight: 400,
                fontFamily: "'IBM Plex Sans', sans-serif",
                minWidth: '280px',
                maxWidth: '400px',
                cursor: 'pointer',
                animation: 'toastSlideIn 0.35s cubic-bezier(.23,1,.32,1) both',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
            >
              <i className={`fas ${s.icon}`} style={{ color: s.borderColor, fontSize: '15px', flexShrink: 0 }} />
              <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
              <i
                className="fas fa-times"
                style={{ color: '#879087', fontSize: '11px', flexShrink: 0, padding: '4px' }}
              />
            </div>
          )
        })}
      </div>
      {/* Toast animation keyframes */}
      <style>{`
        @keyframes toastSlideIn {
          0% { opacity: 0; transform: translateX(20px) translateY(8px); }
          100% { opacity: 1; transform: translateX(0) translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
