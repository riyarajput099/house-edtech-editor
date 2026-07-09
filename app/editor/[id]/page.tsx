"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface DocumentType {
  id: string;
  title: string;
  content: string;
}

export default function EditorPage() {
  const { id } = useParams();

  const [document, setDocument] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, []);

  async function fetchDocument() {
    try {
      const response = await fetch(`/api/documents/${id}`);
      const data = await response.json();

      if (response.ok) {
        setDocument(data.document);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  }

  async function saveDocument(updatedDocument: DocumentType) {
    try {
      setSaving(true);

      await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: updatedDocument.title,
          content: updatedDocument.content,
        }),
      });
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-10">

      <div className="mb-4 text-sm text-gray-500">
        {saving ? "Saving..." : "Saved"}
      </div>

      <input
        className="w-full text-4xl font-bold outline-none mb-8"
        value={document?.title || ""}
        onChange={(e) => {
          if (!document) return;

          const updated = {
            ...document,
            title: e.target.value,
          };

          setDocument(updated);
          saveDocument(updated);
        }}
      />

      <textarea
        className="w-full min-h-[500px] outline-none resize-none text-lg"
        placeholder="Start typing..."
        value={document?.content || ""}
        onChange={(e) => {
          if (!document) return;

          const updated = {
            ...document,
            content: e.target.value,
          };

          setDocument(updated);
          saveDocument(updated);
        }}
      />

    </div>
  );
}