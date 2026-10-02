import React from 'react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  const typeConfig = {
    success: {
      style: 'bg-emerald-800 text-white border-emerald-700',
      icon: 'fa-circle-check text-emerald-400'
    },
    error: {
      style: 'bg-rose-800 text-white border-rose-700',
      icon: 'fa-circle-exclamation text-rose-400'
    },
    info: {
      style: 'bg-slate-900 text-white border-slate-700',
      icon: 'fa-circle-info text-indigo-400'
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        const conf = typeConfig[toast.type] || typeConfig.info;
        return (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl text-xs border shadow-xl flex items-center justify-between gap-3 pointer-events-auto transition-all transform animate-slideUp ${conf.style}`}
          >
            <div className="flex items-center gap-2.5">
              <i className={`fa-solid ${conf.icon} text-sm`}></i>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
}
