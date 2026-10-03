import { AlertTriangle, X } from "lucide-react";

export function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="bg-red-500 bg-opacity-15 border border-red-500 border-opacity-30 rounded-2xl p-4 mb-6 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <p className="text-red-300 text-sm font-semibold">{error}</p>
      <button onClick={onDismiss} className="ml-auto shrink-0">
        <X className="w-4 h-4 text-red-400" />
      </button>
    </div>
  );
}
