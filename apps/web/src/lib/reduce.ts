import { seed } from "./seed";
import { authorize, staffName } from "./staff";
import type { Action, Session, Student, StudentState, Vehicle, VehicleState } from "./types";

export type ApplyResult = { session: Session; error?: string };

const HOLD_COPY: Record<string, string> = {
  office: "Held at the office",
  nurse: "Held at the nurse",
  not_yet: "Not called yet",
  other: "Held by staff",
};

export function apply(session: Session, action: Action): ApplyResult {
  if (action.type === "reset") {
    return { session: seed() };
  }

  const next = structuredClone(session);

  switch (action.type) {
    case "on_the_way":
      return onTheWay(next, action.householdId);
    case "fob":
      return joinLine(next, action.householdId, "fob");
    case "manual":
      return manual(next, action.familyCode, action.staffId);
    case "call":
      return call(next, action.vehicleId, action.staffId);
    case "hold":
      return holdVehicle(next, action.vehicleId, action.staffId, action.reason);
    case "hold_student":
      return holdStudent(next, action.vehicleId, action.studentId, action.staffId, action.reason);
    case "clear_hold":
      return clearHold(next, action.vehicleId, action.staffId);
    case "loaded":
      return loaded(next, action.vehicleId, action.staffId);
    case "delay":
      return delay(next, action.message, action.staffId);
    case "pause":
      return pause(next, action.staffId);
    case "request_change":
      return requestChange(next, action.householdId, action.note);
    case "decide_change":
      return decideChange(next, action.changeId, action.approve, action.staffId);
    case "override":
      return override(next, action);
    case "mark_attendance":
      return markAttendance(next, action.studentId, action.status, action.staffId);
    case "submit_roll":
      return submitRoll(next, action.homeroomId, action.staffId);
    case "post_announcement":
      return postAnnouncement(next, action);
    case "add_event":
      return addEvent(next, action);
    case "order_lunch":
      return orderLunch(next, action.studentId, action.itemId, action.idempotencyKey);
    case "load_meal":
      return loadMeal(next, action.studentId, action.amountCents, action.idempotencyKey);
    case "serve_lunch":
      return serveLunch(next, action.orderId, action.staffId);
    default:
      return { session: next, error: "Unknown action." };
  }
}

function audit(session: Session, text: string) {
  session.audit.push({ at: new Date().toISOString(), text });
}

function onTheWay(session: Session, householdId: string): ApplyResult {
  const household = findHousehold(session, householdId);
  if (!household) return { session, error: "That household is not on today's roster." };
  const existing = activeVehicle(session, householdId);
  if (existing) {
    if (existing.ticket == null && existing.state === "expected") {
      existing.state = "on_the_way";
      existing.zone = "on_the_way";
    }
    return { session };
  }
  const students = lineStudents(session, household.studentIds);
  if (students.error) return { session, error: students.error };
  session.vehicles.push({
    id: vehicleId(householdId),
    householdId,
    ticket: null,
    state: "on_the_way",
    zone: "on_the_way",
    holdParentSafe: null,
    studentStates: Object.fromEntries(students.ids.map((id) => [id, initialState(session, id)])),
  });
  audit(session, `${household.name} is on the way. No ticket yet.`);
  return { session };
}

function manual(session: Session, familyCode: string, staffId: string): ApplyResult {
  const household = session.households.find((item) => item.familyCode === familyCode.trim());
  if (!household) return { session, error: "No household uses that code." };
  const result = joinLine(session, household.id, "staff");
  if (!result.error) {
    audit(session, `${staffName(staffId)} added ${household.name} from family code ${household.familyCode}.`);
  }
  return result;
}

