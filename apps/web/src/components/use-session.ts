"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apply } from "@/lib/reduce";
import { present } from "@/lib/present";
import { seed } from "@/lib/seed";
import type { Action, PublicSession, Session } from "@/lib/types";

const STORAGE_KEY = "portico-demo-v2";
const CHANNEL_NAME = "portico-demo";

function readStored(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.vehicles || !parsed.attendance || !parsed.menu) return seed();
    return parsed;
  } catch {
    return seed();
  }
}

export function useSession() {
  const [session, setSession] = useState<PublicSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rawRef = useRef<Session>(seed());

  const publish = useCallback((next: Session) => {
    rawRef.current = next;
    setSession(present(next));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setError("This browser could not save the afternoon.");
    }
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(next);
    channel.close();
  }, []);

  useEffect(() => {
    publish(readStored());
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<Session>) => {
      if (!event.data?.vehicles) return;
      rawRef.current = event.data;
      setSession(present(event.data));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      const parsed = JSON.parse(event.newValue) as Session;
      rawRef.current = parsed;
      setSession(present(parsed));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      channel.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [publish]);

  function act(action: Action) {
    setError(null);
    const result = apply(rawRef.current, action);
    publish(result.session);
    if (result.error) setError(result.error);
    return result;
  }

  return { session, error, offline: false, pending: false, act, clearError: () => setError(null) };
}
