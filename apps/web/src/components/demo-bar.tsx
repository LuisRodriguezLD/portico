"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const LINKS = [
  ["/", "Afternoon"],
  ["/queue", "Curb"],
  ["/parent", "Parent"],
  ["/teacher", "Grade 2"],
  ["/teacher?room=dalton", "Grade 5"],
  ["/porch", "Porch"],
  ["/admin", "Office"],
];

export function DemoBar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const room = params.get("room");

  return (
    <nav className="bar" aria-label="Demo">
      <span className="display" style={{ fontWeight: 560, marginRight: "0.4rem" }}>
        Portico
      </span>
      {LINKS.map(([href, label]) => {
        const current =
          href === "/teacher?room=dalton"
            ? pathname === "/teacher" && room === "dalton"
            : href === "/teacher"
              ? pathname === "/teacher" && room !== "dalton"
              : pathname === href;
        return (
          <Link key={href} href={href} aria-current={current ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function StatusBanners({
  delay,
  paused,
  offline,
  error,
}: {
  delay: string | null;
  paused: boolean;
  offline: boolean;
  error: string | null;
}) {
  return (
    <>
      {offline ? <div className="banner bad">Can&apos;t reach the curb. Releases you already made will sync. The paper roster is in the folder.</div> : null}
      {paused ? <div className="banner pause">Line paused. New calls are stopped.</div> : null}
      {delay ? <div className="banner">{delay}</div> : null}
      {error ? <div className="banner bad" role="alert">{error}</div> : null}
    </>
  );
}
