"use client";

import { Suspense, useState } from "react";
import { DemoBar, StatusBanners } from "@/components/demo-bar";
import { useSession } from "@/components/use-session";

const COPY = {
  en: {
    onTheWay: "I'm on my way",
    fob: "The visor fob is at the driveway",
    change: "Change who picks up",
    who: "Who is picking up?",
    send: "Send to the office",
    cutoff: "Changes after the cutoff wait for the office.",
    waiting: "Waiting for the office.",
    ticket: "Ticket",
    ahead: "cars ahead",
    aheadOne: "car ahead",
    together: "They will be called together.",
    holdNone: "Hold: none",
    notInLine: "Not in line yet.",
    driveway: "The line starts when the driveway hears the fob. Being nearby does not take a number.",
    blocked: "The curb cannot call this student today. The office has the instruction.",
    early: "Already picked up",
    released: "Released to",
    called: "Called to the curb",
    plan: "Carline",
  },
  es: {
    onTheWay: "Ya voy",
    fob: "El identificador ya está en la entrada",
    change: "Cambiar quién recoge",
    who: "¿Quién va a recoger?",
    send: "Enviar a la oficina",
    cutoff: "Después de la hora límite, la oficina tiene que confirmar.",
    waiting: "Esperando a la oficina.",
    ticket: "Turno",
    ahead: "autos adelante",
    aheadOne: "auto adelante",
    together: "Los van a llamar juntos.",
    holdNone: "Espera: ninguna",
    notInLine: "Todavía no está en la fila.",
    driveway: "La fila empieza cuando la entrada escucha el identificador. Estar cerca no da un turno.",
    blocked: "Hoy no pueden llamar a este estudiante en la fila. La oficina tiene la instrucción.",
    early: "Ya lo recogieron",
    released: "Entregado a",
    called: "Llamado a la banqueta",
    plan: "Fila de autos",
  },
} as const;

export function ParentPhone() {
  return (
    <Suspense fallback={null}>
      <ParentInner />
    </Suspense>
  );
}

function ParentInner() {
  const { session, error, offline, pending, act } = useSession();
  const [locale, setLocale] = useState<keyof typeof COPY>("en");
  const [householdId, setHouseholdId] = useState("chen");
  const [note, setNote] = useState("");
  const text = COPY[locale];

  if (!session) {
    return (
      <>
        <DemoBar />
        <p style={{ padding: "2rem" }}>{locale === "es" ? "Revisando la fila…" : "Checking the carline…"}</p>
      </>
    );
  }

  const household = session.households.find((item) => item.id === householdId) ?? session.households[0];
  const vehicle = household.vehicle;
  const pendingChange = session.changes.find((change) => change.householdId === household.id && change.status === "pending");
  const early = household.students.find((child) => child.earlyRelease);
  const blocked = household.students.some((child) => child.blocked);

  return (
    <>
      <DemoBar />
      <StatusBanners delay={session.delay} paused={session.paused} offline={offline} error={error} />
      <main className="phone" style={{ padding: "1rem 1rem 3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.6rem" }}>
          <label>
            <span className="sr-only">Household</span>
            <select className="texty" style={{ width: "auto" }} value={household.id} onChange={(event) => setHouseholdId(event.target.value)} aria-label="Household">
              {session.households.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <div role="group" aria-label="Language">
            <button className="quiet" type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>{" "}
            <button className="quiet" type="button" aria-pressed={locale === "es"} onClick={() => setLocale("es")}>ES</button>
          </div>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: "0.2rem" }}>{session.dateLabel} · {session.school}</p>
        <h1 className="display" style={{ fontSize: "2.4rem", marginTop: 0, fontWeight: 560 }}>{household.name}</h1>
        {household.students.map((child) => (
          <p key={child.id} style={{ fontSize: "1.2rem", margin: "0.2rem 0" }}>
            {child.name} · {child.grade}
            <br />
            <span style={{ color: "var(--muted)" }}>{text.plan} · {household.adultName}</span>
            {child.attendance === "absent" || child.attendance === "excused" ? <><br />Marked {child.attendance} today.</> : null}
          </p>
        ))}

        {early ? (
          <section className="card" style={{ padding: "1.1rem", marginTop: "1rem" }}>
            <h2 className="display" style={{ marginTop: 0 }}>{text.early}</h2>
            <p>{early.name} · {early.earlyRelease?.adult} · {early.earlyRelease?.time}</p>
          </section>
        ) : null}

        {blocked ? <div className="banner bad" style={{ borderRadius: "0.8rem", marginTop: "1rem" }}>{text.blocked}</div> : null}

        {vehicle?.ticket != null ? (
          <section className="card" style={{ padding: "1.2rem", marginTop: "1rem" }}>
            <div style={{ color: "var(--muted)" }}>{text.ticket}</div>
            <div className="display" style={{ fontSize: "4.5rem", lineHeight: 0.9 }}>{vehicle.ticket}</div>
            {vehicle.carsAhead != null ? (
              <p style={{ fontSize: "1.35rem" }}>{vehicle.carsAhead} {vehicle.carsAhead === 1 ? text.aheadOne : text.ahead}</p>
            ) : null}
            <p>{zone(locale, vehicle.zoneLabel)}</p>
            {vehicle.students.length > 1 ? <p>{text.together}</p> : null}
            <p>{vehicle.students.some((child) => child.state === "called") ? text.called : vehicle.holdParentSafe ?? text.holdNone}</p>
            {vehicle.students.some((child) => child.state === "released") ? (
              <p>{text.released} {vehicle.adultName}.</p>
            ) : null}
          </section>
        ) : early ? null : (
          <section className="card" style={{ padding: "1.2rem", marginTop: "1rem" }}>
            <h2 className="display" style={{ marginTop: 0 }}>{vehicle ? zone(locale, vehicle.zoneLabel) : text.notInLine}</h2>
            <p>{text.driveway}</p>
          </section>
        )}

        {!early ? (
          <div style={{ display: "grid", gap: "0.6rem", marginTop: "1rem" }}>
            <button className="tap primary" type="button" disabled={pending} onClick={() => void act({ type: "on_the_way", householdId: household.id })}>{text.onTheWay}</button>
            <button className="tap ink" type="button" disabled={pending} onClick={() => void act({ type: "fob", householdId: household.id })}>{text.fob}</button>
          </div>
        ) : null}

        <section style={{ marginTop: "1.4rem" }}>
          <h2 style={{ fontSize: "1.05rem" }}>{text.change}</h2>
          <p style={{ color: "var(--muted)" }}>{text.cutoff} {session.cutoffLabel}.</p>
          {pendingChange ? <p><strong>{text.waiting}</strong> {pendingChange.note}</p> : null}
          <form
            style={{ display: "grid", gap: "0.5rem" }}
            onSubmit={(event) => {
              event.preventDefault();
              act({ type: "request_change", householdId: household.id, note });
              setNote("");
            }}
          >
            <input className="texty" aria-label={text.who} placeholder={text.who} value={note} onChange={(event) => setNote(event.target.value)} />
            <button className="tap ghost" type="submit" disabled={pending}>{text.send}</button>
          </form>
        </section>
        <p style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{household.car} · {household.familyCode}</p>
      </main>
    </>
  );
}

function zone(locale: keyof typeof COPY, label: string) {
  if (locale === "en") return label;
  if (label === "On the way") return "En camino";
  if (label === "In the lot") return "En el estacionamiento";
  if (label === "At the curb") return "En la banqueta";
  return "Fuera de la fila";
}
