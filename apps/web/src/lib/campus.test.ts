import assert from "node:assert/strict";
import test from "node:test";
import { apply } from "./reduce";
import { seed } from "./seed";
import { visibleTo } from "./audience";

test("an absent only-child does not get a ticket", () => {
  const session = apply(seed(), { type: "mark_attendance", studentId: "rohan", status: "absent", staffId: "james" }).session;
  const result = apply(session, { type: "fob", householdId: "patel" });
  assert.match(result.error ?? "", /absent/i);
  assert.equal(result.session.nextTicket, session.nextTicket);
});

test("an absent sibling is left off the ticket", () => {
  let session = apply(seed(), { type: "mark_attendance", studentId: "maya", status: "absent", staffId: "james" }).session;
  session = apply(session, { type: "fob", householdId: "chen" }).session;
  const vehicle = session.vehicles.find((item) => item.householdId === "chen");
  assert.equal(vehicle?.ticket, 18);
  assert.deepEqual(Object.keys(vehicle?.studentStates ?? {}), ["leo"]);
});

test("a grade 2 note stays off a grade 1 household", () => {
  const session = seed();
  const viewers = (householdId: string) =>
    session.students.filter((child) => session.households.find((item) => item.id === householdId)?.studentIds.includes(child.id));
  const brooksTitles = [...visibleTo(session.announcements, viewers("brooks")), ...visibleTo(session.events, viewers("brooks"))].map((item) => item.title);
  const chenTitles = [...visibleTo(session.announcements, viewers("chen")), ...visibleTo(session.events, viewers("chen"))].map((item) => item.title);
  assert.equal(brooksTitles.includes("Grade 2 library closes at 2"), false);
  assert.equal(brooksTitles.includes("Picture day is Thursday"), true);
  assert.equal(chenTitles.includes("Grade 2 library closes at 2"), true);
  assert.equal(chenTitles.includes("Grade 5 museum trip"), true);
});

test("peanut is refused even before the nurse verifies it", () => {
  const result = apply(seed(), { type: "order_lunch", studentId: "maya", itemId: "peanut", idempotencyKey: "maya-peanut" });
  assert.match(result.error ?? "", /peanut/i);
  assert.equal(result.session.orders.length, 0);
  assert.equal(result.session.students.find((child) => child.id === "maya")?.mealBalanceCents, 2000);
});

test("a prepaid order debits once when the same key is replayed", () => {
  let result = apply(seed(), { type: "order_lunch", studentId: "maya", itemId: "sunbutter", idempotencyKey: "maya-sun" });
  assert.equal(result.error, undefined);
  assert.equal(result.session.students.find((child) => child.id === "maya")?.mealBalanceCents, 1550);
  result = apply(result.session, { type: "order_lunch", studentId: "maya", itemId: "sunbutter", idempotencyKey: "maya-sun" });
  assert.equal(result.session.orders.length, 1);
  assert.equal(result.session.students.find((child) => child.id === "maya")?.mealBalanceCents, 1550);
});

test("a low balance blocks a priced item and a covered account does not", () => {
  const low = apply(seed(), { type: "order_lunch", studentId: "rohan", itemId: "sunbutter", idempotencyKey: "rohan-sun" });
  assert.match(low.error ?? "", /too low/i);
  const covered = apply(seed(), { type: "order_lunch", studentId: "mateo", itemId: "sunbutter", idempotencyKey: "mateo-sun" });
  assert.equal(covered.error, undefined);
  assert.equal(covered.session.students.find((child) => child.id === "mateo")?.mealBalanceCents, 0);
  assert.equal(covered.session.orders[0]?.status, "ordered");
});
