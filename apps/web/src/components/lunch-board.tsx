"use client";

import { Suspense, useState } from "react";
import { DemoBar, StatusBanners } from "@/components/demo-bar";
import { useSession } from "@/components/use-session";

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function LunchBoard() {
  return (
    <Suspense fallback={null}>
      <LunchInner />
    </Suspense>
  );
}

function LunchInner() {
  const { session, error, act } = useSession();
  const [householdId, setHouseholdId] = useState("chen");

  if (!session) {
    return (
      <>
        <DemoBar />
        <p style={{ padding: "2rem" }}>Opening lunch…</p>
      </>
    );
  }

  const household = session.households.find((item) => item.id === householdId) ?? session.households[0];

  return (
    <>
      <DemoBar />
      <StatusBanners delay={session.delay} paused={session.paused} offline={false} error={error} />
      <main style={{ maxWidth: "46rem", margin: "0 auto", padding: "1.2rem 1rem 3rem", display: "grid", gap: "1rem" }}>
        <header>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>Tuesday menu · prepaid accounts</p>
          <h1 className="display" style={{ fontSize: "2.4rem", margin: "0.2rem 0", fontWeight: 560 }}>Lunch</h1>
          <label>
            Household{" "}
            <select className="texty" style={{ width: "auto" }} value={household.id} onChange={(event) => setHouseholdId(event.target.value)}>
              {session.households.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        </header>
        {household.students.map((child) => (
          <article key={child.id} className="card" style={{ padding: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>{child.name}</h2>
            <p>
              {child.mealNoCharge ? "Meal is covered." : `Balance ${money(child.mealBalanceCents)}`}
              {child.allergens.length > 0 ? ` · ${child.allergens.join(", ")}${child.allergyVerified ? "" : " (unverified, still blocked)"}` : ""}
            </p>
            {!child.mealNoCharge && child.mealBalanceCents < 500 ? <p>Balance is low. Add funds before the counter.</p> : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {session.menu.map((item) => {
                const blocked = item.allergens.some((tag) => child.allergens.includes(tag));
                return (
                  <button
                    key={item.id}
                    className="quiet"
                    type="button"
                    disabled={blocked}
                    onClick={() => act({ type: "order_lunch", studentId: child.id, itemId: item.id, idempotencyKey: `${child.id}-${item.id}-${Date.now()}` })}
                  >
                    {item.name} · {money(item.priceCents)}{blocked ? ` · ${item.allergens.join(", ")}` : ""}
                  </button>
                );
              })}
              {!child.mealNoCharge ? (
                <button className="quiet" type="button" onClick={() => act({ type: "load_meal", studentId: child.id, amountCents: 2000, idempotencyKey: `${child.id}-load-${Date.now()}` })}>
                  Add $20 by ACH
                </button>
              ) : null}
            </div>
          </article>
        ))}
        <section className="card" style={{ padding: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>Kitchen</h2>
          {session.orders.length === 0 ? <p>No orders yet.</p> : null}
          {session.orders.map((order) => (
            <p key={order.id} style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", alignItems: "center" }}>
              <span>{order.studentName} · {order.itemName} · {order.status}</span>
              {order.status === "ordered" ? (
                <button className="quiet" type="button" onClick={() => act({ type: "serve_lunch", orderId: order.id, staffId: "james" })}>Served</button>
              ) : null}
            </p>
          ))}
        </section>
      </main>
    </>
  );
}