function joinLine(session: Session, householdId: string, source: "fob" | "staff"): ApplyResult {
  const household = findHousehold(session, householdId);
  if (!household) return { session, error: "That household is not on today's roster." };
  const students = lineStudents(session, household.studentIds);
  if (students.error) {
    audit(session, students.error);
    return { session, error: students.error };
  }

  let vehicle = activeVehicle(session, householdId);
  if (!vehicle) {
    vehicle = {
      id: vehicleId(householdId),
      householdId,
      ticket: null,
      state: "expected",
      zone: "none",
      holdParentSafe: null,
      studentStates: {},
    };
    session.vehicles.push(vehicle);
  }

  for (const id of students.ids) {
    if (!vehicle.studentStates[id]) vehicle.studentStates[id] = initialState(session, id);
  }

  if (vehicle.ticket == null) {
    vehicle.ticket = session.nextTicket;
    session.nextTicket += 1;
    audit(
      session,
      source === "fob"
        ? `Entry gateway heard the ${household.name} fob. Ticket ${vehicle.ticket}.`
        : `Ticket ${vehicle.ticket} issued for ${household.name}.`,
    );
  }

  if (vehicle.state !== "called" && vehicle.state !== "held") {
    vehicle.state = "in_queue";
  }
  vehicle.zone = "in_lot";
  return { session };
}

function call(session: Session, vehicleId: string, staffId: string): ApplyResult {
  if (session.paused) return { session, error: "The line is paused." };
  const vehicle = findVehicle(session, vehicleId);
  if (!vehicle) return { session, error: "That car is not in this session." };
  if (vehicle.zone !== "in_lot" && vehicle.zone !== "at_curb") {
    return { session, error: "That car is still on the way. The ticket starts at the driveway." };
  }

  const eligible = Object.entries(vehicle.studentStates).filter(([, state]) => state === "in_class");
  if (eligible.length === 0) {
    const blocked = Object.keys(vehicle.studentStates).some((id) => student(session, id)?.blocked);
    return {
      session,
      error: blocked
        ? "Call is unavailable. This student is blocked."
        : "Nobody in this car is waiting to be called.",
    };
  }

  for (const [id] of eligible) vehicle.studentStates[id] = "called";
  vehicle.state = "called";
  const names = eligible.map(([id]) => studentName(session, id)).join(" and ");
  audit(session, `${staffName(staffId)} called ${names}.`);
  return { session };
}

function holdVehicle(session: Session, vehicleId: string, staffId: string, reason: string): ApplyResult {
  const vehicle = findVehicle(session, vehicleId);
  if (!vehicle) return { session, error: "That car is not in this session." };
  const safe = HOLD_COPY[reason] ?? HOLD_COPY.other;
  vehicle.holdParentSafe = safe;
  vehicle.state = "held";
  for (const [id, state] of Object.entries(vehicle.studentStates)) {
    if (state === "in_class" || state === "called") vehicle.studentStates[id] = "held";
  }
  audit(session, `${staffName(staffId)} held ${householdName(session, vehicle.householdId)}: ${safe}.`);
  return { session };
}

function holdStudent(
  session: Session,
  vehicleId: string,
  studentId: string,
  staffId: string,
  reason: string,
): ApplyResult {
  const vehicle = findVehicle(session, vehicleId);
  if (!vehicle || vehicle.studentStates[studentId] == null) {
    return { session, error: "That student is not in this car." };
  }
  const safe = HOLD_COPY[reason] ?? HOLD_COPY.nurse;
  vehicle.studentStates[studentId] = "held";
  vehicle.holdParentSafe = safe;
  if (Object.values(vehicle.studentStates).every((state) => state === "held" || state === "skipped")) {
    vehicle.state = "held";
  }
  audit(session, `${staffName(staffId)} held ${studentName(session, studentId)}: ${safe}.`);
  return { session };
}

function clearHold(session: Session, vehicleId: string, staffId: string): ApplyResult {
  const vehicle = findVehicle(session, vehicleId);
  if (!vehicle) return { session, error: "That car is not in this session." };
  for (const [id, state] of Object.entries(vehicle.studentStates)) {
    if (state === "held") vehicle.studentStates[id] = "in_class";
  }
  vehicle.holdParentSafe = null;
  vehicle.state = vehicle.ticket == null ? "on_the_way" : "in_queue";
  audit(session, `${staffName(staffId)} cleared the hold on ${householdName(session, vehicle.householdId)}.`);
  return { session };
}

