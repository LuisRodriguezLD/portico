"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DemoBar, StatusBanners } from "@/components/demo-bar";
import { useSession } from "@/components/use-session";

export function TeacherBoard() {
  return (
    <Suspense fallback={null}>
      <TeacherInner />
    </Suspense>
  );
}

function TeacherInner() {
  const params = useSearchParams();
  const room = params.get("room") ?? "shah";
  const { session, error, offline } = useSession();
  const homeroom = useMemo(() => session?.homerooms.find((item) => item.id === room) ?? session?.homerooms[0], [session, room]);

  if (!session || !homeroom) {
    return (
      <>
        <DemoBar />
        <p style={{ padding: "2rem" }}>Checking dismissal…</p>
      </>
    );
  }

  const quiet = homeroom.called.length === 0 && homeroom.deltas.length === 0;

  return (
    <>
      <DemoBar />
      <StatusBanners delay={session.delay} paused={session.paused} offline={offline} error={error} />
      <main style={{ maxWidth: "40rem", margin: "0 auto", padding: "1.2rem 1rem 3rem" }}>
        <p style={{ color: "var(--muted)", marginBottom: 0 }}>{session.school} · {session.clock}</p>
        <h1 className="display" style={{ fontSize: "2.5rem", marginTop: "0.2rem", fontWeight: 560 }}>{homeroom.label}</h1>
        {quiet ? (
          <section className="card" style={{ padding: "1.5rem" }}>
            <h2 className="display" style={{ fontSize: "2rem", margin: 0 }}>No dismissal changes.</h2>
            <p>Nothing to confirm. Names show up here when the curb calls them.</p>
          </section>
        ) : (
          <>
            {homeroom.deltas.length > 0 ? (
              <section style={{ marginBottom: "1.2rem" }}>
                <h2 style={{ fontSize: "0.85rem", letterSpacing: "0.08em" }}>{homeroom.deltas.length} {homeroom.deltas.length === 1 ? "CHANGE" : "CHANGES"} TODAY</h2>
                {homeroom.deltas.map((delta) => (
                  <p key={delta.id} className="card" style={{ padding: "0.9rem 1rem" }}>
                    <strong>{delta.name}</strong>
                    <br />
                    {delta.detail}
                  </p>
                ))}
              </section>
            ) : null}
            <section>
              <h2 style={{ fontSize: "0.85rem", letterSpacing: "0.08em" }}>CALLED</h2>
              {homeroom.called.length === 0 ? <p>No one from this room has been called.</p> : null}
              {homeroom.called.map((child) => (
                <p key={child.id} className="card" style={{ padding: "1rem 1.1rem", fontSize: "1.8rem", fontWeight: 650 }}>{child.name}</p>
              ))}
            </section>
          </>
        )}
      </main>
    </>
  );
}
