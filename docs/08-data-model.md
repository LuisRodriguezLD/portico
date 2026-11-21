# Data model

Conceptual schema for the records the product cannot fake. It is not a migration. Types are indicative. Every table below except `schools` and global catalogs carries `school_id` and is covered by row-level security. Timestamps are `timestamptz`, stored in UTC, displayed in the school time zone.

## Tenancy and people

```sql
schools (
  id, name, time_zone, status
)

campuses (
  id, school_id, name, address
)

school_years (
  id, school_id, name, starts_on, ends_on, is_current
)

users (
  id, school_id, kind, -- staff | guardian | student | support
  full_name, email, phone, locale, status
)

staff_profiles (
  user_id, school_id, role -- admin | division | business | front_office | teacher | carline | nurse | activity
)

students (
  id, school_id, external_id, first_name, last_name, preferred_name,
  grade, status, photo_document_id, self_dismiss_enabled
)

households (
  id, school_id, name, family_code
)

household_members (
  household_id, user_id, school_id
)

-- Relationship is per student. Money and pickup are separate.
student_guardians (
  id, school_id, student_id, user_id,
  relationship,          -- mother | father | guardian | other
  custody,               -- custodial | joint | limited | blocked
  financial_access,      -- bool
  pickup_authorized,     -- bool
  weekday_mask,          -- which days, null = all
  communication_ok       -- bool
)

authorized_adults (
  id, school_id, student_id, created_by_user_id,
  full_name, relationship, phone, photo_document_id,
  weekday_mask, expires_on, revoked_at
)

fobs (
  id, school_id, household_id,
  token_key_id, status, -- active | lost | revoked
  last_seen_at
)
```

`family_code` is the manual fallback. It rotates when the office asks. It is not a password and it is not accepted from the public internet as a login. It only works for a signed-in staff search.

A blocked `student_guardians` row wins over an `authorized_adults` row for the same human. When in doubt, do not release.

## Academic structure (thin in MVP, used later)

```sql
sections (
  id, school_id, school_year_id, campus_id,
  name, grade, kind -- homeroom | course | activity
)

section_teachers (section_id, user_id, school_id)
section_enrollments (section_id, student_id, school_id, starts_on, ends_on)

school_entitlements (
  school_id, module, -- curb | campus | school, or finer if ever needed
  starts_on, ends_on
)
```

MVP needs homeroom sections so teacher dismissal views have a roster. Courses can wait.

## Dismissal

```sql
carline_lanes (
  id, school_id, campus_id, name, active
)

dismissal_windows (
  id, school_id, lane_id,
  starts_local, ends_local, cutoff_local, weekdays
)

transport_plans (
  id, school_id, student_id,
  weekday, mode -- carline | bus | walker | aftercare | activity
)

dismissal_changes (
  id, school_id, student_id, occurs_on,
  mode, authorized_adult_id, riding_with_household_id,
  status, -- applied | pending | rejected
  submitted_by, decided_by, reason
)

dismissal_sessions (
  id, school_id, campus_id, lane_id, occurs_on,
  state, -- open | paused | closed
  paused_at, closed_at
)

vehicles (
  id, school_id, session_id, household_id,
  ticket,            -- null until minted, then immutable
  display_rank,      -- mutable ordering
  state,             -- expected | on_the_way | in_queue | at_curb | called | held | released | cancelled
  car_description,
  idempotency_key
)

vehicle_students (
  vehicle_id, student_id, school_id,
  student_state -- in_class | called | held | released | skipped
)

sightings (
  id, school_id, session_id,
  source, -- gateway | phone_beacon | phone_zone | staff
  fob_id, user_id, gateway_id, beacon_minor,
  zone, rssi, observed_at,
  outcome, -- attached | minted | rejected
  expires_at -- now()+72h for radio detail; row may be reduced to outcome only
)

release_events (
  id, school_id, session_id, student_id, vehicle_id,
  released_to_kind, -- authorized_adult | guardian | self | early
  released_to_id,
  method, -- curb | early_office | walker_confirm | override
  staff_user_id, second_staff_user_id,
  reason, created_at
)

devices (
  id, school_id, campus_id, kind, -- gateway | beacon
  external_ref, lane_id, role, last_seen_at, status
)
```

Ticket minting locks the session row (or a single counter row per session) and inserts the vehicle. The gateway's sighting id is the idempotency key.

`display_rank` is a numeric rank so a vehicle can be inserted between two others without rewriting every ticket. Parents are shown the count of vehicles ahead, not the raw rank.

Do not store latitude and longitude on `sightings`. Zone is an enum.

## Attendance (Campus)

```sql
attendance_records (
  id, school_id, student_id, section_id, occurs_on,
  status, -- present | absent | tardy | excused
  recorded_by, note
)
```

One homeroom record per student per day is the Campus default. Course-period attendance waits until a school asks and has a schedule worth the complexity.

## Announcements and calendar (Campus)

```sql
announcements (
  id, school_id, author_id, title, body,
  audience, -- school | division | grade | section
  audience_ref, publish_at, expires_at
)

calendar_events (
  id, school_id, title, starts_at, ends_at,
  audience, audience_ref, location, external_source, external_id
)
```

Dismissal delay in MVP is an announcement with a fixed audience of today's carline guardians plus staff, even before the general announcement composer exists. It can be a narrower table (`session_banners`) in the pilot if that is faster, as long as the parent app has one place to look.

