import { CheckCircle, Shield } from "lucide-react";

export function SuccessScreen({ onAddAnother }) {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-black text-[#1E1E1E] mb-4">
          Tip Submitted! 🎉
        </h1>
        <p className="text-gray-500 text-lg mb-3 leading-relaxed">
          Thanks for sharing your travel knowledge! Your tip has been sent to
          our moderators for review.
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-[#008C8F]" />
            <span className="text-[#1E1E1E] font-bold">What happens next?</span>
          </div>
          <ul className="text-left text-sm text-gray-500 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#008C8F] mt-1">•</span>Our team will review
              your tip for quality and accuracy
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#008C8F] mt-1">•</span>Approved tips go
              live for all travelers to see
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#008C8F] mt-1">•</span>You'll earn
              reputation points when your tip is approved
            </li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onAddAnother}
            className="flex-1 bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white font-bold py-4 rounded-2xl text-lg hover:opacity-90 transition-all"
          >
            Add Another Tip
          </button>
          <a
            href="/"
            className="flex-1 bg-white border border-gray-200 text-[#1E1E1E] font-bold py-4 rounded-2xl text-lg hover:border-[#7DE2D1] transition-all text-center"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
