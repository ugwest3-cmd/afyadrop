"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        router.replace(next);
      }
    });

    // Fallback in case the event already fired before this component mounted.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next);
    });

    return () => listener.subscription.unsubscribe();
  }, [router, next]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-cream">
      <p className="text-sm text-muted">Signing you in…</p>
    </main>
  );
}

// Handles the redirect back from email magic links. Supabase's client library
// automatically exchanges the code in the URL hash for a session cookie.
export default function AuthCallback() {
  return (
    <Suspense fallback={<main className="flex min-h-[70vh] items-center justify-center bg-cream" />}>
      <CallbackInner />
    </Suspense>
  );
}
