"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

type NavbarProps = {
  userName?: string;
  onLogout?: () => void;
};

export default function Navbar({
  userName = "Riya",
  onLogout,
}: NavbarProps) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold">
            House of EdTech Editor
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium">
            👋 {userName}
          </span>

          <Button
            variant="outline"
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}