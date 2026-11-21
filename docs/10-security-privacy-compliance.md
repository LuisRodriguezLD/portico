# Security, privacy, and compliance

Portico handles children's whereabouts, family structure, and, later, money and academic records. The safety bar for release is higher than the bar for a typical SaaS admin tool. The privacy bar is "school official," not "consumer app."

This document is a product and engineering specification. It is not legal advice. Counsel reviews the DPA, the parent notice, surcharge rules, and retention before the first school signs.

## Promises that do not depend on a tier

- No sale of student information
- No advertising, and no use of student data to train foundation models ([D24](decisions.md))
- No live map of families
- No student names on lock-screen notifications
- No direct messages in the first chat release
- A child can be dismissed from a paper roster when the system fails
- The school can export its data and can require deletion when the contract ends

## Roles in the law

For FERPA, the school is the educational agency. Portico acts as a **school official** with a legitimate educational interest, under the school's direct control, as described in a data-processing agreement. Portico does not treat parent consent checkboxes as a substitute for that relationship.

For COPPA, many school uses fall under the school's authority to consent for an educational service. Do not stretch that exception. Features outside the educational service the school requested — behaviorally targeted content, public profiles, optional social features — are out of the product rather than tucked under school consent. Students under 13 get the smallest account that meets the school's purpose.

