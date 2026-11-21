"use client";

import { Suspense, useState } from "react";
import { DemoBar, StatusBanners } from "@/components/demo-bar";
import { useSession } from "@/components/use-session";
import { visibleTo } from "@/lib/audience";

export function NewsBoard() {
  return (
    <Suspense fallback={null}>
      <NewsInner />
    </Suspense>
  );
}

function NewsInner() {
  const { session, error, act } = useSession();
  const [householdId, setHouseholdId] = useState("chen");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"school" | "grade" | "section">("school");
  const [audienceRef, setAudienceRef] = useState("school");

  if (!session) {
    return (
      <>
        <DemoBar />
        <p style={{ padding: "2rem" }}>Opening the day…</p>
      </>
    );
  }

  const household = session.households.find((item) => item.id === householdId) ?? session.households[0];
  const viewers = household.students;
  const seen = {
    announcements: visibleTo(session.announcements, viewers),
    events: visibleTo(session.events, viewers),
  };

  return (
    <>
      <DemoBar />
      <StatusBanners delay={session.delay} paused={session.paused} offline={false} error={error} />
      <main style={{ maxWidth: "46rem", margin: "0 auto", padding: "1.2rem 1rem 3rem", display: "grid", gap: "1rem" }}>
        <header>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>What this household is allowed to see</p>
          <h1 className="display" style={{ fontSize: "2.4rem", margin: "0.2rem 0", fontWeight: 560 }}>News and calendar</h1>
          <select className="texty" style={{ width: "auto" }} value={householdId} onChange={(event) => setHouseholdId(event.target.value)} aria-label="Household">
            {session.households.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </header>
        <section>
          <h2>Announcements</h2>
          {seen.announcements.map((item) => (
            <article key={item.id} className="card" style={{ padding: "0.9rem 1rem", marginBottom: "0.5rem" }}>
              <strong>{item.title}</strong>
              <p style={{ marginBottom: 0 }}>{item.body}</p>
            </article>
          ))}
        </section>
        <section>
          <h2>Calendar</h2>
          {seen.events.map((item) => (
            <p key={item.id} className="card" style={{ padding: "0.9rem 1rem" }}>
              <strong>{item.title}</strong>
              <br />
              {item.whenLabel}
            </p>
          ))}
        </section>
        <form
          className="card"
          style={{ padding: "1rem", display: "grid", gap: "0.5rem" }}
          onSubmit={(event) => {
            event.preventDefault();
            act({ type: "post_announcement", title, body, audience, audienceRef, staffId: "diane" });
            setTitle("");
            setBody("");
          }}
        >
          <h2 style={{ margin: 0 }}>Post as the office</h2>
          <input className="texty" aria-label="Title" placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <textarea className="texty" aria-label="Body" placeholder="Body" value={body} onChange={(event) => setBody(event.target.value)} />
          <label>
            Audience{" "}
            <select
              className="texty"
              style={{ width: "auto" }}
              value={`${audience}:${audienceRef}`}
              onChange={(event) => {
                const [nextAudience, ref] = event.target.value.split(":");
                setAudience(nextAudience as "school" | "grade" | "section");
                setAudienceRef(ref);
              }}
            >
              <option value="school:school">Whole school</option>
              <option value="grade:Grade 2">Grade 2</option>
              <option value="grade:Grade 5">Grade 5</option>
              <option value="section:shah">Priya Shah room</option>
            </select>
          </label>
          <button className="tap ghost" type="submit">Post announcement</button>
          <button
            className="quiet"
            type="button"
            onClick={() => act({ type: "add_event", title: title || "Early dismissal", whenLabel: "Tomorrow, 12:30 PM", audience, audienceRef, staffId: "diane" })}
          >
            Add a calendar event from the title
          </button>
        </form>
      </main>
    </>
  );
}
