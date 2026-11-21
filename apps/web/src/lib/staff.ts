const STAFF = [
  { id: "james", name: "James Whitfield", pin: "2468" },
  { id: "diane", name: "Diane Frost", pin: "1357" },
] as const;

export function staffName(id: string) {
  return STAFF.find((person) => person.id === id)?.name ?? "Staff";
}

export function authorize(id: string, pin: string) {
  return STAFF.some((person) => person.id === id && person.pin === pin);
}

export function staffDirectory() {
  return STAFF.map(({ id, name }) => ({ id, name }));
}
