"use client";

import { Upload, Check } from "lucide-react";
import { DOC_TYPE_LABELS } from "../constants";

export function DocumentAddForm({
  newDoc,
  setNewDoc,
  fileUrl,
  uploading,
  onFileUpload,
  onCancel,
  onSubmit,
}) {
  return (
    <div className="bg-[#008C8F]/5 rounded-xl p-3 mb-3 space-y-2">
      <input
        type="text"
        placeholder="Document title"
        value={newDoc.title}
        onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#008C8F]"
      />
      <select
        value={newDoc.document_type}
        onChange={(e) =>
          setNewDoc({ ...newDoc, document_type: e.target.value })
        }
        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#008C8F]"
      >
        {Object.entries(DOC_TYPE_LABELS).map(([key, val]) => (
          <option key={key} value={key}>
            {val.icon} {val.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Notes (optional)"
        value={newDoc.notes}
        onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#008C8F]"
      />
      <div className="flex items-center gap-2">
        <label className="flex-1 flex items-center gap-2 bg-white border border-dashed border-gray-300 rounded-lg px-3 py-2.5 cursor-pointer hover:border-[#008C8F] transition-colors">
          <Upload className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400 font-semibold truncate">
            {uploading
              ? "Uploading…"
              : fileUrl
                ? "File uploaded ✓"
                : "Choose file"}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={onFileUpload}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </label>
      </div>
      {fileUrl && (
        <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
          <Check className="w-3 h-3" /> File ready
        </p>
      )}
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="text-[10px] text-gray-500 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={!newDoc.title || !fileUrl}
          className="text-[10px] text-white font-bold bg-[#008C8F] px-3 py-1.5 rounded-lg hover:bg-[#008C8F]/90 disabled:opacity-50"
        >
          Save Document
        </button>
      </div>
    </div>
  );
}
