"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface DocumentType {
  id: string;
  title: string;
  content: string;
}

export function useDocument(id: string) {
  const [document, setDocument] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  async function fetchDocument() {
    try {
      const response = await fetch(`/api/documents/${id}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      setDocument(data.document);
    } catch {
      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  }

  return {
    document,
    setDocument,
    loading,
  };
}