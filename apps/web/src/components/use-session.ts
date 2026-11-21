"use client";

import { useCallback, useEffect, useState } from "react";
import type { Action, PublicSession } from "@/lib/types";

export function useSession() {
  const [session, setSession] = useState<PublicSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/session", { cache: "no-store" });
      if (!response.ok) throw new Error("status");
      const body = (await response.json()) as { session: PublicSession };
      setSession(body.session);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      if (!pending) void refresh();
    }, 1000);
    return () => clearInterval(timer);
  }, [pending, refresh]);

  async function act(action: Action) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const body = (await response.json()) as { session: PublicSession; error?: string };
      setSession(body.session);
      setOffline(false);
      if (body.error) setError(body.error);
      return body;
    } catch {
      setOffline(true);
      setError("Can't reach the curb. Use the paper roster if this lasts.");
      return null;
    } finally {
      setPending(false);
    }
  }

  return { session, error, offline, pending, act, clearError: () => setError(null) };
}
