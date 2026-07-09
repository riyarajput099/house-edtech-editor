"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    toast.success("Logged out successfully");

    router.push("/login");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">
        🎉 Welcome to Dashboard
      </h1>

      <Button onClick={handleLogout}>
        Logout
      </Button>
    </main>
  );
}