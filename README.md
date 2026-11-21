# Portico

**The curb knows who is coming. The rest of the school runs from the same place.**

Portico is a school operations platform for private K–12 schools. The first product is carline: staff see who is arriving, in what order, and can call the right students to the pickup zone without a radio scramble. The company is a full school platform — lunch, money, grades, and class communication — sold to the school and used every day by parents.

This repository is the product and technical specification, plus the first working slice of Curb: a dismissal afternoon you can run in the browser. The working name **Portico** still needs a trademark search before it is public-facing in market.

## Run the Curb demo

The public demo is [portico-seven-rho.vercel.app](https://portico-seven-rho.vercel.app). Fobs, beacons, and phones are simulated, and every name is fictional. The afternoon is stored in the browser you open, so two tabs on the same device stay in step. A ticket is still issued only when a car reaches the driveway, or when staff enter a family code.

```bash
cd apps/web
npm install
npm run dev
```

The dev server listens on port 43123. Open the afternoon page, then the curb, a parent phone, a classroom, the porch, the office, the roll, lunch, and the news. The afternoon is stored in the browser, and every name is fictional. `npm test` checks the dismissal and Campus rules.

## Who it is for

Private day schools, especially PK–8, with a staffed carline and more than one system that parents are tired of logging into. The buyer is the head of school together with the business officer and the director of operations. Parents, carline staff, teachers, and front-office admins are the daily users.

Portico is not a public-district SIS, a daycare product, or a student social network.

## The wedge

Private-school families already pay for a careful experience. For twenty minutes a day that experience is a queue of cars, a radio, and a paper roster. Dedicated dismissal apps exist; incumbent student-information systems do not treat the curb as a product. Portico starts there because the pain is daily, visible, and safety-critical, then expands into the parent relationship those systems handle poorly: lunch, incidental charges, tuition payment, grades, and class communication.

The school keeps its current SIS on day one. Portico does not ask a business office to abandon FACTS, Veracross, or Blackbaud in order to fix pickup.

## How the company makes money

Schools pay an annual subscription per enrolled student. Families are not the SaaS customer. Profit also comes from carline hardware kits, implementation, and Portico Pay — explicit payment-plan fees and card convenience fees, with pay-in-full ACH free to families. Portico does not sell student data, run ads, or take a quiet percentage of tuition.

| Tier | Annual price | Minimum | What a school gets |
| --- | --- | --- | --- |
| **Curb** | $15 / student | $4,500 | Carline, roster and households, authorized pickup, dismissal alerts |
| **Campus** | $32 / student | $8,000 | Curb, plus attendance, announcements, calendar, lunch, incidental charges |
| **School** | $58 / student | $14,000 | Campus, plus gradebook, report cards, moderated class rooms, tuition ledger |

A 400-student school pays $6,000 a year on Curb or $23,200 on School, before the one-time carline kit ($1,800 per lane) and implementation. Pricing, margins, and a worked school example are in [Monetization and pricing](docs/06-monetization-and-pricing.md).

## What to build first

**MVP is Curb, and only Curb.** One lane per campus. Parent app, staff iPad, teacher release list, a porch display URL, roster import, households, custody flags, and a hardware kit (gateways, beacons, and visor fobs). No lunch, payments, gradebook, or chat in the first pilot.

Ship that into a live spring carline with a handful of design partners. Sell Campus for the following fall. Treat full SIS replacement as a later choice, not the pitch. Scope, sequencing, and the design-partner offer are in [MVP and roadmap](docs/03-mvp-and-roadmap.md). The decisions behind that sequencing are logged in [Decisions](docs/decisions.md).

## Product map

| Module | Phase | Spec |
| --- | --- | --- |
| Identity, roster, households | MVP | [Identity and roster](docs/modules/identity-and-roster.md) |
| Carline and dismissal | MVP | [Carpool and dismissal](docs/04-carpool-and-dismissal.md) |
| Attendance | Campus | [Attendance](docs/modules/attendance.md) |
| Announcements and calendar | Campus | [Announcements and calendar](docs/modules/announcements-and-calendar.md) |
| Lunch | Campus | [Lunch](docs/modules/lunch.md) |
| Incidentals, tuition, Portico Pay | Campus / School | [Billing and payments](docs/modules/billing-and-payments.md) |
| Gradebook and report cards | School | [Gradebook and report cards](docs/modules/gradebook-and-report-cards.md) |
| Class rooms | School | [Chat](docs/modules/chat.md) |

## Reading paths

| If you are | Read |
| --- | --- |
| Head of school or board member | This page, [Problem and market](docs/01-problem-and-market.md), [MVP and roadmap](docs/03-mvp-and-roadmap.md), [Pricing](docs/06-monetization-and-pricing.md) |
| Director of operations | [Carpool and dismissal](docs/04-carpool-and-dismissal.md), [UX and key screens](docs/05-ux-and-key-screens.md), [Personas and roles](docs/02-personas-and-roles.md) |
| Business officer | [Pricing](docs/06-monetization-and-pricing.md), [Billing and payments](docs/modules/billing-and-payments.md), [Security, privacy, and compliance](docs/10-security-privacy-compliance.md) |
| Engineer or technical founder | [Architecture](docs/07-architecture.md), [Data model](docs/08-data-model.md), [Carpool and dismissal](docs/04-carpool-and-dismissal.md), [NFRs](docs/11-non-functional-requirements.md), [Security](docs/10-security-privacy-compliance.md) |
| Design partner IT lead | [Integrations](docs/09-integrations.md), [Identity and roster](docs/modules/identity-and-roster.md), [Security](docs/10-security-privacy-compliance.md) |

## Document map

1. [Problem and market](docs/01-problem-and-market.md) — buyers, competitors, positioning
2. [Personas and roles](docs/02-personas-and-roles.md) — people, permission model
3. [MVP and roadmap](docs/03-mvp-and-roadmap.md) — what ships when, and what does not
4. [Carpool and dismissal](docs/04-carpool-and-dismissal.md) — hardware, queue, safety, fallbacks
5. [UX and key screens](docs/05-ux-and-key-screens.md) — principles and the screens that matter
6. [Monetization and pricing](docs/06-monetization-and-pricing.md) — tiers, fees, unit economics
7. [Architecture](docs/07-architecture.md) — system shape and stack
8. [Data model](docs/08-data-model.md) — tenancy and core records
9. [Integrations](docs/09-integrations.md) — payments, SIS, Google, Microsoft
10. [Security, privacy, and compliance](docs/10-security-privacy-compliance.md) — FERPA, COPPA, PCI, chat safety
11. [Non-functional requirements](docs/11-non-functional-requirements.md) — speed, availability, accessibility
12. [Metrics, risks, and open questions](docs/12-metrics-risks-and-open-questions.md)
13. [Decisions](docs/decisions.md) — opinionated calls already made

Module specs live in [`docs/modules/`](docs/modules/).

## Status

Working specification, November 2026. Market figures are order-of-magnitude and should be refreshed from NCES and NAIS before a board or investor narrative. Prices are the intended list, not a quote, and payment fees need to be checked against the current Stripe agreement and surcharge law before a school sees them.

© 2026 Portico (working name). All rights reserved. Published so schools, partners, and future teammates can read the plan. Reading is welcome. Republication and reuse of this specification as another company’s product materials is not.
