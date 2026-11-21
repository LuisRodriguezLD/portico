import assert from "node:assert/strict";
import test from "node:test";
import { apply } from "./reduce";
import { seed } from "./seed";

test("on the way does not mint a ticket", () => {
  const result = apply(seed(), { type: "on_the_way", householdId: "chen" });
  const vehicle = result.session.vehicles.find((item) => item.householdId === "chen");
  assert.equal(result.error, undefined);
  assert.equal(vehicle?.ticket, null);
  assert.equal(vehicle?.state, "on_the_way");
  assert.equal(result.session.nextTicket, 18);
});

test("a fob mints one ticket for both siblings and a second sighting does not mint another", () => {
  let session = apply(seed(), { type: "fob", householdId: "chen" }).session;
  const first = session.vehicles.find((item) => item.householdId === "chen");
  assert.equal(first?.ticket, 18);
  assert.deepEqual(Object.keys(first?.studentStates ?? {}).sort(), ["leo", "maya"]);
  session = apply(session, { type: "fob", householdId: "chen" }).session;
  const again = session.vehicles.filter((item) => item.householdId === "chen");
  assert.equal(again.length, 1);
  assert.equal(again[0].ticket, 18);
  assert.equal(session.nextTicket, 19);
});

test("calling a curb car leaves a held sibling in class and releases only the called child", () => {
  let session = seed();
  const ortiz = session.vehicles.find((item) => item.householdId === "ortiz")!;
  session = apply(session, {
    type: "hold_student",
    vehicleId: ortiz.id,
    studentId: "mateo",
    staffId: "james",
    reason: "nurse",
  }).session;
  session = apply(session, { type: "call", vehicleId: ortiz.id, staffId: "james" }).session;
  const called = session.vehicles.find((item) => item.id === ortiz.id)!;
  assert.equal(called.studentStates.sofia, "called");
  assert.equal(called.studentStates.mateo, "held");
  session = apply(session, { type: "loaded", vehicleId: ortiz.id, staffId: "james" }).session;
  const done = session.vehicles.find((item) => item.id === ortiz.id)!;
  assert.equal(done.studentStates.sofia, "released");
  assert.equal(done.studentStates.mateo, "held");
  assert.equal(done.state, "held");
});

test("a blocked student cannot be called, and override requires two staff", () => {
  let result = apply(seed(), { type: "fob", householdId: "ellis" });
  const vehicle = result.session.vehicles.find((item) => item.householdId === "ellis")!;
  result = apply(result.session, { type: "call", vehicleId: vehicle.id, staffId: "james" });
  assert.match(result.error ?? "", /blocked/i);

  result = apply(result.session, {
    type: "override",
    vehicleId: vehicle.id,
    staffId: "james",
    pin: "2468",
    secondStaffId: "james",
    secondPin: "2468",
    reason: "Parent is known to me",
  });
  assert.match(result.error ?? "", /two different/i);

  result = apply(result.session, {
    type: "override",
    vehicleId: vehicle.id,
    staffId: "james",
    pin: "0000",
    secondStaffId: "diane",
    secondPin: "1357",
    reason: "Parent is known to me",
  });
  assert.match(result.error ?? "", /PIN/i);

  result = apply(result.session, {
    type: "override",
    vehicleId: vehicle.id,
    staffId: "james",
    pin: "2468",
    secondStaffId: "diane",
    secondPin: "1357",
    reason: "Father is the authorized adult on the updated letter.",
  });
  assert.equal(result.error, undefined);
  const released = result.session.vehicles.find((item) => item.id === vehicle.id)!;
  assert.equal(released.studentStates.sam, "released");
  assert.equal(result.session.releases.at(-1)?.secondStaffName, "Diane Frost");
});

test("an early pickup does not get a new ticket", () => {
  const result = apply(seed(), { type: "fob", householdId: "reid" });
  assert.match(result.error ?? "", /already picked up/i);
  assert.equal(result.session.vehicles.some((item) => item.householdId === "reid"), false);
});

test("family code adds the next ticket", () => {
  const result = apply(seed(), { type: "manual", familyCode: "4412", staffId: "diane" });
  const vehicle = result.session.vehicles.find((item) => item.householdId === "chen");
  assert.equal(vehicle?.ticket, 18);
  assert.equal(vehicle?.zone, "in_lot");
});

test("a paused line refuses a call", () => {
  const session = apply(seed(), { type: "pause", staffId: "james" }).session;
  const patel = session.vehicles.find((item) => item.householdId === "patel")!;
  const result = apply(session, { type: "call", vehicleId: patel.id, staffId: "james" });
  assert.match(result.error ?? "", /paused/i);
});
