import { LogOut } from "lucide-react";

export function SignOutButton({ onSignOut }) {
  return (
    <button
      onClick={onSignOut}
      className="w-full bg-white border border-gray-200 text-red-500 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-all text-sm"
    >
      <LogOut className="w-4 h-4" /> Sign Out
    </button>
  );
}
