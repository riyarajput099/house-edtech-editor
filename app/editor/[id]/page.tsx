"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { useDebounce } from "@/hooks/useDebounce";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncQueue } from "@/hooks/useSyncQueue";
import VersionHistory from "@/components/ui/editor/VersionHistory";
import ShareDocumentDialog from "@/components/ui/editor/ShareDocumentDialog";

import { saveDocumentLocally } from "@/lib/database/documentStorage";
import { addToSyncQueue } from "@/lib/database/syncQueue";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<"OWNER" | "EDITOR" | "VIEWER" | null>(null);

  const isOnline = useOnlineStatus();

  // ✅ Start background sync
  useSyncQueue();

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  // Load document
  useEffect(() => {
    fetchDocument();
  }, [id]);

  async function fetchDocument() {
    try {
      const response = await fetch(`/api/documents/${id}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to load document");
        return;
      }

      setTitle(data.document.title);
      setContent(data.document.content);
      setRole(data.role);
    } catch {
      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  }

  // Auto Save (after debounce)
  useEffect(() => {
    if (!loading) {
      saveDocument();
    }
  }, [debouncedTitle, debouncedContent]);

  async function saveDocument() {
    if (role === "VIEWER") return;
    try {
      setSaving(true);

      // Save in IndexedDB
      await saveDocumentLocally({
        id,
        title,
        content,
      });

      if (isOnline) {
        // Sync immediately
        const response = await fetch(`/api/documents/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || "You have read-only access.");
        }
      } else {
        // Queue for sync later
        await addToSyncQueue({
          id: crypto.randomUUID(),
          documentId: id,
          action: "UPDATE",
          payload: {
            title,
            content,
          },
        });

        toast.info("Saved locally. Will sync when online.");
      }
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
  <div className="mb-6 flex items-center justify-between">

  <div className="flex items-center gap-4">

    <div className="text-sm text-gray-500">
      {saving ? "Saving..." : "Saved ✓"}
    </div>

    <div
      className={`rounded px-3 py-1 text-sm font-medium ${
        isOnline
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {isOnline ? "🟢 Online" : "🔴 Offline"}
    </div>

  </div>

  <div className="flex items-center gap-2">

    {role !== "VIEWER" && (
      <VersionHistory
        documentId={id}
      />
    )}

    {role === "OWNER" && (
      <ShareDocumentDialog
        documentId={id}
      />
    )}

  </div>

</div>

      {role === "VIEWER" && (
        <div className="mb-4 rounded bg-yellow-100 p-3 text-sm text-yellow-800 text-center font-medium">
          This document is read only.
        </div>
      )}

      <input
        className="w-full border-b pb-2 mb-8 text-4xl font-bold outline-none disabled:bg-transparent disabled:opacity-70"
        placeholder="Untitled Document"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={role === "VIEWER"}
      />

      <textarea
        className="min-h-[500px] w-full resize-none text-lg outline-none disabled:bg-transparent disabled:opacity-70"
        placeholder="Start typing..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={role === "VIEWER"}
      />
    </div>
  );
}