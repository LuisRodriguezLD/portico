"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DemoBar, StatusBanners } from "@/components/demo-bar";
import { useSession } from "@/components/use-session";
import type { AttendanceStatus } from "@/lib/types";

const STATUSES: AttendanceStatus[] = ["present", "absent", "tardy", "excused"];

export function AttendanceBoard() {
  return (
    <Suspense fallback={null}>
      <AttendanceInner />
    </Suspense>
  );
}

function AttendanceInner() {
  const params = useSearchParams();
  const { session, error, act } = useSession();
  const [room, setRoom] = useState(params.get("room") ?? "shah");
  const rolls = useMemo(() => session?.rolls.filter((row) => row.homeroomId === room) ?? [], [session, room]);
  const homeroom = session?.homerooms.find((item) => item.id === room);

  if (!session) {
    return (
      <>
        <DemoBar />
        <p style={{ padding: "2rem" }}>Opening the roll…</p>
      </>
    );
  }

  return (
    <>
      <DemoBar />
      <StatusBanners delay={session.delay} paused={session.paused} offline={false} error={error} />
      <main style={{ maxWidth: "40rem", margin: "0 auto", padding: "1.2rem 1rem 3rem" }}>
        <p style={{ color: "var(--muted)", marginBottom: 0 }}>Morning roll · {session.dateLabel}</p>
        <h1 className="display" style={{ fontSize: "2.4rem", marginTop: "0.2rem", fontWeight: 560 }}>{homeroom?.label ?? "Homeroom"}</h1>
        <label>
          Room{" "}
          <select className="texty" style={{ width: "auto" }} value={room} onChange={(event) => setRoom(event.target.value)}>
            {session.homerooms.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <div style={{ display: "grid", gap: "0.7rem", marginTop: "1rem" }}>
          {rolls.map((row) => (
            <article key={row.studentId} className="card" style={{ padding: "0.9rem 1rem" }}>
              <strong>{row.name}</strong>
              <div style={{ color: "var(--muted)" }}>{row.grade} · {row.status}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.55rem" }}>
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    className="quiet"
                    type="button"
                    aria-pressed={row.status === status}
                    onClick={() => act({ type: "mark_attendance", studentId: row.studentId, status, staffId: "james" })}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        <button className="tap primary" type="button" style={{ marginTop: "1rem" }} onClick={() => act({ type: "submit_roll", homeroomId: room, staffId: "james" })}>
          Mark the rest present
        </button>
        <p style={{ color: "var(--muted)" }}>An absent student drops off the carline. The parent sees the change inside the app, not on the lock screen.</p>
      </main>
    </>
  );
}
