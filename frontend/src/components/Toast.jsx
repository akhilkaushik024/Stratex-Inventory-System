import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon = {
          success: CheckCircle,
          error: XCircle,
          info: Info
        }[toast.type] || Info;

        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <Icon size={18} />
            <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.2rem',
                opacity: 0.7
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
