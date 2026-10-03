"use client";

export function EmptyState({ emoji, title, subtitle }) {
  return (
    <div className="text-center py-8">
      <p className="text-3xl mb-2">{emoji}</p>
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
