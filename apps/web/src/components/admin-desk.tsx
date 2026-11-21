"use client";

import { Suspense, useState } from "react";
import { DemoBar, StatusBanners } from "@/components/demo-bar";
import { useSession } from "@/components/use-session";

export function AdminDesk() {
  return (
    <Suspense fallback={null}>
      <AdminInner />
    </Suspense>
  );
}

function AdminInner() {
  const { session, error, offline, pending, act } = useSession();
  const [message, setMessage] = useState("Carline is running about 20 minutes behind.");

  if (!session) {
    return (
      <>
        <DemoBar />
        <p style={{ padding: "2rem" }}>Opening the office desk…</p>
      </>
    );
  }

  const pendingChanges = session.changes.filter((change) => change.status === "pending");

  return (
    <>
      <DemoBar />
      <StatusBanners delay={session.delay} paused={session.paused} offline={offline} error={error} />
      <main style={{ maxWidth: "52rem", margin: "0 auto", padding: "1.2rem 1rem 3rem", display: "grid", gap: "1rem" }}>
        <header>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>Front office · {session.dateLabel} {session.clock}</p>
          <h1 className="display" style={{ fontSize: "2.4rem", margin: "0.2rem 0", fontWeight: 560 }}>Dismissal desk</h1>
          <p>Cutoff was {session.cutoffLabel}. Late changes stay here until you approve them. The curb does not guess.</p>
        </header>

        <section className="card" style={{ padding: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>Delay and pause</h2>
          <form
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
            onSubmit={(event) => {
              event.preventDefault();
              void act({ type: "delay", message, staffId: "diane" });
            }}
          >
            <input className="texty" style={{ flex: "1 1 16rem" }} aria-label="Delay message" value={message} onChange={(event) => setMessage(event.target.value)} />
            <button className="tap ghost" type="submit" disabled={pending}>Post delay</button>
            <button className="quiet" type="button" disabled={pending || !session.delay} onClick={() => void act({ type: "delay", message: null, staffId: "diane" })}>Clear</button>
          </form>
          <button className="tap ink" type="button" style={{ marginTop: "0.7rem" }} disabled={pending} onClick={() => void act({ type: "pause", staffId: "diane" })}>
            {session.paused ? "Resume the line" : "Pause the line"}
          </button>
        </section>

        <section className="card" style={{ padding: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>Pickup changes</h2>
          {pendingChanges.length === 0 ? <p>No requests waiting.</p> : null}
          {pendingChanges.map((change) => (
            <div key={change.id} style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", padding: "0.4rem 0" }}>
              <div>
                <strong>{change.householdName}</strong>
                <div>{change.note}</div>
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button className="quiet" type="button" disabled={pending} onClick={() => void act({ type: "decide_change", changeId: change.id, approve: true, staffId: "diane" })}>Approve</button>
                <button className="quiet" type="button" disabled={pending} onClick={() => void act({ type: "decide_change", changeId: change.id, approve: false, staffId: "diane" })}>Reject</button>
              </div>
            </div>
          ))}
        </section>

        <section className="card" style={{ padding: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>Households</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "0.3rem" }}>Family</th>
                <th>Code</th>
                <th>Adult</th>
                <th>Students</th>
              </tr>
            </thead>
            <tbody>
              {session.households.map((household) => (
                <tr key={household.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "0.45rem 0.3rem" }}>{household.name}</td>
                  <td>{household.familyCode}</td>
                  <td>{household.adultName}</td>
                  <td>
                    {household.students.map((child) => (
                      <div key={child.id}>
                        {child.name}
                        {child.blocked ? " · blocked" : ""}
                        {child.earlyRelease ? ` · left at ${child.earlyRelease.time}` : ""}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card" style={{ padding: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>Devices</h2>
          {session.devices.map((device) => (
            <p key={device.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <span>
                <strong>{device.name}</strong>
                <span style={{ color: "var(--muted)" }}> · {device.kind}. {device.detail}</span>
              </span>
              <span style={{ color: device.status === "low" ? "var(--danger)" : "var(--accent)", fontWeight: 700 }}>{device.status === "low" ? "Low battery" : "Online"}</span>
            </p>
          ))}
        </section>

        <section className="card" style={{ padding: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>Audit</h2>
          {session.audit.length === 0 ? <p>No events yet.</p> : null}
          <ul style={{ paddingLeft: "1.1rem" }}>
            {[...session.audit].reverse().slice(0, 12).map((line, index) => (
              <li key={`${line.at}-${index}`}>{line.text}</li>
            ))}
          </ul>
          <button className="quiet" type="button" disabled={pending} onClick={() => void act({ type: "reset" })}>Reset this afternoon</button>
        </section>
      </main>
    </>
  );
}
