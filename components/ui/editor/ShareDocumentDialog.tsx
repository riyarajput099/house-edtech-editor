"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Share2 } from "lucide-react";

interface Props {
  documentId: string;
}

export default function ShareDocumentDialog({
  documentId,
}: Props) {
  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState("");

  const [role, setRole] = useState<"EDITOR" | "VIEWER">(
    "EDITOR"
  );

  const [loading, setLoading] = useState(false);

  async function handleShare() {
    if (!email.trim()) {
      toast.error("Please enter email");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/documents/${documentId}/share`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Collaborator invited successfully");

      setEmail("");
      setRole("EDITOR");

      setOpen(false);

    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>

        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>

      </DialogTrigger>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            Share Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <Input
            placeholder="Enter collaborator email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <Select
            value={role}
            onValueChange={(value) =>
              setRole(value as "EDITOR" | "VIEWER")
            }
          >
            <SelectTrigger>

              <SelectValue />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="EDITOR">
                Editor
              </SelectItem>

              <SelectItem value="VIEWER">
                Viewer
              </SelectItem>

            </SelectContent>

          </Select>

        </div>

        <DialogFooter>

          <Button
            onClick={handleShare}
            disabled={loading}
          >
            {loading ? "Inviting..." : "Invite"}
          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>
  );
}