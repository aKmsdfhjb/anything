"use client";

import { DOC_TYPE_LABELS } from "../constants";
import { DocumentItem } from "./DocumentItem";

export function DocumentTypeGroup({ type, documents, onDelete }) {
  const typeInfo = DOC_TYPE_LABELS[type] || DOC_TYPE_LABELS.other;

  return (
    <div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
        {typeInfo.icon} {typeInfo.label}
      </p>
      <div className="space-y-1">
        {documents.map((doc) => (
          <DocumentItem key={doc.id} document={doc} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
