"use client";

import { Plus } from "lucide-react";
import { useTripDocuments } from "@/hooks/useTripDocuments";
import { LoadingSpinner } from "../LoadingSpinner";
import { EmptyState } from "../EmptyState";
import { DocumentAddForm } from "./DocumentAddForm";
import { DocumentTypeGroup } from "./DocumentTypeGroup";

export function DocumentsSection({ trip }) {
  const {
    documents,
    grouped,
    isLoading,
    uploading,
    showAdd,
    setShowAdd,
    newDoc,
    setNewDoc,
    fileUrl,
    handleFileUpload,
    handleSubmitDoc,
    deleteMutation,
  } = useTripDocuments(trip.id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-black text-gray-900">Travel Documents</h4>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-[10px] font-bold text-[#008C8F] bg-[#008C8F]/5 px-2.5 py-1.5 rounded-lg hover:bg-[#008C8F]/10 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Upload
        </button>
      </div>

      {showAdd && (
        <DocumentAddForm
          newDoc={newDoc}
          setNewDoc={setNewDoc}
          fileUrl={fileUrl}
          uploading={uploading}
          onFileUpload={handleFileUpload}
          onCancel={() => setShowAdd(false)}
          onSubmit={handleSubmitDoc}
        />
      )}

      {documents.length === 0 ? (
        <EmptyState
          emoji="📂"
          title="No documents yet"
          subtitle="Upload tickets, visas, and booking confirmations"
        />
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([type, docs]) => (
            <DocumentTypeGroup
              key={type}
              type={type}
              documents={docs}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
