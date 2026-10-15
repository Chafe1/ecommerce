import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext.js';

export function ToastContainer() {
  const { toasts, dismissToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border text-sm transition-all animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-stone-900 text-stone-100 border-stone-800'
                : isError
                ? 'bg-rose-950 text-rose-100 border-rose-900'
                : 'bg-stone-900 text-stone-100 border-stone-800'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs leading-relaxed">{toast.message}</div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-stone-400 hover:text-white transition-colors cursor-pointer p-0.5"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
