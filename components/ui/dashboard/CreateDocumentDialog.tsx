"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  onDocumentCreated: () => void;
}

export default function CreateDocumentDialog({
  onDocumentCreated,
}: Props) {

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter document title");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Document created!");

      setTitle("");

      setOpen(false);

      // Refresh document list only
onDocumentCreated();

    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </DialogTrigger>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Enter document title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>

      </DialogContent>

    </Dialog>
  );
}