function loaded(session: Session, vehicleId: string, staffId: string): ApplyResult {
  const vehicle = findVehicle(session, vehicleId);
  if (!vehicle) return { session, error: "That car is not in this session." };
  const called = Object.entries(vehicle.studentStates).filter(([, state]) => state === "called");
  if (called.length === 0) return { session, error: "Call the students before marking the car loaded." };

  const household = findHousehold(session, vehicle.householdId);
  const adult = household ? displayAdult(household) : "the authorized adult";
  for (const [id] of called) {
    if (student(session, id)?.blocked) {
      return { session, error: "A blocked student needs a two-person override." };
    }
    vehicle.studentStates[id] = "released";
    session.releases.push({
      id: `rel-${id}-${session.releases.length + 1}`,
      studentId: id,
      vehicleId: vehicle.id,
      adultName: adult,
      staffName: staffName(staffId),
      method: "curb",
      at: new Date().toISOString(),
    });
  }
  finishVehicle(vehicle);
  audit(session, `${staffName(staffId)} released ${called.map(([id]) => studentName(session, id)).join(" and ")} to ${adult}.`);
  return { session };
}

function delay(session: Session, message: string | null, staffId: string): ApplyResult {
  session.delay = message && message.trim() ? message.trim() : null;
  audit(session, session.delay ? `${staffName(staffId)} posted a delay: ${session.delay}` : `${staffName(staffId)} cleared the delay.`);
  return { session };
}

function pause(session: Session, staffId: string): ApplyResult {
  session.paused = !session.paused;
  audit(session, session.paused ? `${staffName(staffId)} paused the line.` : `${staffName(staffId)} resumed the line.`);
  return { session };
}

function markAttendance(session: Session, studentId: string, status: Session["attendance"][string], staffId: string): ApplyResult {
  const child = student(session, studentId);
  if (!child) return { session, error: "That student is not on the roster." };
  session.attendance[studentId] = status;
  if (status === "absent" || status === "excused") pullFromCarline(session, studentId);
  if (status === "present" || status === "tardy") restoreToCarline(session, studentId);
  audit(session, `${staffName(staffId)} marked ${studentName(session, studentId)} ${status}.`);
  return { session };
}

function submitRoll(session: Session, homeroomId: string, staffId: string): ApplyResult {
  const members = session.students.filter((child) => child.homeroomId === homeroomId);
  if (members.length === 0) return { session, error: "That room has no students." };
  for (const child of members) {
    if (!session.attendance[child.id] || session.attendance[child.id] === "unmarked") {
      session.attendance[child.id] = "present";
    }
  }
  audit(session, `${staffName(staffId)} submitted the roll for ${members[0].teacher}.`);
  return { session };
}

function postAnnouncement(session: Session, action: Extract<Action, { type: "post_announcement" }>): ApplyResult {
  if (!action.title.trim() || !action.body.trim()) return { session, error: "An announcement needs a title and a body." };
  session.announcements.unshift({
    id: `ann-${session.announcements.length + 1}`,
    title: action.title.trim(),
    body: action.body.trim(),
    audience: action.audience,
    audienceRef: action.audienceRef,
  });
  audit(session, `${staffName(action.staffId)} posted “${action.title.trim()}”.`);
  return { session };
}

function addEvent(session: Session, action: Extract<Action, { type: "add_event" }>): ApplyResult {
  if (!action.title.trim() || !action.whenLabel.trim()) return { session, error: "An event needs a title and a time." };
  session.events.unshift({
    id: `evt-${session.events.length + 1}`,
    title: action.title.trim(),
    whenLabel: action.whenLabel.trim(),
    audience: action.audience,
    audienceRef: action.audienceRef,
  });
  audit(session, `${staffName(action.staffId)} added ${action.title.trim()} to the calendar.`);
  return { session };
}

