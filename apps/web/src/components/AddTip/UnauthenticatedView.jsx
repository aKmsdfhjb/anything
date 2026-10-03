import { MapPin } from "lucide-react";

export function UnauthenticatedView() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] flex items-center justify-center">
          <MapPin className="w-12 h-12 text-white" fill="white" />
        </div>
        <h1 className="text-3xl font-black text-[#1E1E1E] mb-4">
          Share Your Travel Tips
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Sign in to share your travel experiences and help fellow travelers
          discover amazing places.
        </p>
        <a
          href="/account/signin?callbackUrl=/add-tip"
          className="inline-block bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white font-bold py-4 px-10 rounded-2xl text-lg hover:opacity-90 transition-all"
        >
          Sign In to Continue
        </a>
      </div>
    </div>
  );
}
