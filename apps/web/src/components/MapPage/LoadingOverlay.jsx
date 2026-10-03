import { Globe } from "lucide-react";

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-40 bg-[#0a0f1e] bg-opacity-80 flex items-center justify-center">
      <div className="text-center">
        <Globe className="w-16 h-16 text-[#3B82F6] mx-auto mb-4" />
        <p className="text-white font-bold text-lg">Loading the globe...</p>
        <p className="text-[#64748B] text-sm mt-2">
          Fetching tips from around the world
        </p>
      </div>
    </div>
  );
}
