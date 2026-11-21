"use client";

import { Suspense, useMemo, useState } from "react";
import { DemoBar, StatusBanners } from "@/components/demo-bar";
import { useSession } from "@/components/use-session";
import type { VehicleView } from "@/lib/types";

export function QueueBoard() {
  return (
    <Suspense fallback={null}>
      <QueueInner />
    </Suspense>
  );
}

function QueueInner() {
  const { session, error, offline, pending, act } = useSession();
  const [staffId, setStaffId] = useState("james");
  const [query, setQuery] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);

  const focus = useMemo(() => {
    if (!session || !focusId) return null;
    return [...(session.now ? [session.now] : []), ...session.next, ...session.onTheWay, ...session.exceptions].find((vehicle) => vehicle.id === focusId) ?? null;
  }, [session, focusId]);

  if (!session) {
    return (
      <>
        <DemoBar />
        <p style={{ padding: "2rem" }}>Checking the carline…</p>
      </>
    );
  }

  const card = focus ?? session.now;
  const matches = query.trim()
    ? session.households.filter((household) => {
        const haystack = `${household.name} ${household.familyCode} ${household.students.map((child) => child.name).join(" ")}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      })
    : [];

  return (
    <>
      <DemoBar />
      <StatusBanners delay={session.delay} paused={session.paused} offline={offline} error={error} />
      <header style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "1rem 1.1rem 0.4rem", alignItems: "end", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.78rem" }}>{session.campus}</p>
          <h1 className="display" style={{ margin: "0.15rem 0", fontSize: "2rem", fontWeight: 560 }}>{session.school}</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="display" style={{ fontSize: "1.8rem" }}>{session.clock}</div>
          <div>{session.inLine} in line</div>
        </div>
      </header>
      <div style={{ display: "flex", gap: "0.6rem", padding: "0.4rem 1.1rem 0.8rem", flexWrap: "wrap", alignItems: "center" }}>
        <label>
          Signed in as{" "}
          <select className="texty" style={{ width: "auto" }} value={staffId} onChange={(event) => setStaffId(event.target.value)}>
            {session.staff.map((person) => (
              <option key={person.id} value={person.id}>{person.name}</option>
            ))}
          </select>
        </label>
        <input className="texty" style={{ maxWidth: "22rem" }} placeholder="Search name or family code" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search the roster" />
      </div>
      {matches.length > 0 ? (
        <ul style={{ listStyle: "none", margin: "0 1.1rem 0.8rem", padding: 0, display: "grid", gap: "0.4rem" }}>
          {matches.map((household) => (
            <li key={household.id} className="card" style={{ padding: "0.75rem 0.9rem", display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center" }}>
              <div>
                <strong>{household.name}</strong>
                <div style={{ color: "var(--muted)" }}>{household.students.map((child) => child.name).join(", ")} · code {household.familyCode}</div>
                {household.students.some((child) => child.blocked) ? <div style={{ color: "var(--danger)", fontWeight: 700 }}>Blocked · do not release</div> : null}
                {household.students.some((child) => child.earlyRelease) ? <div>Already picked up</div> : null}
              </div>
              {household.vehicle ? (
                <button className="quiet" type="button" onClick={() => { setFocusId(household.vehicle!.id); setQuery(""); }}>Show car</button>
              ) : (
                <button className="quiet" type="button" disabled={pending} onClick={() => void act({ type: "manual", familyCode: household.familyCode, staffId }).then(() => setQuery(""))}>Add to line</button>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="split" style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr", gap: "1rem", padding: "0 1.1rem 2rem" }}>
        <section aria-label="Now">
          <p style={{ margin: "0 0 0.4rem", letterSpacing: "0.08em", fontSize: "0.78rem" }}>{focusId ? "SELECTED" : "NOW"}</p>
          {card ? (
            <NowCard
              vehicle={card}
              pending={pending}
              overrideOpen={overrideOpen}
              staffId={staffId}
              onCall={() => void act({ type: "call", vehicleId: card.id, staffId })}
              onLoaded={() => void act({ type: "loaded", vehicleId: card.id, staffId })}
              onHold={() => void act({ type: "hold", vehicleId: card.id, staffId, reason: "office" })}
              onHoldStudent={(studentId) => void act({ type: "hold_student", vehicleId: card.id, studentId, staffId, reason: "nurse" })}
              onClear={() => void act({ type: "clear_hold", vehicleId: card.id, staffId })}
              onOverride={(pin, secondPin, reason) =>
                void act({
                  type: "override",
                  vehicleId: card.id,
                  staffId,
                  pin,
                  secondStaffId: staffId === "james" ? "diane" : "james",
                  secondPin,
                  reason,
                })
              }
              onToggleOverride={() => setOverrideOpen((open) => !open)}
              focused={focusId != null}
              onClearFocus={() => setFocusId(null)}
            />
          ) : (
            <div className="card" style={{ padding: "2rem" }}>
              <h2 className="display" style={{ marginTop: 0 }}>No car is in the lot yet.</h2>
              <p>Cars on the way stay off this card until the driveway hears a fob or you add a family code.</p>
            </div>
          )}
        </section>
        <section aria-label="Next">
          <p style={{ margin: "0 0 0.4rem", letterSpacing: "0.08em", fontSize: "0.78rem" }}>NEXT</p>
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {session.next.map((vehicle) => (
              <button key={vehicle.id} type="button" onClick={() => setFocusId(vehicle.id)} className="card" style={{ textAlign: "left", padding: "0.85rem 1rem" }}>
                <strong>#{vehicle.ticket} {vehicle.householdName}</strong>
                <div>{vehicle.students.length} {vehicle.students.length === 1 ? "child" : "children"} · {vehicle.zoneLabel}</div>
              </button>
            ))}
            {session.onTheWay.length > 0 ? (
              <div className="card" style={{ padding: "0.85rem 1rem" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>ON THE WAY, NOT IN LINE</div>
                {session.onTheWay.map((vehicle) => (
                  <div key={vehicle.id} style={{ marginTop: "0.35rem" }}>{vehicle.householdName} · {vehicle.car}</div>
                ))}
              </div>
            ) : null}
            {session.exceptions.map((vehicle) => (
              <button key={vehicle.id} type="button" onClick={() => setFocusId(vehicle.id)} className="card" style={{ textAlign: "left", padding: "0.85rem 1rem", borderColor: "#e2c48a" }}>
                <strong>Hold · {vehicle.householdName}</strong>
                <div>{vehicle.holdParentSafe}</div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function NowCard({
  vehicle,
  pending,
  overrideOpen,
  staffId,
  onCall,
  onLoaded,
  onHold,
  onHoldStudent,
  onClear,
  onOverride,
  onToggleOverride,
  focused,
  onClearFocus,
}: {
  vehicle: VehicleView;
  pending: boolean;
  overrideOpen: boolean;
  staffId: string;
  onCall: () => void;
  onLoaded: () => void;
  onHold: () => void;
  onHoldStudent: (studentId: string) => void;
  onClear: () => void;
  onOverride: (pin: string, secondPin: string, reason: string) => void;
  onToggleOverride: () => void;
  focused: boolean;
  onClearFocus: () => void;
}) {
  const [pin, setPin] = useState("");
  const [secondPin, setSecondPin] = useState("");
  const [reason, setReason] = useState("");
  const called = vehicle.students.some((child) => child.state === "called");
  const blocked = vehicle.students.some((child) => child.blocked && child.state !== "released");
  const other = staffId === "james" ? "Diane Frost" : "James Whitfield";

  return (
    <article className="card" style={{ padding: "1.1rem" }}>
      {focused ? (
        <button className="quiet" type="button" onClick={onClearFocus} style={{ marginBottom: "0.8rem" }}>Back to the front of the line</button>
      ) : null}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "baseline" }}>
        <div>
          <div style={{ color: "var(--muted)" }}>{vehicle.zoneLabel}</div>
          <h2 className="display" style={{ fontSize: "3.4rem", margin: "0.1rem 0", lineHeight: 0.95 }}>
            {vehicle.ticket ? `#${vehicle.ticket}` : "No ticket"} {vehicle.householdName}
          </h2>
          <div style={{ fontSize: "1.25rem" }}>{vehicle.car}</div>
        </div>
        {vehicle.carsAhead ? (
          <div style={{ textAlign: "right", color: "var(--muted)" }}>{vehicle.carsAhead} ahead</div>
        ) : null}
      </div>
      {blocked ? (
        <div className="banner bad" style={{ margin: "0.9rem 0", borderRadius: "0.8rem" }}>
          Blocked. Do not release. Call stays off until two staff override.
        </div>
      ) : null}
      <div style={{ display: "grid", gap: "0.7rem", marginTop: "1rem" }}>
        {vehicle.students.map((child) => (
          <div key={child.id} style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <div className="badge" style={{ background: child.badge }} aria-hidden>
              {child.firstName.slice(0, 1)}
              {child.lastName.slice(0, 1)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "1.7rem", fontWeight: 650, letterSpacing: "-0.03em" }}>{child.firstName} {child.lastName}</div>
              <div>{child.grade} · {labelState(child.state)}{child.blocked ? " · Blocked" : ""}</div>
            </div>
            {child.state === "in_class" && !child.blocked ? (
              <button className="quiet" type="button" disabled={pending} onClick={() => onHoldStudent(child.id)}>Hold</button>
            ) : null}
          </div>
        ))}
      </div>
      <p style={{ fontSize: "1.15rem" }}>Adult: {vehicle.adultName} ({vehicle.relationship})</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
        {called ? (
          <button className="tap ink" type="button" disabled={pending} onClick={onLoaded}>Loaded</button>
        ) : (
          <button className="tap primary" type="button" disabled={pending || vehicle.callBlocked} onClick={onCall}>Call</button>
        )}
        {vehicle.state === "held" ? (
          <button className="tap ghost" type="button" disabled={pending} onClick={onClear}>Clear hold</button>
        ) : (
          <button className="tap ghost" type="button" disabled={pending} onClick={onHold}>Hold car</button>
        )}
      </div>
      {blocked ? (
        <div style={{ marginTop: "0.8rem" }}>
          <button className="quiet" type="button" onClick={onToggleOverride}>Two-person override</button>
          {overrideOpen ? (
            <form
              style={{ display: "grid", gap: "0.5rem", marginTop: "0.7rem" }}
              onSubmit={(event) => {
                event.preventDefault();
                onOverride(pin, secondPin, reason);
              }}
            >
              <p style={{ margin: 0 }}>You are {staffId === "james" ? "James Whitfield" : "Diane Frost"}. {other} enters the second PIN. Drill PINs are listed on the afternoon page.</p>
              <input className="texty" inputMode="numeric" aria-label="Your PIN" placeholder="Your PIN" value={pin} onChange={(event) => setPin(event.target.value)} />
              <input className="texty" inputMode="numeric" aria-label={`${other} PIN`} placeholder={`${other} PIN`} value={secondPin} onChange={(event) => setSecondPin(event.target.value)} />
              <input className="texty" aria-label="Reason" placeholder="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
              <button className="tap danger" type="submit" disabled={pending}>Release with override</button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function labelState(state: string) {
  switch (state) {
    case "called":
      return "Called";
    case "held":
      return "Held";
    case "released":
      return "Released";
    case "skipped":
      return "Not callable";
    default:
      return "In class";
  }
}
