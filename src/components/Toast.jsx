import { Check, X } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  return (
    <div className={`toast ${toast.type}`}>
      <span className="toast-mark">
        {toast.type === 'error' ? <X size={14} /> : <Check size={14} />}
      </span>
      {toast.message}
      <button onClick={onDismiss} aria-label="Dismiss notification"><X size={14} /></button>
    </div>
  );
}
