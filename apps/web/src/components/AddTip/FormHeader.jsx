import { ArrowLeft } from "lucide-react";

export function FormHeader() {
  return (
    <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] px-5 md:px-8 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <a
            href="/"
            className="bg-white bg-opacity-20 p-2 rounded-xl hover:bg-opacity-30 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </a>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Share a Travel Tip
            </h1>
            <p className="text-white text-opacity-80 text-sm mt-1">
              Help fellow travelers with your local knowledge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
