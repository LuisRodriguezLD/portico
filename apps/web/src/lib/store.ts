import fs from "fs";
import path from "path";
import { apply } from "./reduce";
import { present } from "./present";
import { seed } from "./seed";
import type { Action, PublicSession, Session } from "./types";

const file = path.join(process.cwd(), "data", "session.json");

let chain: Promise<void> = Promise.resolve();

export function readSession(): PublicSession {
  return present(readRaw());
}

export function updateSession(action: Action): Promise<{ session: PublicSession; error?: string }> {
  const run = chain.then(() => {
    if (action.type === "reset") {
      const fresh = seed();
      writeRaw(fresh);
      return { session: present(fresh) };
    }
    const result = apply(readRaw(), action);
    writeRaw(result.session);
    return { session: present(result.session), error: result.error };
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function readRaw(): Session {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Session;
    if (!parsed.vehicles || !parsed.households) return seed();
    return parsed;
  } catch {
    const fresh = seed();
    writeRaw(fresh);
    return fresh;
  }
}

function writeRaw(session: Session) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(session));
  fs.renameSync(temporary, file);
}
