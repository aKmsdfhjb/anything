import { Globe, Plus, RotateCcw } from "lucide-react";

export function MapHeader({ destinationCount, isLoading, onResetView }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-[#0a0f1e] via-[#0a0f1ecc] to-transparent pt-4 px-5 md:px-8 pb-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-7 h-7 text-[#3B82F6]" />
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Tip Globe
          </h1>
          {!isLoading && (
            <span className="bg-[#3B82F6] bg-opacity-20 text-[#3B82F6] text-xs font-bold px-3 py-1 rounded-full">
              {destinationCount} destinations
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/add-tip"
            className="bg-gradient-to-r from-[#FF006E] to-[#8B5CF6] text-white font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Tip</span>
          </a>
          <button
            onClick={onResetView}
            className="bg-[#1E293B] border border-[#334155] text-white p-2 rounded-xl hover:border-[#3B82F6] transition-all"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
