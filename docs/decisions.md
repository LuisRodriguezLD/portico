# Decisions

Calls already made. Change them on purpose, in this file, when evidence contradicts them. Open items that are not yet decisions live in [Metrics, risks, and open questions](12-metrics-risks-and-open-questions.md).

## Product

**D1. Carline is the wedge. SIS replacement is not the pitch.**
Daily pain, a safety story the head of school can tell the board, and a parent habit. Gradebook and tuition ledger come only after the curb works.

**D2. The first customer is a one-campus private day school, PK–8, roughly 150–800 students.**
Carline pain is sharpest before students self-dismiss. Independent schools decide faster than diocesan purchasing. Catholic and Christian school groups are the distribution motion after the product has references, not before.

**D3. The school is the customer. Parents do not pay the subscription.**
A school may recover the cost through a technology fee it already charges. Portico invoices the school annually in advance.

**D4. MVP is a single carline lane per campus.**
Sibling cars must not be split across two queues in the first release. A second lane is a Campus-era feature.

**D5. Hold-and-release is the default dismissal procedure.**
Students stay in class until called. Gym staging is a filter on the same queue, not a second product.

**D6. There is no live map of parents.**
Staff see an ordered list and a zone: on the way, in the lot, at the curb. A map is worse in sunlight and worse for trust.

**D7. A child can be released when the software fails.**
Paper roster for the first term. Manual check-in forever. No-smartphone households are a first-class path, not an edge case.

**D8. Teachers get deltas, not a new job.**
If today's plan is unchanged, the teacher does nothing at dismissal. Attendance, when it exists, is a separate morning task with a one-minute budget.

**D9. Portico does not become a social network.**
No student direct messages. No disappearing messages. No parent-to-parent directory chat in the first chat release. Class rooms are moderated and on the School tier.

**D10. No AI-written report card comments in the first gradebook.**
Schools will ask. Quality, disclosure, and parent trust are not there yet.

**D11. Do not ship a gradebook that makes teachers enter grades twice.**
On the School tier, Portico is the gradebook of record and can export. Until a school chooses that, show grades only if they can be read from the SIS without re-keying. A decorative gradebook with manual duplicate entry is a failed module.

## Carline hardware

**D12. Queue position is never taken from GPS.**
GPS and geofences wake the phone and estimate arrival. Tickets come from an entry gateway, an iBeacon sighting the phone uploads, or a staff tap.

**D13. The standard kit includes fobs and powered gateways, not beacons alone.**
iOS can monitor iBeacon regions in the background. iOS cannot be trusted to advertise a BLE identity in the background. Phones with no signal cannot upload a sighting. A visor fob heard by a gateway on school ethernet is the path that works for grandparents, dead zones, and dead batteries.

**D14. Advertisements carry a rotating token, never a name.**
Fob tokens rotate daily from a preloaded key. Phone tokens rotate per pickup session. Resolution happens on the Portico server.

**D15. The phone is for intent, ETA, and changes. The fob is for order at the curb.**
Both ship in MVP. "I'm on my way" is a primary button, not a consolation for denied location permission.

## Money

**D16. The school is the merchant. Portico does not hold tuition.**
Stripe Connect connected accounts. Holding school funds would turn a software company into a regulated money business and a trust problem.

**D17. Pay-in-full ACH is free to the family. Profit on payments is explicit.**
A $50 per student payment-plan fee for monthly tuition, and a card convenience fee where the law allows. No silent basis-point skim of tuition. Business officers have seen that movie.

**D18. Lunch is a prepaid ledger, not a card swipe per meal.**
Families load the meal account (ACH by default). The cafeteria taps a name. The line stays fast, and Portico does not pay card fees on every taco.

**D19. Incidentals and lunch ship before the tuition ledger.**
Portico Pay on field trips and meal balances earns the payments muscle. Tuition ledger is School tier, sold to schools that do not already live inside FACTS or Blackbaud Tuition Management, and to schools that want a better family experience on top of a ledger we own.

## Platform

**D20. One modular monolith, one shared Postgres database, row-level security on every tenant table.**
Not a service per module. Not a database per school. Revisit only if a diocese contract requires an isolated database and pays for it.

**D21. Buy auth and payments. Build roster, carline, and the school ledger.**
WorkOS for staff SSO and SAML. Stripe for card and ACH. The queue, the household model, and the release audit are the product.

**D22. Parent app is React Native (prebuild, not Expo Go). Admin and staff queue are web. Porch display is a URL.**
Background iBeacon and location permissions need a real native binary. Staff must be able to open the queue on an iPad without waiting on an App Store release during a bad afternoon.

**D23. United States only, English and Spanish in the parent app at MVP.**
Staff console is English first. School time zone is the only time zone that matters for cutoffs.

**D24. Student data is never sold, never advertised against, and never used to train foundation models.**
If an AI feature appears later, it runs under a no-training contract and a separate decision.

**D25. Design partners are five schools, Curb waived for twelve months, kit included, reference calls required.**
The pilot is a live carline, not a demo account.
