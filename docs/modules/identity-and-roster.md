# Identity and roster

**Phase:** MVP

The roster is the safety system. Carline, and later money and grades, all hang off the same students, households, and grants. A sloppy import becomes a wrong release.

## Purpose

Let a school stand up an accurate, reviewable list of students, guardians, and pickup rights from a CSV, sign staff in with Google or Microsoft, and sign parents in without issuing passwords.

## Users

School admin, front office, IT, guardians, carline staff (read today's subset only).

## Rules

- The school is the tenant. A person can exist at two schools only as two users. Do not build cross-school parent identity in the pilot.
- Siblings share a household when the school says they do. Custody is still per student.
- `student_external_id` is the idempotency key for imports.
- Blocks and limited custody edited in Portico are not overwritten by a casual re-import. See [Integrations](../09-integrations.md).
- Withdrawing a student removes them from future sessions and keeps history.
- Parent email is the credential. Two guardians can share a household and must not be forced to share an email.
- Family code is for the curb, not for login.
- Photos used at the curb require school approval unless the school enables trusted parent upload.

## Out of scope

- Admissions CRM, applicant pipeline, re-enrollment contracts
- Automatic nightly SIS sync (Campus)
- Student self-registration
- Merging duplicate people with machine learning. Duplicates are an admin merge with an audit event

## User stories and acceptance criteria

### Story: activate a roster on purpose

**As an** admin, **I want** to review a CSV before it becomes the live school, **so that** a bad export cannot change who is allowed to pick up a child.

**Acceptance criteria**

- Given a file with a missing `guardian1_email`, when it is uploaded, then the review screen names the row and activation is disabled.
- Given a valid file, when the admin has not pressed activate, then no guardian can sign in and no session will include the new students.
- Given activation succeeds, when it finishes, then an audit row records the actor, the file name, and counts of created, updated, and withdrawn students.
- Given the file is a full snapshot missing a previously active student, when the review renders, then the withdrawal is listed explicitly and requires the same activation click.

### Story: divorced household

**As a** front-office admin, **I want** the payer and the Thursday pickup adult to be different people, **so that** tuition access is not pickup access.

**Acceptance criteria**

- Given a custodial guardian with `financial_access` off and pickup on, when they sign in, then they see dismissal and not a balance, once balances exist. In MVP they see dismissal only.
- Given a second household is linked to the same student, when each guardian signs in, then each sees the student and only their own grants.
- Given one guardian is blocked, when carline staff open the student, then the block is visible. A household fob does not make that person an eligible adult. If no eligible adult remains on the vehicle, the student is not callable.

### Story: add a grandparent

**As a** custodial guardian, **I want** to add my father for Thursdays, **so that** the curb expects him without giving him my email login.

**Acceptance criteria**

- Given the guardian completes the adult's name, relationship, and Thursday mask, when they save, then the adult is authorized only on Thursdays and the other custodial guardian receives a notification.
- Given the addition is made, when the grandfather has no user account, then he can still be listed on a vehicle via a household fob or a staff search.
- Given a guardian revokes him, when the next sighting arrives, then he is not an eligible adult on new tickets.

### Story: staff sign-in does not invent teachers

**As an** IT lead, **I want** Google login to work only for people I provisioned, **so that** a parent with a school-domain guest account does not become staff.

**Acceptance criteria**

- Given an email is not in `users` as staff, when Google login succeeds at the identity provider, then Portico shows a denial and writes an audit row.
- Given a provisioned teacher, when they sign in, then they see only their sections.
- Given a carline staff account, when they sign in on the iPad, then they see the queue and not the roster editor.

### Story: parent sign-in

**As a** guardian, **I want** a magic link, **so that** I do not have another password.

**Acceptance criteria**

- Given an invited email, when the guardian opens a fresh link, then the session starts and shows only linked students.
- Given a link older than its expiry, when it is opened, then it fails and offers a new link.
- Given the guardian wants to edit authorized adults, when the session is older than the step-up window, then the product requires a fresh magic link or OTP before saving.

### Story: merge a duplicate

**As an** admin, **I want** to merge two student rows that share an external id mistake, **so that** a child does not have two dismissal identities.

**Acceptance criteria**

- Given two student records, when an admin merges them, then enrollments, guardians, and future plan rows point at the surviving id, and the retired id cannot be ticketed.
- Given the merge runs, when it commits, then the audit log records both ids and the actor.
- Given either record has a release history, when the merge completes, then the history remains queryable under the surviving student.

## Dependencies

[Carpool and dismissal](../04-carpool-and-dismissal.md) consumes plans, adults, and blocks. [Data model](../08-data-model.md) defines the tables. [Security](../10-security-privacy-compliance.md) defines step-up and audit.

## Acceptance for the module as a whole

A design partner can go from an empty tenant to a reviewable roster, four staff roles, and a signed-in parent on a fictional staging school in one sitting, using the written CSV contract, without Portico staff editing the database.
