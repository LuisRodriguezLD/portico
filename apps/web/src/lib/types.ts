export type VehicleState =
  | "expected"
  | "on_the_way"
  | "in_queue"
  | "at_curb"
  | "called"
  | "held"
  | "released"
  | "cancelled";

export type StudentState = "in_class" | "called" | "held" | "released" | "skipped";

export type Zone = "none" | "on_the_way" | "in_lot" | "at_curb";

export type Student = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  teacher: string;
  homeroomId: string;
  badge: string;
  blocked: boolean;
  blockReason?: string;
  earlyRelease?: { adult: string; time: string };
  allergens: string[];
  allergyVerified: boolean;
  mealBalanceCents: number;
  mealNoCharge: boolean;
};

export type AttendanceStatus = "unmarked" | "present" | "absent" | "tardy" | "excused";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: "school" | "grade" | "section";
  audienceRef: string;
};

export type SchoolEvent = {
  id: string;
  title: string;
  whenLabel: string;
  audience: "school" | "grade" | "section";
  audienceRef: string;
};

export type MenuItem = {
  id: string;
  name: string;
  day: string;
  priceCents: number;
  allergens: string[];
};

export type MealOrder = {
  id: string;
  studentId: string;
  itemId: string;
  status: "ordered" | "served" | "blocked";
};

export type Household = {
  id: string;
  name: string;
  familyCode: string;
  car: string;
  adultName: string;
  relationship: string;
  studentIds: string[];
  todayAdultName: string | null;
};

export type Vehicle = {
  id: string;
  householdId: string;
  ticket: number | null;
  state: VehicleState;
  zone: Zone;
  holdParentSafe: string | null;
  studentStates: Record<string, StudentState>;
};

export type ChangeRequest = {
  id: string;
  householdId: string;
  note: string;
  status: "pending" | "approved" | "rejected";
};

export type Release = {
  id: string;
  studentId: string;
  vehicleId: string | null;
  adultName: string;
  staffName: string;
  secondStaffName?: string;
  method: "curb" | "override" | "early";
  at: string;
};

export type AuditLine = { at: string; text: string };

export type Session = {
  school: string;
  campus: string;
  clock: string;
  dateLabel: string;
  cutoffLabel: string;
  delay: string | null;
  paused: boolean;
  nextTicket: number;
  students: Student[];
  households: Household[];
  vehicles: Vehicle[];
  changes: ChangeRequest[];
  releases: Release[];
  audit: AuditLine[];
  attendance: Record<string, AttendanceStatus>;
  announcements: Announcement[];
  events: SchoolEvent[];
  menu: MenuItem[];
  orders: MealOrder[];
  orderKeys: string[];
};

export type Action =
  | { type: "on_the_way"; householdId: string }
  | { type: "fob"; householdId: string }
  | { type: "call"; vehicleId: string; staffId: string }
  | { type: "hold"; vehicleId: string; staffId: string; reason: string }
  | { type: "hold_student"; vehicleId: string; studentId: string; staffId: string; reason: string }
  | { type: "clear_hold"; vehicleId: string; staffId: string }
  | { type: "loaded"; vehicleId: string; staffId: string }
  | { type: "manual"; familyCode: string; staffId: string }
  | { type: "delay"; message: string | null; staffId: string }
  | { type: "pause"; staffId: string }
  | { type: "request_change"; householdId: string; note: string }
  | { type: "decide_change"; changeId: string; approve: boolean; staffId: string }
  | {
      type: "override";
      vehicleId: string;
      staffId: string;
      pin: string;
      secondStaffId: string;
      secondPin: string;
      reason: string;
    }
  | { type: "mark_attendance"; studentId: string; status: AttendanceStatus; staffId: string }
  | { type: "submit_roll"; homeroomId: string; staffId: string }
  | { type: "post_announcement"; title: string; body: string; audience: "school" | "grade" | "section"; audienceRef: string; staffId: string }
  | { type: "add_event"; title: string; whenLabel: string; audience: "school" | "grade" | "section"; audienceRef: string; staffId: string }
  | { type: "order_lunch"; studentId: string; itemId: string; idempotencyKey: string }
  | { type: "load_meal"; studentId: string; amountCents: number; idempotencyKey: string }
  | { type: "serve_lunch"; orderId: string; staffId: string }
  | { type: "reset" };

export type StudentView = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  grade: string;
  teacher: string;
  homeroomId: string;
  badge: string;
  blocked: boolean;
  blockReason?: string;
  state: StudentState;
  earlyRelease?: { adult: string; time: string };
};

export type VehicleView = {
  id: string;
  householdId: string;
  householdName: string;
  familyCode: string;
  car: string;
  adultName: string;
  relationship: string;
  ticket: number | null;
  state: VehicleState;
  zone: Zone;
  zoneLabel: string;
  holdParentSafe: string | null;
  carsAhead: number | null;
  students: StudentView[];
  callBlocked: boolean;
};

export type PublicSession = {
  school: string;
  campus: string;
  clock: string;
  dateLabel: string;
  cutoffLabel: string;
  delay: string | null;
  paused: boolean;
  inLine: number;
  now: VehicleView | null;
  next: VehicleView[];
  onTheWay: VehicleView[];
  exceptions: VehicleView[];
  porch: {
    called: { id: string; name: string; grade: string }[];
    holds: { id: string; name: string; grade: string; reason: string }[];
  };
  homerooms: {
    id: string;
    teacher: string;
    label: string;
    deltas: { id: string; name: string; detail: string }[];
    called: { id: string; name: string; grade: string }[];
  }[];
  households: {
    id: string;
    name: string;
    familyCode: string;
    car: string;
    adultName: string;
    relationship: string;
    vehicle: VehicleView | null;
    students: {
      id: string;
      name: string;
      grade: string;
      homeroomId: string;
      blocked: boolean;
      earlyRelease?: { adult: string; time: string };
      attendance: AttendanceStatus;
      allergens: string[];
      allergyVerified: boolean;
      mealBalanceCents: number;
      mealNoCharge: boolean;
    }[];
  }[];
  announcements: Announcement[];
  events: SchoolEvent[];
  menu: MenuItem[];
  orders: (MealOrder & { studentName: string; itemName: string; priceCents: number })[];
  rolls: { studentId: string; name: string; grade: string; homeroomId: string; status: AttendanceStatus }[];
  changes: (ChangeRequest & { householdName: string })[];
  releases: Release[];
  audit: AuditLine[];
  devices: { id: string; name: string; kind: string; status: "online" | "low"; detail: string }[];
  staff: { id: string; name: string }[];
};
