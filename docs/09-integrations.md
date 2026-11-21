# Integrations

Integrate late and narrowly. The pilot runs on CSV, Google or Microsoft staff login, and a gateway that speaks only to Portico. Deeper SIS and payment connections are how Campus and School tiers become sellable, not how Curb gets proven.

## Principles

- The school authorizes every connection. Portico does not scrape a portal with a shared password.
- Imported roster data is reviewed by a human before it becomes the live dismissal list.
- Portico is the system of record for releases and for tickets. External systems receive those facts only if the school turns an export on.
- If a sync fails on a school day, dismissal still uses the last activated roster. A sync error is an admin banner, not a blocked curb.
- Write-back into an incumbent SIS is off until a specific field has an owner. The dangerous case is two systems both editing custody.

## MVP

| Integration | Direction | Notes |
| --- | --- | --- |
| CSV roster | In | Required. Column contract below |
| Google Workspace and Microsoft Entra | Staff sign-in | WorkOS. Staff accounts match email to a provisioned `users` row. Unknown emails do not auto-provision as teachers |
| Email magic link and SMS OTP | Parent sign-in | Transactional only |
| APNs and FCM | Out | Operational push |
| Gateway HTTPS | In | mTLS, not a third-party IoT cloud |
| Stripe | Not in MVP | No payment element ships on Curb |

### CSV contract

UTF-8, header row required. One row per student. Guardians repeat on the student row for the pilot (two guardians). More than two guardians are added in the UI after import.

| Column | Required | Notes |
| --- | --- | --- |
| `student_external_id` | Yes | Stable id from the SIS or a school-invented id. Used to update, not duplicate |
| `first_name`, `last_name` | Yes | |
| `preferred_name` | No | Defaults to first name |
| `grade` | Yes | School-defined label, preserved as text (`PK`, `K`, `2`) |
| `homeroom` | Yes | Creates or matches a section |
| `household_name` | Yes | Siblings sharing this string land in one household |
| `guardian1_name`, `guardian1_email` | Yes | Email is the parent login |
| `guardian1_phone` | No | Used for SMS OTP if present |
| `guardian1_relationship` | Yes | |
| `guardian1_custody` | No | Defaults to `custodial` |
| `guardian2_*` | No | Same set |
| `transport_mon` … `transport_fri` | No | Defaults to `carline` |
| `blocked` | No | `yes` creates a block that the office must clear. Default `no` |

Rows that fail validation do not partially apply. The review screen lists errors (missing email, duplicate external id with conflicting names, unknown transport mode). An admin activates the file. Activation is audited.

Re-import matches `student_external_id`. It may update names, grade, and homeroom. It must not silently clear a block or a limited custody flag that was edited in Portico. Those columns are applied only when the file value is non-empty and the admin checks "apply custody columns," which defaults off after the first import.

Photos are not in the CSV. They are uploaded after, or pulled in a later SIS integration.

## Campus

### Payments

Stripe Connect, separate connected account per school.

- Cards: Stripe PaymentIntents, card data in Stripe-hosted fields only
- ACH: Stripe Financial Connections for bank linking, ACH debit for tuition installments and balance loads
- Payouts: Stripe payout schedule to the school's bank, with a Portico report that lists payments, fees, and the expected payout id
- Webhooks: signature verified, idempotent, the only way a payment becomes `succeeded` in Portico. The browser success URL is not proof

No PayPal, no Venmo, no card numbers in CSV, no school-entered card-on-file taken over the phone by Portico staff.

### Calendar

One-way import first.

- Google Calendar and Microsoft 365 calendars the school nominates (lower school, upper school, athletics)
- Portico stores a copy as `calendar_events` with `external_source` and `external_id`
- Parent app shows the merged calendar. It does not write back in the first calendar release
- A dismissal window is not a Google event. It stays a Portico setting so a calendar edit cannot move carline by accident

Two-way sync is a later request and should be limited to events created inside Portico.

### SIS roster sync

After CSV is boring, add one standards-shaped import and one incumbent that design partners actually use.

| Method | When |
| --- | --- |
| OneRoster 1.2 CSV or REST, rostering subset | First, because it is the portable ask |
| Veracross API or Blackbaud SKY API | When a paying school will sponsor the build and the fields are mapped |
| FACTS | Billing identity later, not dismissal identity first. Do not sync custody from a tuition system unless the school declares that system the owner |

Field ownership when a sync exists:

| Field | Owner in Campus |
| --- | --- |
| Name, grade, homeroom, enrollment status | SIS, if sync is on |
| Household structure, pickup adults, blocks, fobs | Portico |
| Lunch balances | Portico |
| Tuition balances | Incumbent, until School tier and an explicit migration |

Conflict display: if the SIS withdraws a student, Portico marks them withdrawn and removes them from tomorrow's session. It does not delete release history.

## School tier

### Grades

If Portico is the gradebook of record, export is a CSV and a PDF packet the school can archive. Optional later: push published term grades to the incumbent SIS as a one-way publish, never a live two-way edit of individual scores.

If Portico is not the gradebook of record, do not build a second score entry UI. A read-only parent view is allowed only when scores can be pulled without teacher double entry ([D11](decisions.md)).

### Accounting

Monthly CSV of payouts, fees, and invoice totals in the first payments release. QuickBooks Online export only after business officers are repeatedly reshaping that CSV. Do not start with a marketplace of accounting connectors.

### Webhooks (Phase 4)

A small signed webhook set: `student.withdrawn`, `dismissal.released`, `invoice.paid`. School-generated secrets, retry with backoff, no guarantee of ordering beyond a per-entity sequence number. Document it as best-effort notification, not as the audit log. The audit log remains inside Portico.

## Google and Microsoft, specifically

| Use | Google | Microsoft | Phase |
| --- | --- | --- | --- |
| Staff SSO | Workspace OIDC | Entra OIDC | MVP |
| Student SSO | Workspace, School tier, grades that allow student login | Entra, same | School |
| Calendar read | Calendar API, school-consented | Graph calendar read | Campus |
| Mail send via the school's domain | Not required. Portico sends from its own transactional domain with the school name in the from-display | Same | MVP |
| Classroom / Teams assignment sync | No | No | Not planned. Gradebook does not depend on it |

Parent accounts are not required to be Google accounts. Many guardians use personal email. Magic link respects that.

## Integration acceptance criteria

- Given a CSV with one invalid row, when an admin reviews it, then zero students are activated from that file until the row is fixed or removed and the file is activated.
- Given a re-import omits a student, when it is activated, then the student is marked withdrawn only if the file format includes a full snapshot flag. Otherwise missing rows are reported and not treated as withdrawals. Default is **full snapshot**, and the review screen states "8 students will be withdrawn."
- Given Stripe sends the same webhook twice, when both are processed, then one payment row exists and the ledger is unchanged the second time.
- Given Google calendar sync fails on a dismissal day, when staff open the queue, then the queue loads and the admin sees a calendar error that is not modal.
- Given a staff email is not pre-provisioned, when they complete Google login, then they see a denial and no student data, and the attempt is audited.

## Explicit non-integrations

- Consumer location services and Find My
- Social login with Facebook or TikTok
- LMS assignment sync as a launch dependency
- State reporting systems
- Bus contractor GPS platforms
- Facial recognition access control
- Generic Zapier write access to roster or custody in the pilot
