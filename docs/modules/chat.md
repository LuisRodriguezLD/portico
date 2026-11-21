# Chat

**Phase:** School

Class communication is part of the platform promise and the easiest way to hurt a child or a teacher. The first release is smaller than competitors' messaging products on purpose. If a school needs a full parent social network, they can keep the tool they already regret.

Safety defaults are normative in [Security, privacy, and compliance](../10-security-privacy-compliance.md). This document is the product behavior.

## Purpose

Give a section a moderated room, and give a guardian and a teacher a thread about one student, without direct messages between students or private staff-to-student chats.

## Users

Teachers of the section, guardians with `communication_ok` for an enrolled student, students only if the division allows student posting, division admin (moderation). Carline, business office, and pickup-only adults are not members.

## Rules

- Room kinds are `class` and `guardian_teacher` only.
- A class room's membership is derived from current enrollment and current teachers, plus guardians with communication rights. Withdrawing a student removes the guardians' and student's access forward. It does not erase history from admin.
- A guardian-teacher thread is created per student per teacher, or per student per homeroom teacher in the first release. Prefer homeroom teacher only at launch to avoid a pile of empty threads. Other teachers use the class room.
- There is no compose-new-message that lets a user pick an arbitrary person.
- Posting modes: `teacher_only`, `held_for_review`, `open`. Defaults are in the security spec (youngest division teacher-only; others held for review until the school has lived with chat for a term).
- Quiet hours default to 8:00 p.m.–7:00 a.m. school time. The server rejects student posts inside them even if the client clock is wrong.
- Student attachments and student links are off.
- Report goes to division admin and creates a moderation record.
- Teachers can remove a message from view. Removal does not delete the moderation copy.
- No reactions, no read receipts in the first release (read receipts become parent anxiety), no typing indicators.
- Push uses the vague lock-screen rule. In-app text shows the message.
- Retention: message bodies 24 months unless a hold is placed. Holds are an admin action with a reason.

## Out of scope

- Direct messages of any kind
- Parent-to-parent rooms
- Public communities, social graphs, stories, or feeds across classes
- Translation as a moderated record. If translation is added later, store the original as the record
- SMS mirroring of every message

## User stories and acceptance criteria

### Story: class room exists because the section exists

**As a** teacher, **I want** a room for my homeroom without inviting people, **so that** membership cannot drift from the roster.

**Acceptance criteria**

- Given a section with enrollments, when chat is enabled for the division, then one class room exists and members match the roster rules.
- Given a student is withdrawn, when the withdrawal is active, then that student and their guardians lose access on the next permission check and cannot fetch new messages.
- Given a pickup-only adult, when they call the room API, then they are forbidden.

### Story: lower school is quiet

**As a** division admin, **I want** lower school rooms to be teacher-only by default, **so that** a third-grade room is an announcement channel.

**Acceptance criteria**

- Given the default for the division, when a guardian opens the room, then they can read and cannot post.
- Given a student account in that division, when they open the room, then they can read only if student read is enabled, and they cannot post.
- Given an admin switches the room to held-for-review, when a guardian posts, then the message is not visible to members until a teacher approves it.

### Story: no private student channel

**As a** head of school, **I want** the product to be unable to host a private teacher-student DM, **so that** policy does not depend on everyone behaving.

**Acceptance criteria**

- Given any client, when it attempts to create a room with one staff member and one student and no other adult membership, then the API refuses.
- Given a class room, when messages are listed for a student, then the student sees the same visible messages other members see, not a private subset from the teacher.
- Given a search for a "DM" feature flag in school settings, when an admin looks, then no control enables student direct messages.

### Story: quiet hours

**As a** teacher, **I want** students unable to post at night, **so that** I am not pulled into a thread at 11:00 p.m.

**Acceptance criteria**

- Given quiet hours are 8:00 p.m. to 7:00 a.m. school time, when a student posts at 8:01 p.m. school time, then the post is rejected and the client explains the hours.
- Given a teacher posts during quiet hours and the school allows teacher posts, when they send an announcement-style message, then it is delivered. If the school does not allow it, the teacher is rejected too. Default: teachers may post.
- Given the device time zone is abroad, when the student posts, then school time still governs.

### Story: report and remove

**As a** guardian, **I want** to report a message, **so that** an admin sees it even if a teacher is the author.

**Acceptance criteria**

- Given a report, when it is submitted, then division admin sees the message body, the reporter, and the room, and the reporter sees that it was received.
- Given a teacher removes a message, when members reload, then the body is replaced with a removed state and the moderation log keeps the body.
- Given the reporter is the only admin, when they report their own message, then the report still exists. This is not a shortcut to silent delete.

### Story: guardian and homeroom teacher

**As a** guardian, **I want** a thread with my child's homeroom teacher, **so that** a private academic concern is not posted to the class.

**Acceptance criteria**

- Given the guardian has communication rights, when they open conversations, then they see a thread for the homeroom teacher and that student, and no picker for other staff.
- Given another student's guardian, when they request that thread, then the API forbids it.
- Given the content is a safety concern, when either party sends it, then the message is still retained under the same rules. The UI points to school emergency contacts for immediate safety issues and does not pretend the thread is a crisis line.

## Dependencies

Sections, guardians, and communication flags. School-tier entitlement. Push and retention jobs. Moderation audit in the same audit pipeline as releases, with different retention as specified.

## Module acceptance

A school can run a term with class rooms in the default posting mode, a student cannot open a DM with a teacher, quiet hours hold against a wrong device clock, and a reported message is visible to division admin the same day.
