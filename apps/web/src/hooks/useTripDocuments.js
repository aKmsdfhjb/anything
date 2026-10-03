import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUpload from "@/utils/useUpload";

export function useTripDocuments(tripId) {
  const queryClient = useQueryClient();
  const [upload, { loading: uploading }] = useUpload();
  const [showAdd, setShowAdd] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: "",
    document_type: "flight",
    notes: "",
  });
  const [fileUrl, setFileUrl] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["trip-documents", tripId],
    queryFn: async () => {
      const res = await fetch(`/api/trip-documents?trip_id=${tripId}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (doc) => {
      const res = await fetch("/api/trip-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      if (!res.ok) throw new Error("Failed to add document");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip-documents", tripId] });
      setShowAdd(false);
      setNewDoc({ title: "", document_type: "flight", notes: "" });
      setFileUrl("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/trip-documents?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["trip-documents", tripId] }),
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload({ file });
    if (result?.url) {
      setFileUrl(result.url);
    }
  };

  const handleSubmitDoc = () => {
    if (!newDoc.title || !fileUrl) return;
    addMutation.mutate({
      trip_id: tripId,
      title: newDoc.title,
      document_type: newDoc.document_type,
      file_url: fileUrl,
      file_type: fileUrl.split(".").pop() || "pdf",
      notes: newDoc.notes || null,
    });
  };

  const documents = data?.documents || [];

  const grouped = useMemo(() => {
    const map = {};
    documents.forEach((doc) => {
      const type = doc.document_type;
      if (!map[type]) map[type] = [];
      map[type].push(doc);
    });
    return map;
  }, [documents]);

  return {
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
  };
}
