"use client";

export function ChecklistProgress({ packedCount, totalCount }) {
  const percentage = (packedCount / totalCount) * 100;

  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
