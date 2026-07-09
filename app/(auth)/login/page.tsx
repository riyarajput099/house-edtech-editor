"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message);
      setTimeout(() => {
  router.push("/dashboard");
}, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <Button
            className="w-full"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:underline"
            >
              Register
            </Link>
          </p>

        </CardContent>
      </Card>
    </main>
  );
}