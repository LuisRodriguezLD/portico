# Attendance

**Phase:** Campus

Carline already knows who was released. Campus attendance is the morning record teachers own: who was in class. Do not make dismissal events silently rewrite the homeroom roll, and do not make the roll a second dismissal product.

## Purpose

Give a teacher a one-minute homeroom roll, notify the right guardians of an absence or tardy, and let the office correct it. Feed "already absent" to the dismissal session so the curb does not wait for a child who never arrived.

## Users

Teachers, front office, division admin, guardians (read and excuse-request), carline staff (see absent as a non-callable state only).

## Rules

- One homeroom status per student per school day: present, absent, tardy, excused.
- Default is unmarked, not present. A teacher submits the roll. Unmarked after the school's attendance deadline becomes an office exception list, not an automatic present.
- Dismissal release does not mark a student present for the day. A student can be released only if they were present or tardy, unless the office records a late arrival.
- Absent and excused students are omitted from the callable carline set. If a guardian arrives anyway, staff see "absent today" and do not get a normal Call.
- Guardian excuse requests do not change the roll until the office or teacher accepts them, according to a school setting. Default: office accepts.
- Notification of absence goes to guardians with `communication_ok`, not to every authorized pickup adult.
- Period attendance is out of scope until the school has a schedule in Portico and a reason that homeroom is not enough.

## Out of scope

- State attendance extracts
- Instructional-minute calculations
- Automatic present based on a door scanner or the fob

## User stories and acceptance criteria

### Story: take the roll quickly

**As a** teacher, **I want** to mark exceptions on a pre-filled class list, **so that** attendance takes about a minute.

**Acceptance criteria**

- Given a homeroom of 24, when the teacher opens today's roll, then all students are visible with a single tap path to absent or tardy, and present is the bulk action "mark remaining present."
- Given the teacher submits, when the save succeeds, then each student has one status and the teacher sees a confirmation with the counts.
- Given the teacher has not submitted by the deadline, when the office opens exceptions, then the section is listed. Students are not silently marked present.

### Story: parent hears about an absence

**As a** guardian, **I want** a same-morning notice if my child is marked absent, **so that** I can correct a mistake or confirm it.

**Acceptance criteria**

- Given a student is marked absent, when the roll is submitted, then guardians with communication rights receive a push (and email if they have not enabled push) without the message naming other students.
- Given the lock screen, when the push arrives, then it says the school name and that there is an attendance update, not the student's status in the preview.
- Given a pickup-only adult, when the absence is saved, then they are not notified.

### Story: excuse after the fact

**As a** guardian, **I want** to send an excuse, **so that** the office can mark the absence excused without a phone call.

**Acceptance criteria**

- Given a guardian submits an excuse note, when it is pending, then the roll still shows absent and the office sees a task.
- Given the office marks excused, when the roll reloads, then the status is excused and the guardian can see that result.
- Given the school set "teacher accepts," when the teacher accepts, then the office is not required to tap.

### Story: curb respects the roll

**As a** carline lead, **I want** absent students off the call list, **so that** I do not send a runner for a child who is home.

**Acceptance criteria**

- Given a student is absent, when a household fob mints a ticket for siblings, then the absent student is skipped on that vehicle and staff see why.
- Given the only student on a vehicle is absent, when the fob is heard, then no callable ticket is created and the event is visible in the session log.
- Given the office changes absent to tardy after arrival, when the change saves, then the student becomes callable for a later vehicle the same day.

### Story: correction

**As a** front-office admin, **I want** to correct a mistaken absent, **so that** the parent alert is not the last word.

**Acceptance criteria**

- Given a status change after submit, when an admin saves it, then the previous status remains in the audit log with actor and time.
- Given a guardian was notified of absent and the status becomes present, when the change saves, then the guardian receives a correction notice the same way.

## Dependencies

Identity sections and guardians. Dismissal session reads attendance for the callable set. Notifications reuse the push and email providers.

## Module acceptance

A teacher can submit a class of 24 in under a minute in a usability check, an absent guardian gets one notification, and the afternoon queue hides that student without a manual carline edit.
