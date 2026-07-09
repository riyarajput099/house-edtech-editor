"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { saveDocumentLocally } from "@/lib/database/documentStorage";
import { addToSyncQueue } from "@/lib/database/syncQueue";

interface Props {
  id: string;
  title: string;
  content: string;
  isOnline: boolean;
}

export function useAutoSave({
  id,
  title,
  content,
  isOnline,
}: Props) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setSaving(true);

        await saveDocumentLocally({
          id,
          title,
          content,
        });

        if (isOnline) {
          await fetch(`/api/documents/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              content,
            }),
          });
        } else {
          await addToSyncQueue({
            id: crypto.randomUUID(),
            documentId: id,
            action: "UPDATE",
            payload: {
              title,
              content,
            },
          });
        }
      } catch {
        toast.error("Auto Save Failed");
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [id, title, content, isOnline]);

  return saving;
}