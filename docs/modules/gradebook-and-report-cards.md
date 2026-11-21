# Gradebook and report cards

**Phase:** School

Build this only when a school wants Portico to be the gradebook of record, or when a read-only view can be filled from the SIS without asking teachers to type scores twice. A parallel gradebook is a failed feature. [D11](../decisions.md).

## Purpose

Let teachers record scores under the division's scheme, let guardians see published work, and let the school publish a report card PDF that does not change quietly after parents have read it.

## Users

Teachers (own sections), division admin (schemes, publish), guardians with communication rights (read published work), students if login is enabled (read their own). Business office has no access. Carline has no access.

## Rules

- A division chooses points or standards-based grading. A school may use standards in lower school and points in upper school.
- Categories and weights, if used, are division settings, not a per-teacher invention, so report cards can be generated. Teachers may be allowed extra categories only if the division turns that on. Default off.
- Missing and excused are statuses, not zeros, unless the division's policy says missing becomes zero after a grace period. Default: missing stays missing until a teacher or the policy job converts it. The policy must be visible to guardians before it runs.
- Guardians see an assignment score only after the teacher posts it. Draft scores are invisible outside the teacher and division admin.
- Report cards are drafted from posted scores and comments, previewed by the teacher, and published by the division. Publishing generates a PDF and a version.
- A published report card is immutable. A correction is a new version. The previous PDF remains available to the school and is labeled as superseded for the guardian.
- Comments are written by the teacher. No model writes or rewrites them in this phase. [D10](../decisions.md).
- Narrative comments are visible to guardians and the student (if student login is on), not to other families.
- Drops and transfers: a student who leaves a section keeps the scores for the time they were enrolled. The report card states the enrollment window.
- Exports: CSV of posted scores and the PDF packet. That is the archive. Live write-back to another SIS is not part of the first gradebook release.

## Out of scope

- Master schedule, transcripts for college admission offices, GPA across years beyond a simple term calculation the division defines
- Anonymous peer grading
- Public class rank posted to students
- AI comment drafting

## User stories and acceptance criteria

### Story: record a score

**As a** teacher, **I want** to enter scores for my section, **so that** I am not also typing them into a second system.

**Acceptance criteria**

- Given a points assignment with 20 points possible, when the teacher enters 18 for a student and posts, then the guardian can see 18/20 and the student can see it if student login is on.
- Given the score is still a draft, when a guardian requests it, then the API returns not found rather than a hidden flag that leaks the assignment.
- Given a teacher from another section, when they request the score, then the API forbids it.

### Story: standards in lower school

**As a** division admin, **I want** lower school to use standards marks, **so that** we do not pretend kindergarten is a percentage.

**Acceptance criteria**

- Given the division style is standards, when a teacher creates an assignment, then the entry control is the division's mark scale (for example approaching, meeting, exceeding) and there is no percentage.
- Given a points-style division, when a teacher opens an assignment, then points are required and a standards mark is not.
- Given a school uses both, when report cards generate, then each division uses its own style on the same publishing day.

### Story: missing work policy

**As a** guardian, **I want** to see that work is missing before it becomes a zero, **so that** the rule is not a surprise.

**Acceptance criteria**

- Given an assignment is past due and unscored, when the grace period has not ended, then the guardian sees missing and the average, if shown, excludes it or includes it according to the visible policy. The screen states which.
- Given the division policy converts missing to zero after the grace period, when the job runs, then it writes a score of zero, audits the conversion, and does not also email a shame notification. A single digest to the guardian is allowed if the school turns digests on. Default off.

### Story: publish a report card

**As a** division admin, **I want** to publish report cards on a chosen afternoon, **so that** parents do not see a half-finished comment.

**Acceptance criteria**

- Given any teacher has not submitted required comments, when the admin tries to publish the division, then publish is blocked and the missing sections are listed. The admin may publish a subset only by explicitly excluding those sections.
- Given publish succeeds, when a guardian opens the document, then they receive the PDF and an in-app copy, and the lock-screen push does not include grades or the student's name.
- Given a teacher edits a score after publish, when they save, then the published PDF is unchanged and the admin sees that a new version is needed.

### Story: correct a published card

**As a** division admin, **I want** a correction to be a new version, **so that** we can show what the family was originally given.

**Acceptance criteria**

- Given version 2 is published, when the guardian opens report cards, then version 2 is current and version 1 is available as superseded.
- Given version 2, when the audit is read, then it records who published and when, for each version.
- Given a request to overwrite the version 1 file in storage, when the API is called, then it is refused.

### Story: read-only SIS path

**As a** school that will not leave its SIS, **I want** parents to see grades only if they flow in automatically, **so that** teachers do not retype.

**Acceptance criteria**

- Given the school is not on the gradebook-of-record setting, when a teacher looks for score entry, then the entry UI is absent.
- Given a sync is configured and healthy, when a guardian opens grades, then they see the synced posted scores with a "from [system]" label.
- Given the sync breaks, when the guardian opens grades, then the last successful sync remains, stamped with its time, and score entry does not silently unlock.

## Dependencies

Sections and enrollments from identity. Entitlement for the School tier. Notification privacy rules. Storage for PDFs in [Architecture](../07-architecture.md).

## Module acceptance

A division can run a term on points or standards, guardians cannot see drafts, a published PDF survives a later score edit, and a non-record school has no place for a teacher to type a duplicate grade.
