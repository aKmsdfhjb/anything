import { CheckCircle, Loader2 } from "lucide-react";

export function SubmitButton({ onSubmit, isSubmitting, disabled }) {
  return (
    <>
      <button
        onClick={onSubmit}
        disabled={isSubmitting || disabled}
        className="w-full bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white font-black py-5 rounded-2xl text-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5" />
            Submitting...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Submit Tip for Review
          </>
        )}
      </button>

      <p className="text-center text-[#6B7280] text-xs mt-4 mb-8">
        By submitting, you confirm this tip is based on your real experience and
        agree to our community guidelines.
      </p>
    </>
  );
}
