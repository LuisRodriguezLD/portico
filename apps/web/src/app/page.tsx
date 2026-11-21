"use client";

import Link from "next/link";
import { Suspense } from "react";
import { DemoBar } from "@/components/demo-bar";
import { useSession } from "@/components/use-session";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const { session } = useSession();
  return (
    <>
      <DemoBar />
      <main style={{ maxWidth: "46rem", margin: "0 auto", padding: "1.4rem 1rem 3rem" }}>
        <p style={{ letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", fontSize: "0.78rem" }}>Curb demo · one lane</p>
        <h1 className="display" style={{ fontSize: "clamp(2.6rem, 6vw, 4.2rem)", lineHeight: 0.95, fontWeight: 560, marginBottom: "0.6rem" }}>
          {session ? `${session.inLine} cars are in the Northbridge line.` : "Northbridge is in the middle of dismissal."}
        </h1>
        <p style={{ fontSize: "1.15rem" }}>
          It is Tuesday, 2:41 PM. The cutoff was 1:30. Anika Patel is at the curb in a white RAV4. The Chen car has not taken a number yet, because being on the way is not the same as being in the driveway.
        </p>
        <p>
          Fobs and phones are simulated. Every name is fictional. This afternoon stays in your browser, so a second tab on this device stays in step. A ticket is still issued only at the driveway, or when the office types a family code. Drill PINs, if you have to override Sam Ellis: James Whitfield 2468, Diane Frost 1357.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "0.7rem", marginTop: "1.2rem" }}>
          <Door href="/queue" title="Curb" detail="James's iPad. Call, hold, loaded." />
          <Door href="/parent" title="Parent" detail="Maya Chen's phone. English and Spanish." />
          <Door href="/teacher" title="Grade 2" detail="Priya Shah. Sam is blocked. Rohan is not called yet." />
          <Door href="/teacher?room=dalton" title="Grade 5" detail="Chris Dalton. No changes. Nothing to tap." />
          <Door href="/porch" title="Porch" detail="The hallway screen. Names, no photos." />
          <Door href="/admin" title="Office" detail="Diane's desk. Delays, changes, devices." />
          <Door href="/attendance" title="Roll" detail="Priya's morning. An absence leaves the carline." />
          <Door href="/lunch" title="Lunch" detail="Maya cannot order peanut butter. Balances are prepaid." />
          <Door href="/news" title="News" detail="Grade 2 hears about the library. Grade 1 does not." />
        </div>
      </main>
    </>
  );
}

function Door({ href, title, detail }: { href: string; title: string; detail: string }) {
  return (
    <Link href={href} className="card" style={{ textDecoration: "none", padding: "1rem", display: "block" }}>
      <span className="display" style={{ fontSize: "1.7rem" }}>{title}</span>
      <span style={{ display: "block", color: "var(--muted)", marginTop: "0.35rem" }}>{detail}</span>
    </Link>
  );
}
