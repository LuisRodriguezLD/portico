# UX and key screens

## Principles

1. **The carline has twenty seconds.** One primary action on the parent home screen. One primary car on the staff screen.
2. **Sun, gloves, and a substitute.** Staff UI is high contrast, photo-first, and usable at arm's length. Minimum body size 18pt. Targets at least 64pt. No hover-only behavior.
3. **Teachers see change, not the whole school.** An empty state that says "no changes today" is a successful screen.
4. **School words.** Carline, guardian, household, dismissal, statement. Not "mobility event," "user," or "learner."
5. **The outdoors screen is not the office screen.** The iPad queue is not a shrunk admin console. The business office gets a dense web app. Do not make one layout serve both.
6. **No map.** Zones and a ticket. See [D6](decisions.md).
7. **Permission prompts tell the truth.** Location "Always" is required for automatic arrival on iOS. Say that, say we only read location inside the dismissal window and the outer fence, and offer "I'll tap when I leave" as an equal choice, not a failure state.
8. **Lock screens stay vague.** Push text is "Pickup update from [School]" without the student's name, the adult's name, or a balance. Detail loads inside the app after unlock.
9. **English and Spanish** for parent and authorized-adult surfaces in MVP. Staff console English first. Every parent string ships in both languages or it does not ship.
10. **Accessible by default.** Web consoles target WCAG 2.2 AA. Parent app supports Dynamic Type and VoiceOver on Today and Carline Status. Color is never the only signal for block, hold, or allergy.
11. **Quiet money.** Balances and fees are plain sentences. No confetti, no "you're all set!" when a payment fails, no dark patterns on the plan fee.
12. **Students get a calm tool.** No streaks, no classmate graph, no public reactions on academic work.

## Parent app

### Today

Default tab on school days during the afternoon, and the landing screen every morning.

```
┌─────────────────────────────┐
│  Tuesday · Northbridge      │
│                             │
│  Maya Chen · Grade 2        │
│  Carline with you           │
│  Leo Chen · Grade 5         │
│  Carline with you           │
│                             │
│  [ I'm on my way ]          │
│                             │
│  Change pickup before 1:30  │
│  Grandma Alvarez is ok Thu  │
└─────────────────────────────┘
```

- If a fob is already heard, this screen becomes the ticket view without requiring the button.
- If the plan is walker or aftercare, the primary button is absent and the mode is named.
- Cutoff is shown in school time.

### Carline status

```
┌─────────────────────────────┐
│  Ticket 18                  │
│  4 cars ahead               │
│  Zone: in the lot           │
│                             │
│  Maya and Leo will be       │
│  called together            │
│                             │
│  Hold: none                 │
└─────────────────────────────┘
```

States the parent can actually see: not in line, on the way, in the lot, at the curb, called, released, held (with a short reason the school marked parent-safe), already picked up earlier. No estimated "cars ahead" unless the queue position is real. If we do not know, say "In the lot — staff will call you" rather than a fake number.

### Change pickup

A short form: who is picking up, from the authorized list, or a request to add someone (goes to approval if the school requires it, otherwise saves and notifies the other custodial guardian). After cutoff, the form explains that the front office has to confirm, and it sends that request instead of pretending to save.

### People

Authorized adults, fobs linked to the household, and a revoke action. Revoke is immediate and tells the parent it takes effect at the gateways within a minute when the network is healthy.

### Permission primer

Three cards, each with allow and a no-thanks path:

| Permission | Why we ask | If denied |
| --- | --- | --- |
| Notifications | Called, held, plan changes | Status still works inside the app |
| Location Always | Wake near school on dismissal days only | "I'm on my way" remains primary |
| Bluetooth | Hear curb beacons for a better ticket | Fob and manual code still work |

Show a one-line battery promise: pickup window only, target under 2% for a normal approach. If we miss that in testing, change the copy. Do not keep the promise as marketing.

### Later tabs (not MVP)

Lunch, Pay, Calendar, Classes. They appear only when the school is entitled and the person has the relationship grant. A Curb school parent never sees a disabled Pay tab.

## Staff queue (iPad, landscape)

This is the product James uses in the sun.

