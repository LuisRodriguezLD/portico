# Non-functional requirements

Numbers are release bars for the pilot unless marked as a later target. If a bar is missed, change the product or the copy. Do not leave a number in this file that nobody measures.

## Dismissal performance

| Requirement | Bar |
| --- | --- |
| Gateway sighting committed to ticket, healthy WAN | p95 under 2 seconds |
| Staff Call to teacher view and porch display | p95 under 2 seconds on school Wi-Fi |
| Parent app shows an existing ticket after connectivity returns | Under 5 seconds after the app can reach the API |
| Queue snapshot for a session of 400 students and 200 vehicles | Under 1 second at the API, p95 |
| Staff search by name or family code | Under 300 ms p95 against a warm cache of today's session |
| iPad first paint of the queue after load, warm cache | Under 2 seconds |

These bars are about a single campus. They are not a national concurrency claim. The peak that matters is one school's dismissal, plus a handful of schools dismissing in the same hour.

## Capacity planning assumption

- Up to 800 students dismissed in a 40-minute window at one campus
- Up to 40 vehicles in queue at once
- Up to 3 gateways posting sightings
- Up to 30 staff and teacher clients subscribed to one session
- A pilot fleet of 5 schools, then a commercial assumption of 100 schools dismissing across US time zones, not 100 schools at the same second

Load-test the ticket transaction and the fanout before the first pilot week. A spreadsheet estimate is not the test.

## Availability

| Surface | Target |
| --- | --- |
| Monthly API and web, excluding a published maintenance window | 99.9% |
| Dismissal window for a school with a healthy local network | Degraded mode must still release. Full live fanout target 99.95% during that school's window |
| Planned maintenance | Never during any active US dismissal window. Default freeze 1:30–4:30 p.m. local in each continental US zone on school days |

Degraded mode is specified in [Architecture](07-architecture.md) and the fallback matrix in [Carpool and dismissal](04-carpool-and-dismissal.md). Availability math does not count "the iPad was in airplane mode" as Portico downtime. It does count "API could not mint a ticket while the gateway was online."

Recovery: RPO 1 hour for the database, RTO 8 hours for a regional failure in the pilot. Ticket idempotency must survive a primary failover without duplicate tickets. Test failover once before paid schools depend on the system.

## Offline and weak networks

- Staff client operates at least 15 minutes with no WAN, using the preloaded session
- Gateway buffers at least 12 hours of sightings
- Parent app explains the offline state and does not invent "cars ahead"
- Photo failure never blocks Call or Loaded

## Battery

- Parent approach during one dismissal: under 2% on the reference iPhone and reference mid-range Android used in the pilot test plan
- No persistent Android foreground service outside the dismissal window
- A debug screen in the parent app (hidden, support-enabled) can show whether location was read, so battery complaints are diagnosable without a syslog novel

## Clients

- Parent app: current and previous major iOS, and Android versions still receiving security patches that cover at least 90% of a typical private-school parent population. Recompute that floor from pilot device stats rather than guessing forever
- Staff queue: current and previous Safari on iPadOS, landscape
- Admin: current Chrome, Safari, Firefox, and Edge on desktop. Admin is not optimized for phones in MVP
- Porch display: current Chrome or Safari in kiosk or full-screen, 1080p

## Accessibility

- Admin and teacher web: WCAG 2.2 AA
- Parent Today and Carline Status: VoiceOver and TalkBack can complete "hear ticket and cars ahead" and "activate I'm on my way"
- Staff queue: each action is a named control, not only a color. Block state is an icon plus the word Blocked
- Contrast in the glare theme meets AA for text and for the Call control
- Spanish and English strings fit the layouts in [UX and key screens](05-ux-and-key-screens.md), including larger Dynamic Type on the parent home screen

## Internationalization and time

- School time zone is the authority for cutoff, windows, and quiet hours
- Store UTC
- Parent copy labels school time when showing a cutoff
- Spanish (Latin American) is a first-class parent locale, reviewed by a person, not only a model
- Grades and currency: US only. USD only. Do not add a currency switch

## Security NFRs

- Authorization negative tests run in CI for cross-school and cross-household access on student reads
- Audit write failure fails the release. Do not release a student and "log later"
- Certificate or key compromise procedure for a gateway is documented: revoke device cert, ship a replacement config, tickets from that device stop
- Secrets are not in the repo and not in the mobile binary

## Privacy NFRs

- A production log sample, reviewed before pilot, contains no student names, guardian emails, message bodies, or raw coordinates
- Sighting radio detail is absent from the database after 72 hours in a scheduled-job test
- End-of-contract deletion is rehearsed on a fake school before it is promised with a calendar date

## Operability

- Gateway last-seen visible in admin, alert at two missed heartbeats during school hours
- A status view for Portico staff: which schools are inside a dismissal window right now, error rate on ticket minting, fanout lag
- Structured logs with `school_id`, `session_id`, and `vehicle_id` where relevant, and without names
- Feature entitlement changes take effect without a deploy
- A bad web deploy of the admin console can be rolled back without rolling back a working queue, or the queue is cached well enough that a 15-minute rollback does not stop release. Prefer both

## Data integrity

- Ticket numbers unique per session under a concurrency test of at least 20 simultaneous sightings
- Idempotent replay of the same gateway sighting does not create a second vehicle
- CSV activation is transactional per file
- Ledger entries for a payment balance to the payment amount plus fee lines. A daily reconciliation job flags drift. Campus launch blocks on this job existing

## Compatibility and hardware environment

- Gateways tolerate the school "guest network is isolated" problem by documenting a required outbound HTTPS allow and a way to test it during install
- Beacons remain readable after a typical winter and a typical dashboard-heat summer in the site-survey climate range
- Fob daily token still matches with a clock drift of 48 hours

## Non-requirements (so they are not silently added)

- 99.99% availability
- Active-active multi-region
- Offline parent queue editing
- Native Android tablet staff client
- Full WCAG audit of every future module before the module's own phase. Each phase inherits the bar when it ships, and MVP web includes admin, teacher, queue, and porch only
