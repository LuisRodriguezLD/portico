# Announcements and calendar

**Phase:** Campus, except the dismissal-delay banner, which is MVP.

Schools already have email. Portico should not become a second inbox that teachers must feed all day. Announcements are for official, targeted notices. The calendar is the school's calendar, shown to the right people, without becoming a personal scheduler.

## Purpose

Deliver a dismissal delay in the pilot. In Campus, publish announcements to a school, division, grade, or section, and show a calendar that can import Google or Microsoft.

## Users

School admin and division admin (compose), teachers (section posts if allowed), guardians and students (read what they are targeted for), carline staff (read the delay banner).

## Rules

- Every announcement has an audience and an author. There is no "everyone on the internet" post.
- Guardians see an announcement only if it targets a student they are allowed to receive communication for.
- Students see announcements only if student login is on and the audience includes them. Not in MVP.
- Dismissal delay is a banner on Today, the staff queue, and the porch display, plus a vague push. It does not renumber tickets.
- Calendar events follow the same audience rules. A section event is not visible to the whole school.
- Import is one-way in the first calendar release. An external delete removes or cancels the Portico copy on the next sync.
- The dismissal window itself is not a calendar event.
- Quiet hours do not block emergency or dismissal-delay banners. They do block routine announcement pushes overnight. In-app unread state still updates.
- Teachers do not get a compose button unless the school enables section posts. Default off, so the module does not become a teacher obligation on day one.

## Out of scope

- Replacing the school's email or a learning management system
- Two-way RSVP with payment (incidentals cover field-trip fees; the announcement can link to a charge once billing exists)
- Parent replies in a thread. That is [Chat](chat.md), later, and only in rooms
- SMS blasts

## User stories and acceptance criteria

### Story: weather delay

**As a** school admin, **I want** one delay control, **so that** parents in line and teachers in class see the same fact.

**Acceptance criteria**

- Given the admin posts a 20-minute delay, when guardians open the app or look at a lock screen, then the lock screen does not list student names and the in-app banner states the delay.
- Given the porch display is open, when the banner is posted, then it is visible within the fanout bar in [NFRs](../11-non-functional-requirements.md).
- Given the delay is cleared, when clients refresh, then the banner is gone and tickets are unchanged.

### Story: section announcement

**As a** division admin, **I want** to post to one grade, **so that** lower school families are not spammed with upper school athletics.

**Acceptance criteria**

- Given an announcement targeted at grade 2, when a grade 5 guardian loads the inbox, then it is absent.
- Given a guardian has a grade 2 child and a grade 5 child, when they open announcements, then they see the grade 2 post once, not twice.
- Given a blocked guardian with communication off, when the post sends, then they receive nothing and cannot fetch it by URL.

### Story: teacher is not forced to post

**As a** teacher, **I want** announcements to be an admin tool unless my school asks, **so that** Campus does not add a daily publishing job.

**Acceptance criteria**

- Given section posts are disabled, when a teacher opens the app, then there is no compose control.
- Given an admin enables section posts for lower school, when a homeroom teacher composes, then the audience is fixed to their section and cannot be widened.

### Story: calendar import

**As an** IT lead, **I want** the lower-school Google calendar to show in the parent app, **so that** I do not retype the year.

**Acceptance criteria**

- Given a consented calendar, when sync runs, then events appear with source and external id, and guardians in that audience see them.
- Given an event is deleted in Google, when the next sync completes, then it is no longer shown.
- Given sync fails, when a parent opens the calendar, then previously synced events remain and an admin sees the error. Dismissal is unaffected.
- Given a parent tries to edit an imported event, when they use the app, then there is no edit control.

### Story: school-created event

**As an** admin, **I want** to add a half day on the Portico calendar, **so that** families see it even if it was never put on Google.

**Acceptance criteria**

- Given the admin creates a school-wide event, when guardians open the calendar, then it appears in the school time zone with the title and times.
- Given the event is school-wide, when a teacher views the calendar, then they see it too.
- Given student login is off, when a student id is guessed, then the event API refuses the request.

## Dependencies

Identity audiences (grade, section, communication flags). MVP delay banner can ship with a single session banner before the general composer. Calendar import depends on [Integrations](../09-integrations.md). Push copy rules depend on [Security](../10-security-privacy-compliance.md).

## Module acceptance

A guardian with two children sees only the audiences those children belong to, a delay is visible on the curb and the phone, and a broken Google sync cannot take down the queue.
