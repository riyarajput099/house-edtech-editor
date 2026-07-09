
"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import {
  getSyncQueue,
  removeFromSyncQueue,
} from "@/lib/database/syncQueue";

export function useSyncQueue() {
  useEffect(() => {
    async function syncDocuments() {
      try {
        const queue = await getSyncQueue();

        if (queue.length === 0) return;

        for (const item of queue) {
          const response = await fetch(
            `/api/documents/${item.documentId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(item.payload),
            }
          );

          if (response.ok) {
            await removeFromSyncQueue(item.id);
          }
        }

        toast.success("✅ All offline changes synced!");
      } catch (error) {
        console.log(error);
      }
    }

    window.addEventListener("online", syncDocuments);

    return () => {
      window.removeEventListener("online", syncDocuments);
    };
  }, []);
}