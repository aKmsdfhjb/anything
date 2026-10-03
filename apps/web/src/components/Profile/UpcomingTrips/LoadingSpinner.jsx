"use client";

export function LoadingSpinner() {
  return (
    <div className="p-6 text-center">
      <div
        className="w-6 h-6 border-2 border-[#008C8F] border-t-transparent rounded-full mx-auto"
        style={{ animation: "spin 1s linear infinite" }}
      />
    </div>
  );
}
