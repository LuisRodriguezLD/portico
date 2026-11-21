# Personas and roles

Personas are composite. They exist so scope arguments have a user in the room. Permissions are the actual product rules.

## Personas

### Maya Chen, parent

Two children, grade 2 and grade 5. Works, usually arrives at 2:50, sometimes carpools with a neighbor on Thursdays. She will grant location access if the reason fits on one screen, and she will revoke it the week the app drains battery or pings her on Saturday. She wants today's plan, a trustworthy place in line, and a way to switch to grandma before the cutoff. She does not want a social feed.

**Success:** she opens one app, sees "ticket 18, four cars ahead," and both children are called together.

### David Alvarez, authorized grandparent

Picks up Thursdays. He will not install a complicated app, and he should not see tuition. A visor fob and a short "you are expected today" message are the whole product for him. If he loses the fob, the front office can still find the family by name and code.

**Success:** the curb iPad shows his name and the children he is allowed to take, and does not show a balance.

### Priya Shah, lower-school teacher

Twenty-two students, a dismissal change list that used to arrive as three emails and a sticky note. She will reject any product that makes her manage the carline. She will accept a screen that highlights only what changed, and a clear "called" state so she can send Maya and Leo out.

**Success:** unchanged days require zero taps from her at 2:40.

### James Whitfield, carline lead

Outside, sun on the screen, gloves in January, substitute beside him who has never done dismissal. He needs photos, huge type, the next few cars, and a way to insert a walk-up without renumbering the world. He needs the iPad to keep working if the school's internet coughs.

**Success:** he calls a car without using the radio, and every release is attributed to him, not to a shared password.

### Diane Frost, front office

Early pickups, custody letters, "who is allowed to get Jordan." She needs a block flag that cannot be quietly overridden, a same-day change after cutoff that she can approve, and an audit she can show a head of school the same day.

**Success:** a restricted adult never looks the same on screen as an authorized one.

### Helen Park, business officer

She cares that money lands in the school's account, that a lunch balance reconciles, and that parents stop calling about a third portal. She will not move tuition off FACTS because a startup asked nicely. She will let a startup charge field trips and lunch if the deposit report matches the bank.

**Success:** payout report equals the bank, and she can explain every parent-facing fee in one sentence.

### Robert Hale, head of school

Buys risk reduction and parent sentiment. He will champion a pilot if installation looks boring and the safety story is specific. He will kill it if a family claims they were tracked, or if a child was released to the wrong adult.

**Success:** a board slide with "ordered release, full audit, paper backup still in the drawer."

### Alicia Gomez, IT and data

Part-time or wearing three hats. She will accept CSV in the pilot and Google or Microsoft login for staff. She will not babysit beacons. Gateways must report that they are alive. A data-processing agreement and an export at the end of the contract are prerequisites, not roadmap items.

**Success:** roster in, staff signed in with the accounts they already have, gateway offline alert to her email.

### Jordan Lee, eighth grader

Needs a schedule, a grade, and a lunch order. Does not need a classmate directory, a DM thread, or a public profile. Under 13, the product should feel even smaller.

**Success:** Jordan can see what the school chose to show students, and cannot message another student privately.

## Role model

Access is the intersection of a **role**, a **relationship to a student**, and a **module entitlement** the school pays for. A teacher role does not grant access to every student. A guardian relationship does not grant access to every module.

### School-side roles

| Role | Sees | Must not see |
| --- | --- | --- |
| **School admin** | All students, settings, staff, audit, devices | Another school's data, ever |
| **Division admin** | Students and staff in the division | Other divisions' financials unless also business office |
| **Business office** | Payers, invoices, meal ledgers, payouts | Narrative custody notes beyond a "financial contact" flag; not the carline radio metadata |
| **Front office** | Pickup lists, early release, custody flags, today's changes | Grades, full financial ledger |
| **Teacher** | Own sections, dismissal deltas for those students, attendance and grades when those modules are on | Other classes, tuition, household financials |
| **Carline staff** | Today's queue, photos, car description, medical alert icon, custody block | Grades, balances, contact details beyond what release requires |
| **Nurse** | Allergy and health flags the school marked for kitchen or curb | Tuition, chat history |
| **Coach / aftercare** | Rosters of their activity and whether the student is still on campus | Unrelated students |
| **Portico support** | Break-glass access, time-limited, reason required, audited, school-visible after the fact | Standing access to student records |