function orderLunch(session: Session, studentId: string, itemId: string, idempotencyKey: string): ApplyResult {
  if (session.orderKeys.includes(idempotencyKey)) return { session };
  const child = student(session, studentId);
  const item = session.menu.find((row) => row.id === itemId);
  if (!child || !item) return { session, error: "That meal is not on today's menu." };
  const conflict = item.allergens.find((tag) => child.allergens.includes(tag));
  if (conflict) {
    audit(session, `Refused ${item.name} for ${child.firstName} ${child.lastName}: ${conflict}.`);
    return { session, error: `${item.name} includes ${conflict}. It cannot be ordered for ${child.firstName}.` };
  }
  if (!child.mealNoCharge && child.mealBalanceCents < item.priceCents) {
    return { session, error: `${child.firstName}'s meal balance is too low for ${item.name}.` };
  }
  if (!child.mealNoCharge) child.mealBalanceCents -= item.priceCents;
  session.orders.unshift({ id: `ord-${session.orders.length + 1}`, studentId, itemId, status: "ordered" });
  session.orderKeys.push(idempotencyKey);
  audit(session, `${child.firstName} ${child.lastName} ordered ${item.name}.`);
  return { session };
}

function loadMeal(session: Session, studentId: string, amountCents: number, idempotencyKey: string): ApplyResult {
  if (session.orderKeys.includes(idempotencyKey)) return { session };
  const child = student(session, studentId);
  if (!child) return { session, error: "That student is not on the roster." };
  if (amountCents <= 0) return { session, error: "Add a positive amount." };
  child.mealBalanceCents += amountCents;
  session.orderKeys.push(idempotencyKey);
  audit(session, `Loaded $${(amountCents / 100).toFixed(2)} onto ${studentName(session, studentId)}'s meal account.`);
  return { session };
}

function serveLunch(session: Session, orderId: string, staffId: string): ApplyResult {
  const order = session.orders.find((row) => row.id === orderId);
  if (!order) return { session, error: "That order is not on the board." };
  if (order.status === "served") return { session };
  order.status = "served";
  audit(session, `${staffName(staffId)} served ${studentName(session, order.studentId)}.`);
  return { session };
}

function pullFromCarline(session: Session, studentId: string) {
  for (const vehicle of session.vehicles) {
    const state = vehicle.studentStates[studentId];
    if (state === "in_class" || state === "called") vehicle.studentStates[studentId] = "skipped";
    const stillWaiting = Object.values(vehicle.studentStates).some((value) => value === "in_class" || value === "called" || value === "held");
    if (!stillWaiting && vehicle.state !== "released") vehicle.state = "cancelled";
  }
}

function restoreToCarline(session: Session, studentId: string) {
  const child = student(session, studentId);
  if (!child || child.blocked) return;
  for (const vehicle of session.vehicles) {
    if (vehicle.studentStates[studentId] === "skipped") {
      vehicle.studentStates[studentId] = "in_class";
      if (vehicle.state === "cancelled" && vehicle.ticket != null) vehicle.state = "in_queue";
    }
  }
}

function requestChange(session: Session, householdId: string, note: string): ApplyResult {
  const household = findHousehold(session, householdId);
  if (!household) return { session, error: "That household is not on today's roster." };
  const trimmed = note.trim();
  if (!trimmed) return { session, error: "Say who is picking up." };
  session.changes.unshift({
    id: `chg-${session.changes.length + 1}`,
    householdId,
    note: trimmed,
    status: "pending",
  });
  audit(session, `${household.name} asked to change pickup after the ${session.cutoffLabel} cutoff.`);
  return { session };
}

function decideChange(session: Session, changeId: string, approve: boolean, staffId: string): ApplyResult {
  const change = session.changes.find((item) => item.id === changeId);
  if (!change || change.status !== "pending") return { session, error: "That request is already decided." };
  change.status = approve ? "approved" : "rejected";
  const household = findHousehold(session, change.householdId);
  if (approve && household) household.todayAdultName = change.note;
  audit(
    session,
    `${staffName(staffId)} ${approve ? "approved" : "rejected"} the pickup change for ${household?.name ?? "a household"}.`,
  );
  return { session };
}

