"use client";

import { Suspense } from "react";
import { DemoBar, StatusBanners } from "@/components/demo-bar";
import { useSession } from "@/components/use-session";

export function PorchBoard() {
  return (
    <Suspense fallback={null}>
      <PorchInner />
    </Suspense>
  );
}

function PorchInner() {
  const { session, error, offline } = useSession();
  if (!session) return <div className="porch" style={{ padding: "2rem" }}>Checking dismissal…</div>;

  return (
    <div className="porch">
      <DemoBar />
      <StatusBanners delay={session.delay} paused={session.paused} offline={offline} error={error} />
      <main style={{ padding: "1.5rem 2rem 3rem" }}>
        <p style={{ letterSpacing: "0.14em", marginBottom: 0 }}>{session.school.toUpperCase()}</p>
        <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", margin: "0.2rem 0 1rem" }}>Called</h1>
        {session.porch.called.length === 0 ? <p style={{ fontSize: "2rem", opacity: 0.7 }}>Waiting for the next car.</p> : null}
        <div style={{ display: "grid", gap: "0.4rem" }}>
          {session.porch.called.map((child) => (
            <div key={child.id} style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>
              {child.name} <span style={{ opacity: 0.6, fontSize: "0.55em" }}>{child.grade}</span>
            </div>
          ))}
        </div>
        {session.porch.holds.length > 0 ? (
          <section style={{ marginTop: "2.5rem" }}>
            <h2 style={{ fontSize: "2.4rem" }}>Hold</h2>
            {session.porch.holds.map((child) => (
              <div key={child.id} style={{ fontSize: "2rem" }}>{child.name} · {child.reason}</div>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}