There is no generic `carline@school` login. A shared iPad uses fast user switching: full sign-in once per person per device, then a personal PIN for the afternoon. Releases store the person.

### Family-side relationships

Relationships are per student, not per household. A student may sit in two households. Money, communication, and pickup are separate switches.

| Level | Pickup | Student records and announcements | Money | Edit authorized list |
| --- | --- | --- | --- | --- |
| **Custodial** | Yes, unless a day restriction applies | Yes | Only if `financial_access` is on | Yes, and the other custodial guardian is notified |
| **Joint custodial** | Yes | Yes | Separate switch | Yes, with notification |
| **Limited** | Only on listed days or with a named adult | Dismissal status only | No | No |
| **Blocked** | Never | No | No | No |
| **Authorized pickup (not a guardian)** | Yes, as limited by days and expiration | No app access to records | No | No |
| **Student** | Self-dismiss only if the school and a custodial guardian enabled it for that grade | Own grades, own lunch, own schedule, as configured | Own meal order if the school allows, never the payer's card | No |

Default for a new authorized adult: pickup only, optional photo, optional days of week, optional expiration, notification to every custodial guardian.

### Self-dismiss

Off by default below grade 5. The school sets the minimum grade. A custodial guardian must opt in per student. The curb flow for that student is "released as walker / bike / transit," not "released to a car." Carline staff do not collect a signature from an empty sidewalk. The audit event records self-dismiss policy version and the guardian opt-in.

### Substitutes and temporary staff

Front office issues a same-day staff credential tied to a named person and an end time. It can run carline. It cannot export the roster or edit custody.

## Permission principles

1. **Default deny.** Missing relationship means no row, not a redacted row that still leaks a name in a count.
2. **Custody beats convenience.** A blocked flag cannot be cleared from the iPad. Clearing it is an admin action with a reason, and it notifies school admin.
3. **Override is two-person when the adult is not on the list or the student is blocked.** Both staff members enter PINs. The reason is required. The event is audited.
4. **Money is a separate grant.** Being allowed to pick up a child does not reveal a balance. Being the payer does not, by itself, put you on the curb list.
5. **Health at the curb is an icon, not a chart.** Carline sees "medical alert" if the nurse flagged it for dismissal. The chart stays in the health record.
6. **Students under 13 see the smallest product that still functions.** No directory of classmates' contact information. No chat until the School tier, and then only class rooms under the rules in [Chat](modules/chat.md).
7. **Support access is an event, not a role people leave turned on.**

## User stories

### Story: two households

**As a** front-office admin, **I want** each guardian's pickup rights stored per student, **so that** a parent who pays tuition is not automatically a parent who may take the child on Tuesday.

**Acceptance criteria**

- Given a student linked to two households, when staff open the curb card, then they see today's authorized adult and a block banner if one exists, and they do not see a balance.
- Given a custodial guardian adds a grandparent, when the record saves, then every other custodial guardian is notified immediately.
- Given a guardian is blocked, when carline staff search that adult, then the result states do-not-release and offers no single-tap override.

### Story: carline staff sees only the afternoon

**As a** carline lead, **I want** today's lane and nothing else, **so that** a substitute cannot browse the school.

**Acceptance criteria**

- Given a user with the carline role only, when they sign in, then navigation contains the queue, search, and exception list for the current session.
- Given that user requests a student not in today's dismissal session, when the search returns, then it returns no record.
- Given they had access yesterday, when today's session is generated, then yesterday's queue photos are no longer on the device beyond the local cache window in [Non-functional requirements](11-non-functional-requirements.md).

### Story: student account is small

**As a** division admin, **I want** student logins to expose only what that division enabled, **so that** a third grader does not receive a social app because an older grade uses grades.

**Acceptance criteria**

- Given a student below the school's student-login grade, when they attempt sign-in, then sign-in is refused and the parent account remains the only family access.
- Given chat is entitled for the school and disabled for lower school, when a lower-school student opens the app, then no room list exists.
- Given a student is opted into self-dismiss, when the dismissal session starts, then the student record shows the mode to staff without giving the student a way to edit authorized adults.
