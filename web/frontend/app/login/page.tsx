"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function Login() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) {
      setError("Enter your user ID");
      return;
    }
    window.localStorage.setItem("afyadrop_user_id", userId.trim());
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-[70vh] items-center bg-cream py-16">
      <div className="container-site max-w-md">
        <Card>
          <h1 className="text-2xl font-bold text-teal">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in with your Afya Drop user ID.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <Input
              id="uid"
              label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="your account id"
              hint="The ID you received after registering."
              required
            />
            <Button type="submit" className="w-full">Continue</Button>
            {error && <p className="error-text">{error}</p>}
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-teal underline">Register</Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