```
┌──────────────────────────────────────────────────────────┐
│  Northbridge carline   2:41 PM   23 in line   Delay off  │
├────────────────────────────┬─────────────────────────────┤
│  NOW                       │  NEXT                       │
│  Ticket 14 · Chen          │  15  Ortiz · 2 kids         │
│  Silver Sienna             │  16  Patel · 1              │
│                            │  17  Brooks · 1             │
│  [photo] Maya · Grade 2    │                             │
│  [photo] Leo  · Grade 5    │                             │
│  Adult: Maya Chen (mother) │                             │
│                            │                             │
│  [ CALL ]     [ HOLD ]     │                             │
└────────────────────────────┴─────────────────────────────┘
```

- **CALL** marks the vehicle's students called and pushes the teacher list and porch display.
- **HOLD** requires a reason from a short list (office, nurse, not yet, other). Parent sees a parent-safe subset.
- **LOADED** sits on the now-card after call, and is the release.
- Search is a persistent field: student name, family code, ticket. Search results show block state before any action.
- Manual add is three taps: find student, confirm adult, issue ticket. It is visible. Walk-ups are normal.
- Glare theme is the default outdoors palette (near-black text, white cards, one accent). A night palette is unnecessary for dismissal.
- The queue works from a cached session if the WAN drops. Banner: "Offline — releases will sync." Actions stay available. See [Non-functional requirements](11-non-functional-requirements.md).

Vehicle detail is a second screen, not a drawer of tabs: siblings, notes marked "show at curb," car description, and the override path if needed. Custody narrative that is not needed to release the child stays in the office console.

## Porch display

A logged-in or tokenized full-screen browser on a TV the school already owns.

```
CALLED
Maya Chen · Grade 2        Leo Chen · Grade 5
Ava Brooks · Grade 1

HOLD
Jonah Reid · office
```

No photos on the porch display. It faces a hallway of children. Names of called students are inherent to dismissal; photos are not. No queue of every family, which would be a live location board.

## Teacher view

Phone or laptop, same account as attendance later.

- Header: "3 changes today" or "No dismissal changes."
- List of called students, largest element.
- Transport mode only where it differs from carline (walker, bus, aftercare, early pickup already gone).
- No ticket numbers, no parent location, no map.

## Admin console (web)

Used by Alicia, Diane, and Helen. Desktop first, usable on a laptop. Not a primary phone layout in MVP.

| Area | MVP | Later |
| --- | --- | --- |
| Roster import review | Yes | SIS sync |
| Households and guardians | Yes | — |
| Custody and blocks | Yes | — |
| Carline window, cutoff, geofence | Yes | Second lane |
| Devices: gateways, beacons, fobs | Yes | — |
| Audit | Yes | — |
| Staff and roles | Yes | — |
| Announcements | Dismissal delay only | Full announcements |
| Lunch, money, grades | No | Per phase |

The geofence editor is a circle plus a radius in meters, with the campus address as the center. Do not ship a polygon drawing tool in the pilot. Radius options: 800, 1500, 2500 meters. Default 1500.

Empty, loading, and error:

- Import review shows row errors inline and will not activate a file with unresolved identity errors.
- Device list shows last-seen and a red row if a gateway missed two heartbeats during school hours.
- Audit defaults to today, filterable by student and by actor.
- Destructive actions (block, revoke fob, withdraw student) confirm with the student's name typed or a second button that names the consequence. No cute confirms.

## Student app (School tier, later)

Schedule, grades, lunch preorder, class room entry. No Today carline control unless the student is self-dismiss. Visual tone is closer to a printed planner than to a messaging app: lots of white space, no infinite scroll of posts on the home screen.

## Writing rules for product copy

- Lead with the consequence. "Grandma can pick up on Thursdays" before "authorized pickup record created."
- Times in school local time, labeled once per screen if there is any chance of ambiguity.
- Errors say what to do. "No signal yet. Your fob can still hold your place, or the staff can enter family code 4412."
- Do not blame the parent for a denied permission.

## UX acceptance criteria

- Given a 375pt-wide phone, when Today renders in Spanish at the largest Dynamic Type size we claim to support, then the primary action remains on screen without horizontal scrolling.
- Given the iPad queue in glare theme outdoors (design review on a bright day, not only a simulator), when a substitute reads the now-card, then they can state the students' names and the adult's relationship without pinch-zoom.
- Given a push notification on a locked phone, when it appears, then the text contains the school name and no student name.
- Given a Curb-only school, when a parent explores the app, then no control navigates to a paid module upsell. Upsell is a sales conversation with the school, not a banner to the parent.
- Given a teacher with no changes and no called students, when they open dismissal, then the screen does not ask them to confirm anything.
