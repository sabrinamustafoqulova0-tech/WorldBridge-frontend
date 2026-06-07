"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useAuthStore } from "../../../store/authStore";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const error = searchParams.get("error");

    if (error || !access_token || !refresh_token) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    useAuthStore.getState().login(access_token, refresh_token, {
      id: 0,
      email: "",
      full_name: "",
      country: "",
      is_admin: false,
    });

    router.replace("/home");
  }, [searchParams, router]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--muted)]">Выполняем вход...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