function override(
  session: Session,
  action: Extract<Action, { type: "override" }>,
): ApplyResult {
  const vehicle = findVehicle(session, action.vehicleId);
  if (!vehicle) return { session, error: "That car is not in this session." };
  if (action.staffId === action.secondStaffId) {
    return { session, error: "Override needs two different staff members." };
  }
  if (!authorize(action.staffId, action.pin) || !authorize(action.secondStaffId, action.secondPin)) {
    return { session, error: "Those PINs do not match two people on duty." };
  }
  if (!action.reason.trim()) return { session, error: "A reason is required." };

  const blocked = Object.keys(vehicle.studentStates).filter((id) => student(session, id)?.blocked && vehicle.studentStates[id] !== "released");
  if (blocked.length === 0) {
    return { session, error: "This adult is already authorized. Use Loaded." };
  }

  const household = findHousehold(session, vehicle.householdId);
  const adult = household ? displayAdult(household) : "an unnamed adult";
  for (const id of blocked) {
    vehicle.studentStates[id] = "released";
    session.releases.push({
      id: `rel-${id}-override`,
      studentId: id,
      vehicleId: vehicle.id,
      adultName: adult,
      staffName: staffName(action.staffId),
      secondStaffName: staffName(action.secondStaffId),
      method: "override",
      at: new Date().toISOString(),
    });
  }
  finishVehicle(vehicle);
  audit(
    session,
    `${staffName(action.staffId)} and ${staffName(action.secondStaffId)} overrode the block for ${blocked.map((id) => studentName(session, id)).join(" and ")}. ${action.reason.trim()}`,
  );
  return { session };
}

function finishVehicle(vehicle: Vehicle) {
  const states = Object.values(vehicle.studentStates);
  if (states.every((state) => state === "released" || state === "skipped")) {
    vehicle.state = "released";
    vehicle.holdParentSafe = null;
    return;
  }
  if (states.some((state) => state === "held")) vehicle.state = "held";
  else if (states.some((state) => state === "called")) vehicle.state = "called";
  else if (vehicle.ticket != null) vehicle.state = vehicle.zone === "at_curb" ? "at_curb" : "in_queue";
}

function lineStudents(session: Session, ids: string[]): { ids: string[]; error?: string } {
  const included: string[] = [];
  const notes: string[] = [];
  for (const id of ids) {
    const child = student(session, id);
    if (!child) continue;
    if (child.earlyRelease) {
      notes.push(`${child.firstName} ${child.lastName} was already picked up by ${child.earlyRelease.adult} at ${child.earlyRelease.time}.`);
      continue;
    }
    const roll = session.attendance[id];
    if (roll === "absent" || roll === "excused") {
      notes.push(`${child.firstName} ${child.lastName} is absent today.`);
      continue;
    }
    included.push(id);
  }
  if (included.length === 0) {
    return { ids: [], error: notes[0] ?? "Nobody in this car is still at school." };
  }
  return { ids: included };
}

function initialState(session: Session, id: string): StudentState {
  return student(session, id)?.blocked ? "skipped" : "in_class";
}

function activeVehicle(session: Session, householdId: string) {
  return session.vehicles.find((vehicle) => vehicle.householdId === householdId && vehicle.state !== "released" && vehicle.state !== "cancelled");
}

function findVehicle(session: Session, id: string) {
  return session.vehicles.find((vehicle) => vehicle.id === id);
}

function findHousehold(session: Session, id: string) {
  return session.households.find((household) => household.id === id);
}

function student(session: Session, id: string) {
  return session.students.find((child) => child.id === id);
}

function studentName(session: Session, id: string) {
  const child = student(session, id);
  return child ? `${child.firstName} ${child.lastName}` : "A student";
}

function householdName(session: Session, id: string) {
  return findHousehold(session, id)?.name ?? "A household";
}

function displayAdult(household: Session["households"][number]) {
  return household.todayAdultName ?? household.adultName;
}

function vehicleId(householdId: string) {
  return `veh-${householdId}-${Math.random().toString(36).slice(2, 7)}`;
}

export function carsAhead(session: Session, vehicle: Vehicle) {
  if (vehicle.ticket == null) return null;
  return session.vehicles.filter((other) => {
    if (other.id === vehicle.id || other.ticket == null) return false;
    if (other.state === "released" || other.state === "cancelled") return false;
    return other.ticket < vehicle.ticket!;
  }).length;
}

export function isInLine(state: VehicleState) {
  return state === "in_queue" || state === "at_curb" || state === "called";
}

export type { Student };
