"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Version {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function VersionHistory({
  documentId,
}: {
  documentId: string;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchVersions() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/documents/${documentId}/versions`
      );

      const data = await response.json();

      if (response.ok) {
        setVersions(data.versions);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          History
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>

        {loading && <p>Loading...</p>}

        {!loading && versions.length === 0 && (
          <p>No versions found.</p>
        )}

        {versions.map((version) => (
          <div
            key={version.id}
            className="rounded border p-3 mb-3"
          >
            <h3 className="font-semibold">
              {version.title}
            </h3>

            <p className="text-xs text-gray-500">
              {new Date(version.createdAt).toLocaleString()}
            </p>

            <p className="mt-2 text-sm line-clamp-3">
              {version.content}
            </p>

            <Button
              className="mt-3"
              size="sm"
              onClick={() => restoreVersion(version.id)}
            >
              Restore
            </Button>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );

  async function restoreVersion(versionId: string) {
    const response = await fetch(
      `/api/documents/${documentId}/restore`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          versionId,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success("Version Restored");
      window.location.reload();
    } else {
      toast.error(data.message);
    }
  }
}