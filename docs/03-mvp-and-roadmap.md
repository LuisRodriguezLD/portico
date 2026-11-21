# MVP and roadmap

## Recommendation

Build **Curb** and stop. Pilot it on live afternoons while carline is still running. Do not staff a gradebook, a chat platform, or a tuition ledger in parallel. Those modules are how school platforms lose years.

The school year, not engineering vanity, sets the sequence:

| Window | What the school is doing | What Portico should be doing |
| --- | --- | --- |
| Late fall and winter | Living with this year's dismissal pain, budgeting | Design-partner agreements, hardware site surveys |
| Spring | Carline still happens every day until the last week of school | Pilot Curb on real afternoons |
| Summer | Rosters, orientation, traffic duty assignments | Install kits, import rosters, train curb leads for fall |
| Fall | New families, no patience | Curb as a paid product; Campus sold for schools that already trust the curb |

As of this specification (November 2026), the fall window for the current school year is already underway. The honest pilot is **spring carline**, with paid fall expansion after that. Promising a full SIS by next fall is how the wedge dies.

## MVP: Curb

A school can run dismissal on Portico, including when phones fail, and can explain every release afterward.

### In the pilot

- School, campus, school year, one time zone, one carline lane
- CSV roster import and a review screen before anything goes live
- Students, households, guardians, authorized pickup adults, photos
- Custody levels and a hard block
- Weekly transport plan and same-day changes with a cutoff
- Parent app (iOS and Android): today plan, "I'm on my way," geofence wake, iBeacon monitoring, ticket and zone, Spanish and English
- Visor fobs and PoE gateways as the path that does not need cellular
- Staff iPad queue: call, hold, loaded, manual add, two-person override
- Teacher view of deltas and the called list
- Read-only porch display URL for a hallway TV
- Dismissal-delay broadcast
- Audit log of imports, list edits, and releases
- Staff sign-in with Google or Microsoft
- Parent sign-in with email magic link; SMS one-time code as backup
- Gateway health alerts
- Paper-roster procedure documented inside the admin console, required for the first term

### Not in the pilot

- A second lane, bus routing, walker optimization beyond a transport mode
- Lunch, payments, tuition, gradebook, chat, calendar, full-day attendance
- Reunification mode (the data model must not block it; the UI waits)
- Live maps, license-plate recognition, facial recognition
- Automatic roster sync from Veracross, Blackbaud, or FACTS
- Parent-to-parent messaging
- Apple Watch, car dashboard projection, SMS for every queue movement
- Multiple countries or languages beyond English and Spanish

### MVP user stories (release bar)

These are the stories that define "pilot ready." Module details are in [Identity and roster](modules/identity-and-roster.md) and [Carpool and dismissal](04-carpool-and-dismissal.md).

**As a** parent, **I want** to be placed in the carline without perfect cell service, **so that** my children are called in order.

- Given an enrolled fob enters the entry gateway's range, when the gateway posts the sighting, then the vehicle receives the next ticket within two seconds on a healthy network and the parent app shows that ticket if the phone is online.
- Given the phone is offline and the fob was heard, when staff look at the queue, then the vehicle is already ordered.
- Given a parent has no fob and no signal, when staff enter the family code, then a ticket can be issued manually and the reason is stored.

**As a** carline lead, **I want** the next cars and the children's photos, **so that** I can call them without a radio round-trip.

- Given a ticket reaches the curb zone, when the queue renders, then the card shows student photos, grade, authorized adult, and car description at the type size in [UX and key screens](05-ux-and-key-screens.md).
- Given staff tap Call, when the tap is confirmed, then the teacher list and the porch display show those students as called.
- Given staff tap Loaded, when the students are marked released, then each release records staff identity, adult, time, and method.

**As a** front-office admin, **I want** a block to stick, **so that** a curb substitute cannot improvise.

- Given a student is blocked, when the ticket is opened, then Call is unavailable until a two-person override with a reason is completed, and school admin is notified.

**As a** teacher, **I want** silence on ordinary days, **so that** dismissal software is not a second job.

- Given no same-day changes for the class, when dismissal starts, then the teacher view shows no action required.
- Given a student is called, when the teacher view refreshes, then that student is visually distinct within two seconds on a healthy network.