## Lunch (Campus)

```sql
meal_accounts (
  id, school_id, student_id, -- or household_id if the school pools siblings
  balance_cents, no_charge,  -- no_charge hides aid; kitchen sees eligible, not the reason
  negative_policy -- block | allow_until_limit
)

dietary_profiles (
  student_id, school_id,
  allergens,          -- controlled vocabulary
  parent_note, school_verified_at, verified_by
)

menus (
  id, school_id, serves_on
)

menu_items (
  id, menu_id, school_id, name, description, allergen_tags, price_cents
)

meal_orders (
  id, school_id, student_id, menu_item_id, serves_on,
  status, -- ordered | cancelled | served | blocked
  blocked_reason
)

meal_transactions (
  id, school_id, meal_account_id, amount_cents,
  kind, -- load | meal | refund | adjustment
  payment_id, created_at
)
```

Allergy comparison is tag intersection: if a menu item's tags intersect the student's allergens, the order is refused unless a nurse override exists. Free text in `parent_note` is visible to the kitchen and is not parsed as a safety control.

## Billing (Campus incidentals, School tuition)

```sql
payers (
  id, school_id, household_id, user_id, stripe_customer_id
)

fee_catalog (
  id, school_id, name, amount_cents, kind -- incidental | meal_load | tuition
)

invoices (
  id, school_id, student_id, payer_id,
  status, due_on, total_cents
)

invoice_lines (
  id, invoice_id, school_id, description, amount_cents, fee_catalog_id
)

payment_plans (
  id, school_id, invoice_id, installment_count,
  plan_fee_cents, status
)

payments (
  id, school_id, payer_id, invoice_id,
  amount_cents, fee_cents, method, -- ach | card
  stripe_payment_intent_id, status, idempotency_key
)

ledger_entries (
  id, school_id, student_id, amount_cents,
  kind, -- charge | payment | fee | adjustment | aid_credit
  invoice_id, payment_id, posted_at
)
```

The parent-facing $50 plan fee is `payment_plans.plan_fee_cents`, posted as its own ledger kind `fee`, never folded into the tuition principal. Aid, if a school records it, is `aid_credit` and is not shown to teachers or carline.

Portico's platform fee on a card payment is a Stripe application fee amount stored next to the payment, not a second charge the family can misread as school tuition.

## Academics (School)

```sql
grading_schemes (
  id, school_id, division, style -- points | standards
)

assignments (
  id, school_id, section_id, title, due_on,
  category, points_possible, scheme_id
)

scores (
  id, school_id, assignment_id, student_id,
  points, standard_mark, status, -- graded | missing | excused
  graded_by
)

report_cards (
  id, school_id, student_id, term, status, -- draft | published
  published_at, pdf_document_id
)

report_card_comments (
  id, report_card_id, school_id, author_id, body
)
```

Published report cards are immutable. Corrections are a new publish with a version, not an edit of the PDF the parent already saw. Keep the previous document.

## Chat (School)

```sql
rooms (
  id, school_id, section_id, kind, -- class | guardian_teacher
  posting_mode, -- teacher_only | held_for_review | open
  quiet_hours_start, quiet_hours_end
)

room_members (room_id, user_id, school_id, role) -- teacher | guardian | student

messages (
  id, school_id, room_id, author_id, body,
  status, -- visible | held | rejected | removed
  created_at
)

moderation_actions (
  id, school_id, message_id, actor_id, action, reason, created_at
)
```

No table for direct messages in v1. Do not "temporarily" store them in `messages` with a null room.

## Audit and documents

```sql
documents (
  id, school_id, kind, storage_key, content_type, uploaded_by
)

audit_log (
  id, school_id, actor_user_id, action,
  entity_type, entity_id, metadata, created_at
)
```

`audit_log` is insert-only. Database privileges for the application role do not include update or delete on it. Metadata is a controlled JSON shape, not a dump of a request body. Release events are both their own table (for product queries) and an audit action (for the trail the head of school reads).

## Indexing and retention (practical minimum)

- Unique `(school_id, external_id)` on students where external id is present
- Unique `(session_id, ticket)` on vehicles
- Unique `(session_id, idempotency_key)` on vehicles
- Index `(school_id, student_id)` on every child table that loads a student profile
- Index `(session_id, display_rank)` for the queue
- `sightings` radio detail deleted or stripped at 72 hours by the worker
- `release_events` and `audit_log` retained 7 years unless counsel shortens the audit requirement for a non-safety event class
- Backups follow the same retention story: a backup is not a second place to keep location trivia forever. Sighting payloads should be gone from primary storage before a backup cycle preserves them for months. Prefer not putting RSSI in the primary row at all if debugging can live in a 72-hour log stream

## Identity rules the schema should make hard to violate

- A ticket cannot exist without a session and a household or a staff actor.
- A release cannot exist without a staff actor, except self-dismiss, which requires `students.self_dismiss_enabled` and a guardian opt-in recorded in `audit_log`.
- A payment cannot exist without an idempotency key and a school-scoped payer.
- A message cannot exist without a room.
- Cross-school foreign keys are rejected by RLS and by ordinary foreign keys that include `school_id` where Postgres patterns allow composite keys. Use composite foreign keys for tenant-owned parents (`vehicles (id, school_id)` referenced by `vehicle_students`) so a bug cannot attach a student from school A to a vehicle from school B.
