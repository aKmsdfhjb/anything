import { Camera, X, Plus, Loader2 } from "lucide-react";

export function PhotoUpload({
  photos,
  onPhotoUpload,
  onRemovePhoto,
  uploadLoading,
  fileInputRef,
}) {
  return (
    <div className="mb-8">
      <label className="text-[#1E1E1E] font-bold text-sm mb-3 block">
        <Camera className="w-4 h-4 inline mr-2 text-[#008C8F]" />
        Photos
        <span className="text-gray-400 font-normal ml-2">
          (up to 5 — helps build trust!)
        </span>
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {photos.map((url, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-2xl overflow-hidden group"
          >
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onRemovePhoto(index)}
              className="absolute top-2 right-2 bg-black bg-opacity-60 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        {photos.length < 5 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLoading}
            className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-[#7DE2D1] transition-all bg-white"
          >
            {uploadLoading ? (
              <Loader2 className="w-6 h-6 text-[#008C8F]" />
            ) : (
              <>
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-gray-400 text-xs font-bold">Add</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onPhotoUpload}
        className="hidden"
      />
    </div>
  );
}
