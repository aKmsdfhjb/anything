import { Users } from "lucide-react";

export function UnauthenticatedView() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 bg-gradient-to-br from-[#008C8F] to-[#7DE2D1] rounded-full flex items-center justify-center mb-6">
        <Users className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome to Tip Trip
      </h2>
      <p className="text-gray-500 mb-8 text-center">
        Sign in to set up your profile, find friends, and plan holidays
        together.
      </p>
      <a
        href="/account/signin"
        className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white px-10 py-3.5 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-teal-200 transition-all"
      >
        Sign In
      </a>
    </div>
  );
}
