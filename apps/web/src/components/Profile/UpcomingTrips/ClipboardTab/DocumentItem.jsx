"use client";

import { FileText, Eye, Trash2 } from "lucide-react";

export function DocumentItem({ document, onDelete }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50 group transition-colors">
      <FileText className="w-4 h-4 text-[#008C8F] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900 truncate">
          {document.title}
        </p>
        {document.notes && (
          <p className="text-[10px] text-gray-400 truncate">{document.notes}</p>
        )}
      </div>
      <a
        href={document.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#008C8F] hover:text-[#007073] p-1 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <Eye className="w-3.5 h-3.5" />
      </a>
      <button
        onClick={() => onDelete(document.id)}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-0.5"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