### Pilot exit bar

Use this as a go / no-go for selling Curb beyond design partners. Definitions of the metrics are in [Metrics, risks, and open questions](12-metrics-risks-and-open-questions.md).

- At least three schools complete twenty consecutive dismissal days.
- On a normal fair-weather day, at least 80% of carline students are released through Portico rather than around it.
- Staff preference versus the previous method averages 4 out of 5 or better.
- No severity-1 safety incident (unauthorized release, lost child attributable to the product).
- Parent crash-free sessions at or above 99.5% during dismissal windows.
- Queue corrections by staff stay under 5 per 100 tickets, excluding walk-ups that were never expected to auto-ticket.

Missing the reliability bar means another pilot, not an earlier Campus launch.

## Design partners

Five schools. One campus each. PK–8 with a real carline.

- Twelve months of Curb at no subscription charge
- Carline hardware included for one lane, with two fobs per carline household (see [Pricing](06-monetization-and-pricing.md))
- In return: a named operations owner, permission to observe dismissal, a written case study, and two reference calls
- Weekly feedback during the first month of live use, then office hours
- Data-processing agreement and a deletion commitment identical to a paying school

Design partners are not a place to sneak in custom lanes, custom gradebooks, or one-off integrations. If a feature is not in the MVP list, the answer is no until the exit bar is met.

## Phase 2: Campus

Sell to schools that have finished a term of Curb, and to new schools that want the parent hub and will still turn carline on first.

- Full-day attendance and absence notice to guardians
- Announcements by school, division, grade, and section
- Calendar with one-way import from Google or Microsoft, parent subscription
- Lunch menus, preorder, allergy blocks, prepaid balances, cafeteria iPad
- Incidental charges (field trips, athletics, aftercare) via Portico Pay
- Early-pickup log tied to the dismissal session
- Second carline lane
- OneRoster or a first paid SIS import, for schools that outgrow CSV
- Spanish remains on parent-facing strings; business-office screens stay English unless a paying school requires otherwise

Campus is where daily habit and payment volume begin. It is not a SIS replacement. Grades, if shown, are read-only links or a sync that does not require teachers to re-enter scores. See [D11](decisions.md).

## Phase 3: School

For schools that want Portico to be the system of record for teaching and tuition.

- Gradebook (points and standards-based, per division)
- Report card publish and PDF
- Class rooms with the moderation rules in [Chat](modules/chat.md)
- Tuition ledger, payment plans, statements, and the family plan fee
- Payout reconciliation the business officer will sign
- Bi-directional grade export only if an external system still needs a copy; otherwise Portico holds the record

Do not start School work because a single prospect asks. Start it when Curb retention is visible and at least one Campus school is processing lunch loads without reconciliation drama.

## Phase 4: depth, still not a different company

Only after School tier schools are live:

- Emergency reunification using the same authorized-adult graph
- Public API and a small webhook set for roster and dismissal events
- Accounting export beyond CSV (QuickBooks) if business officers are doing the CSV dance every month
- Rotating-fob hardware revision from field data
- Admissions and advancement remain out of scope until a separate strategy says otherwise. They have mature buyers and they dilute the curb story.

## What "full SIS" means here

A private-school SIS eventually includes enrollment status, scheduling, attendance, grades, transcripts, and a parent portal. Portico's School tier covers the parent-visible and teacher-daily parts: attendance, grades, report cards, communication, money. It does not, in any phase described here, include a master schedule builder, a college transcript service, financial aid underwriting, or donor management.

Schools that need a master schedule keep Veracross or Blackbaud for that and keep Portico for the curb and the parent day. That is a successful account, not a failure to close.

## Sequencing principles

1. A feature that adds teacher work does not ship in the same release as its happy path. Ship the silent default first.
2. A feature that introduces card data, chat between adults and minors, or grade-of-record gets its own security review. It does not ride along in a carline sprint.
3. Hardware changes are slower than software changes. Freeze the kit's behavior before the first non-partner install, and ship firmware updates as if a failure bricks dismissal.
4. Say no to district-only requirements (state reporting extracts, thousand-school tenancy) until the private-school business works.
