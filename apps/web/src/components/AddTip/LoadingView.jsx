import { Loader2 } from "lucide-react";

export function LoadingView() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <Loader2
        className="w-10 h-10 text-[#008C8F]"
        data-testid="loading-spinner"
      />
    </div>
  );
}