State student-privacy laws (including California's SOPIPA and New York Education Law 2-d, and the equivalents a given school must flow down) are handled contractually: no targeted advertising, no selling, a public subprocessor list, and a DPA the school can sign. Collect the school's required rider during procurement instead of inventing a fifty-state matrix in the app.

PCI DSS: card data stays in Stripe elements. Portico's target is **SAQ A**. Bank account numbers for ACH stay with Stripe. Staff never type a card into a Portico form.

## Threat model

| Threat | What goes wrong | Control |
| --- | --- | --- |
| Unauthorized release | Child leaves with the wrong adult | Authorized list, block flag, two-person override, audit, photos |
| Impersonated guardian | Attacker adds themselves as pickup | Magic link to the enrolled email, notify all custodial guardians on list changes, step-up auth to edit the list |
| Shared iPad | Substitute browses the school or releases as "carline" | Named users, PIN fast-switch, no generic login, cache wipe |
| Gateway spoof | Fake sightings mint tickets | mTLS device certificates, signed sightings, replay window, token resolution only on the server |
| Stalking via BLE | Observer correlates a fob | Daily rotating token, no PII in the advertisement, revoke |
| Location abuse | Parent or insider tracks a household off campus | Window and fence limits, no coordinate retention, no map, staff role cannot see history of zones after the session closes |
| Cross-tenant leak | School A sees school B | `school_id` RLS plus composite foreign keys plus tests that try to cross the line |
| Chat harm | Grooming, harassment, after-hours contact | No DMs, room defaults, quiet hours, retention, report path. See below |
| Payment fraud or misdirection | Tuition settles to the wrong place | Connected account per school, webhook signatures, ledger separates fees from principal |
| Support overreach | A helpful engineer opens a student record casually | Break-glass with reason, time limit, school-visible audit |
| Lost device | Fob or iPad stolen | Revoke fob, remote session end, iPad cache is today's data only |
| Ransom or destruction | Bad deploy or attack deletes records | Backups, short staging gap, no production data in staging, append-only audit |

## Identity and sessions

- Staff: Google or Microsoft SSO through WorkOS. MFA required for school admin and business office. Carline staff on the shared iPad use SSO once and a 4-digit PIN after that, PIN reset by an admin.
- Guardians: email magic link. SMS OTP if the phone is on file and email is unavailable. Session length 30 days. Editing authorized adults, custody, or payment methods requires a fresh step-up (new magic link or OTP) in the last 10 minutes.
- Students: SSO only, School tier, only if the division enables student login. No student password database.
- Session revocation is immediate for disabled users. Fob revocation is independent of app session.
- Rate-limit magic links and OTP. Do not reveal whether an email is enrolled in the copy of a failure; the timing should not be a clean oracle either, within reason.

## Release safety controls

Specified operationally in [Carpool and dismissal](04-carpool-and-dismissal.md). Security requirements:

- Override requires two distinct staff accounts. The API rejects a second PIN from the same user id.
- A block cannot be cleared from the carline role.
- Every release writes `release_events` and `audit_log` in the same transaction.
- Lock-screen and porch display rules in [UX and key screens](05-ux-and-key-screens.md) are security requirements, not polish.
- Photos use signed URLs that expire within five minutes. The iPad cache is the exception and is wiped as specified in [Architecture](07-architecture.md).

## Location and radio privacy

- Collection purpose: dismissal queue only.
- Collection window: school-configured dismissal window on school days, plus the moment of an explicit "I'm on my way" for a bounded session (default 45 minutes).
- Geography: outer geofence or an explicit tap. No background collection on weekends "just in case."
- Stored facts: zone enum, ticket, timestamps, gateway id. Not a route.
- Debugging radio metadata: 72 hours.
- Families can use the product with location denied. The school must be able to say that in orientation without lying.
- Employees do not get a map tool as a support feature. Support sees the same zone labels the school sees, and only under break-glass.

Parent notice, one page, given at invitation:

- What a fob is and that it talks to school gateways
- That the phone can notice school beacons and a geofence during pickup
- That Portico does not keep a path and does not show a map to staff
- How to revoke a fob and how to dismiss without the app
- Who at the school can see release history

## Chat and child safety (School tier)

Ship these defaults or do not ship chat.

- Rooms are class rooms (teachers, enrolled students, and guardians of those students) or a guardian-teacher thread scoped to one student. Nothing else.
- Student-to-student DMs: not built.
- Staff-to-student DMs: not built. A teacher talks to a student in the class room, which other adults can see, or through school email outside Portico.
- Lower school (through grade 5, school-configurable): `held_for_review` or `teacher_only`. Default `teacher_only` for the youngest division.
- Upper school: `open` posting is allowed only if the school opts in. Default `held_for_review` for the first term of chat.
- Quiet hours default 8:00 p.m. to 7:00 a.m. school time. Students cannot post. Teachers can post an announcement-style message if the school allows; guardians can post when the school allows. When unsure, nobody posts overnight.
- Attachments from students: off. Links from students: off until a school turns them on. Images from teachers: on, scanned for type, size-capped.
- Report action on every message. Reports go to division admin and are audited.
- Removed messages stay in the moderation log with the body, visible to admin, not to students.
- No disappearing messages, no "view once."
- Retention default 24 months, then delete message bodies. Moderation actions that recorded a safety incident follow the longer safety retention the school sets (default 7 years for the action record, with the body retained only if the school marks a hold).
- A school can turn chat off per division without leaving the School tier.

Staff are told in the product, not only in a PDF: do not move a conversation with a student to a personal phone. The product cannot stop that. It can avoid being the private channel.

## Payments security

- Connected account onboarding uses Stripe-hosted flows
- Webhook signatures required
- Idempotency keys required
- Admin roles that can issue a refund are business office and school admin only, audited
- Portico support cannot refund from a generic tool without break-glass
- Family-facing fee amounts are stored as their own ledger lines so a later UI cannot "simplify" them into tuition
- Convenience fees are disabled per charge type if counsel flags the school's state

## Application security baseline

- TLS 1.2+ externally, TLS on internal hops
- Encryption at rest for the database, object storage, and backups
- Dependency and container scanning on the build
- Production deploys are reviewable and reversible
- CSRF protection on cookie-based web sessions; mobile uses short-lived tokens plus refresh
- Authorization tests for every new query that returns students: at least one "other household" and one "other school" negative test
- Pen test before the second paid cohort, and after chat or tuition ledger launches
- SOC 2 Type I once several paying schools depend on the system; Type II after the controls have a full period. Do not claim SOC 2 in a sales deck before the report exists
- Vulnerability reports via a published security contact on the marketing site when one exists

## Logging

A logging wrapper rejects or redacts fields named like email, phone, token, body, and free-text note. Debug logs for sightings use fob id and gateway id, not household name. Support staff read traces in an error tool that is also under the DPA and the subprocessor list.

## Retention and deletion

| Data | Retention |
| --- | --- |
| Zone and ticket state transitions needed to explain a release | Life of the release record |
| Radio debugging detail | 72 hours |
| Release events and safety audit | 7 years, confirm with counsel |
| Ordinary admin audit | 7 years for pilot simplicity, unless counsel splits classes |
| Chat bodies | 24 months, unless a hold applies |
| Backups | 35 days online, then gone, so deletion is real within a stated window |
| School leaves | Export window 30 days, delete production within 60 days, backups age out on the 35-day cycle |

Deletion of a withdrawn student does not happen mid-year. Withdrawal removes them from new sessions and keeps history. Full deletion is a school-level or end-of-contract action, plus a parent request path the school approves. Portico does not silently delete a custody history the school might need.

## Incident response

- Severity 1: unauthorized release attributable to the product, cross-tenant exposure, payment settled to the wrong merchant, active exploitation
- Notify the school's named contact without waiting for a polished postmortem. Target: same day for severity 1, and within the statute the DPA states (often 72 hours for personal-data breaches; the DPA wins)
- A missed queue position is bad operations and is not, by itself, a data breach
- On-call covers dismissal hours for schools in the active time zones. The United States span is the reason [D23](decisions.md) limits the pilot to the US

## Subprocessors

Maintain a public list before the first pilot: hosting, database, object storage, WorkOS, Stripe (when payments exist), email, SMS, error tracking, push. Updates follow the DPA's notice period. Gateways on the school network are the school's devices, not a subprocessor.

## What schools still own

Portico does not take the release decision away from the adult standing at the car. The school configures blocks, trains substitutes, keeps the paper roster in term one, and writes the parent handbook language. The contract should say the school remains responsible for the decision to release a child, and Portico is responsible for faithfully presenting the list and recording the action. Liability caps belong in that contract, drafted by counsel, not invented here.
