# Billing and payments

**Phase:** incidental charges on Campus, tuition ledger and payment plans on School. The payment rails exist as soon as any family payment exists.

Portico Pay is how the school takes money without Portico becoming the school's bank. The family should be able to explain every fee in one sentence. The business officer should be able to match a payout to a list.

## Purpose

Charge for field trips and similar incidentals; take lunch loads; and, on the School tier, hold the tuition ledger, statements, and monthly plans. Settle funds to the school.

## Users

Business office, school admin, guardians with `financial_access`, Portico support only through break-glass. Students never see payer instruments. Teachers never see invoices.

## Rules

- The school is the merchant on a Stripe connected account. Portico is not the merchant of record and does not hold a tuition balance. [D16](../decisions.md).
- A guardian without `financial_access` cannot open an invoice, a balance, or a payment method, even if they are custodial.
- Pay-in-full ACH for tuition has a $0 family fee.
- A monthly plan charges the published plan fee ($50 per student per year unless the school waives it) as its own ledger line.
- Card payments add the convenience fee as its own line where permitted, paid by the family. If the fee is not permitted, cards are off for that charge or the school absorbs cost in a way that is still visible in the business-office report.
- The browser return URL does not mark an invoice paid. The signed webhook does.
- Every payment write has an idempotency key.
- Refunds are business-office actions, full or partial, audited, and they create ledger entries rather than deleting the payment.
- Aid or a scholarship credit is a ledger credit the business office posts. It is not shown on the carline, to teachers, or to a guardian who lacks financial access. A non-paying custodial guardian does not see the scholarship amount.
- Statements show charges, credits, fees, and payments for a student, in school time, for a term or a month the office selects.
- Autopay is an explicit enrollment with the amount rule shown before confirmation (pay the installment, not "pay whatever appears" without a cap). Default cap is the scheduled installment amount. A surprise incidental cannot ride along on tuition autopay unless the guardian opted into a separate incidental autopay.
- Failed ACH retries follow a school-visible schedule (default: retry twice, then the office takes over). Do not silently retry forever.
- Portico staff cannot change a connected account's bank account from a support screen. The school does that inside the Stripe-hosted flow.

## Out of scope

- Financial-aid applications, need analysis, and underwriting
- 1098-T or tax advice. Export data the school's accountant already expects; do not generate tax filings in v1
- International cards and multi-currency
- Extending credit to families beyond the school's own policy on the ledger

## User stories and acceptance criteria

### Story: incidental charge

**As a** business officer, **I want** to charge grade 4 for a field trip, **so that** I stop collecting checks.

**Acceptance criteria**

- Given a fee and a list of students, when the officer posts it, then each student's invoice shows the line and only financial guardians are notified.
- Given a guardian pays by card, when the webhook confirms, then the invoice balance drops by the principal, the convenience fee is a separate line the family paid, and the payout report shows both.
- Given a guardian without financial access opens the app, when they look for the charge, then it is not listed.

### Story: pay tuition in full

**As a** guardian, **I want** to pay the year by ACH with no fee, **so that** I am not punished for paying early.

**Acceptance criteria**

- Given a tuition invoice and ACH pay-in-full, when the payment succeeds, then the family fee is $0 and the ledger shows the tuition payment only.
- Given the payment fails, when the webhook says failed, then the invoice stays open and the guardian sees a plain-language failure, not a success screen.
- Given the same idempotency key is retried, when the second request arrives, then the family is not charged twice.

### Story: monthly plan

**As a** guardian, **I want** the plan fee stated before I enroll, **so that** I am not surprised in October.

**Acceptance criteria**

- Given the guardian reviews the plan, when the screen renders, then it shows installment count, installment amount, the $50 plan fee, and the total they will pay.
- Given they confirm, when the plan is active, then the fee posts as kind `fee` and is not added into the tuition principal line.
- Given the school marked the fee waived, when the guardian enrolls, then the fee line is $0 and the waiver is stored.

### Story: autopay does not vacuum the account

**As a** guardian, **I want** autopay to take the installment I agreed to, **so that** a field trip cannot debit the morning tuition runs.

**Acceptance criteria**

- Given tuition autopay is on and a new incidental invoice exists, when the installment runs, then only the installment amount is debited.
- Given incidental autopay is also on, when it runs, then it is a separate charge with its own description on the statement.
- Given the installment amount changes because of a posted aid credit, when the next run happens, then the new amount is shown in the app at least three days before the debit. If notice cannot be given, the run skips and the office is alerted.

### Story: reconcile

**As a** business officer, **I want** a payout report that matches the bank, **so that** I can trust the ledger.

**Acceptance criteria**

- Given a Stripe payout, when the report is opened, then it lists the included payments, refunds, fees, and the payout total.
- Given the sum of lines does not equal the payout, when the daily job runs, then the mismatch is flagged and visible. It is not auto-corrected.
- Given an export, when the officer downloads CSV, then amounts are in cents-accurate decimal dollars and include student external id.

### Story: refund

**As a** business officer, **I want** to refund a field trip when a student withdraws, **so that** the family sees the credit without a manual bank transfer.

**Acceptance criteria**

- Given a succeeded card payment, when the officer refunds part of it, then Stripe is called once, the ledger records the refund, and the guardian statement shows it.
- Given a teacher account, when they call the refund endpoint, then it is forbidden.
- Given the refund webhook repeats, when it is processed, then the ledger does not double the credit.

## Dependencies

Stripe Connect as specified in [Integrations](../09-integrations.md). Household financial access from [Identity and roster](identity-and-roster.md). Lunch loads use the same payments and ledger conventions. Pricing of fees is in [Monetization and pricing](../06-monetization-and-pricing.md).

## Module acceptance

A staging school can post an incidental, pay it in test mode, see the fee separated, receive a duplicate webhook without a duplicate ledger post, and download a payout CSV a business officer can add up.
