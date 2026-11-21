import { carsAhead, isInLine } from "./reduce";
import { staffDirectory } from "./staff";
import type { PublicSession, Session, StudentView, Vehicle, VehicleView } from "./types";

const ZONES: Record<Vehicle["zone"], string> = {
  none: "Not in line",
  on_the_way: "On the way",
  in_lot: "In the lot",
  at_curb: "At the curb",
};

export function present(session: Session): PublicSession {
  const views = session.vehicles.map((vehicle) => toView(session, vehicle));
  const ranked = views
    .filter((vehicle) => vehicle.ticket != null && isInLine(vehicle.state))
    .sort((a, b) => (a.ticket ?? 0) - (b.ticket ?? 0));
  const now = ranked[0] ?? null;
  const next = ranked.slice(1);
  const onTheWay = views.filter((vehicle) => vehicle.state === "on_the_way" || (vehicle.ticket == null && vehicle.state !== "released"));
  const exceptions = views.filter((vehicle) => vehicle.state === "held");

  const called = session.students
    .filter((child) => views.some((vehicle) => vehicle.students.some((row) => row.id === child.id && row.state === "called")))
    .map((child) => ({ id: child.id, name: `${child.firstName} ${child.lastName}`, grade: child.grade }));

  const holds = views.flatMap((vehicle) =>
    vehicle.students
      .filter((child) => child.state === "held")
      .map((child) => ({
        id: child.id,
        name: child.name,
        grade: child.grade,
        reason: vehicle.holdParentSafe ?? "Held",
      })),
  );

  const homeroomIds = [...new Set(session.students.map((child) => child.homeroomId))];

  return {
    school: session.school,
    campus: session.campus,
    clock: session.clock,
    dateLabel: session.dateLabel,
    cutoffLabel: session.cutoffLabel,
    delay: session.delay,
    paused: session.paused,
    inLine: ranked.length,
    now,
    next,
    onTheWay,
    exceptions,
    porch: { called, holds },
    homerooms: homeroomIds.map((id) => {
      const members = session.students.filter((child) => child.homeroomId === id);
      const teacher = members[0]?.teacher ?? "Teacher";
      const grade = [...new Set(members.map((child) => child.grade))].join(", ");
      const deltas = members.flatMap((child) => {
        if (child.blocked) return [{ id: child.id, name: `${child.firstName} ${child.lastName}`, detail: "Blocked. Do not send this student to the curb." }];
        if (child.earlyRelease) {
          return [{ id: child.id, name: `${child.firstName} ${child.lastName}`, detail: `Already picked up by ${child.earlyRelease.adult} at ${child.earlyRelease.time}.` }];
        }
        return [];
      });
      const roomCalled = called.filter((child) => members.some((member) => member.id === child.id));
      return { id, teacher, label: `${teacher} · ${grade}`, deltas, called: roomCalled };
    }),
    households: session.households.map((household) => ({
      id: household.id,
      name: household.name,
      familyCode: household.familyCode,
      car: household.car,
      adultName: household.todayAdultName ?? household.adultName,
      relationship: household.relationship,
      vehicle: views.find((vehicle) => vehicle.householdId === household.id && vehicle.state !== "released") ?? null,
      students: household.studentIds.map((id) => {
        const child = session.students.find((item) => item.id === id)!;
        return {
          id: child.id,
          name: `${child.firstName} ${child.lastName}`,
          grade: child.grade,
          blocked: child.blocked,
          earlyRelease: child.earlyRelease,
        };
      }),
    })),
    changes: session.changes.map((change) => ({
      ...change,
      householdName: session.households.find((household) => household.id === change.householdId)?.name ?? "Household",
    })),
    releases: session.releases,
    audit: session.audit,
    devices: [
      { id: "gw-entry", name: "Entry gateway", kind: "Gateway", status: "online", detail: "PoE, school network, last heartbeat just now" },
      { id: "gw-curb", name: "Curb gateway", kind: "Gateway", status: "online", detail: "Loading zone, last heartbeat 12 seconds ago" },
      { id: "bc-entry", name: "Entry beacon", kind: "Beacon", status: "online", detail: "Battery about 14 months" },
      { id: "bc-curb", name: "Curb beacon", kind: "Beacon", status: "low", detail: "Replace from the office spare this week" },
    ],
    staff: staffDirectory(),
  };
}

function toView(session: Session, vehicle: Vehicle): VehicleView {
  const household = session.households.find((item) => item.id === vehicle.householdId);
  const students: StudentView[] = Object.entries(vehicle.studentStates).map(([id, state]) => {
    const child = session.students.find((item) => item.id === id)!;
    return {
      id,
      name: `${child.firstName} ${child.lastName}`,
      firstName: child.firstName,
      lastName: child.lastName,
      grade: child.grade,
      teacher: child.teacher,
      homeroomId: child.homeroomId,
      badge: child.badge,
      blocked: child.blocked,
      blockReason: child.blockReason,
      state,
      earlyRelease: child.earlyRelease,
    };
  });
  const callBlocked = !students.some((child) => child.state === "in_class" && !child.blocked);
  return {
    id: vehicle.id,
    householdId: vehicle.householdId,
    householdName: household?.name ?? "Household",
    familyCode: household?.familyCode ?? "",
    car: household?.car ?? "",
    adultName: household?.todayAdultName ?? household?.adultName ?? "Authorized adult",
    relationship: household?.relationship ?? "",
    ticket: vehicle.ticket,
    state: vehicle.state,
    zone: vehicle.zone,
    zoneLabel: ZONES[vehicle.zone],
    holdParentSafe: vehicle.holdParentSafe,
    carsAhead: carsAhead(session, vehicle),
    students,
    callBlocked,
  };
}
