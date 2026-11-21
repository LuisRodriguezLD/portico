# Monetization and pricing

Portico is a subscription business with a payments business attached and a hardware kit that makes the subscription true. The school pays for software. Families pay explicit fees when they choose a payment plan or a card. Nobody pays with their child's data.

Prices are list prices for planning and for this public specification. Confirm processor costs, card-network convenience-fee rules, and state law before a proposal goes to a school.

## Who pays

| Charge | Payer | Notes |
| --- | --- | --- |
| Platform subscription | School, annually in advance | Per enrolled student, with a minimum |
| Carline kit and spare hardware | School, one-time | Per physical lane |
| Implementation | School, one-time | Waived for design partners |
| Tuition pay-in-full by ACH | Family pays $0 fee | Encouraged default |
| Tuition monthly plan fee | Family, unless the school waives it | $50 / student / year |
| Card convenience fee | Family, where permitted | 3.4% + $0.30 |
| Lunch and incidentals funded by ACH load | Family pays the published ACH price only if we must pass a cost; target is **$0 family fee on ACH loads** under a reasonable cap, school not surcharged a percentage of the meal | Meals themselves are ledger debits |

The subscription minimum exists so a 90-student school is not a loss-making support contract. Dismissal support is concentrated into a few hours a day and is emotional. Small contracts that cannot fund that coverage should not be signed.

## Tiers

Per enrolled student per year. An enrolled student has an active enrollment in the current school year and is not withdrawn. Prospective students and alumni are not billed.

| | Curb | Campus | School |
| --- | --- | --- | --- |
| Annual price | **$15** | **$32** | **$58** |
| Minimum annual | **$4,500** | **$8,000** | **$14,000** |
| Carline, households, audit | Yes | Yes | Yes |
| Parent app and staff queue | Yes | Yes | Yes |
| Attendance, announcements, calendar | No | Yes | Yes |
| Lunch and incidental charges | No | Yes | Yes |
| Portico Pay | No | Yes | Yes |
| Gradebook and report cards | No | No | Yes |
| Moderated class rooms | No | No | Yes |
| Tuition ledger and statements | No | No | Yes |
| Included support | Email, plus live chat during dismissal hours on school days | Same, plus a shared success manager for rollout | Named success manager |

A 120-student school on Curb pays the $4,500 minimum (effective $37.50 per student). A 400-student school pays $6,000 on Curb, $12,800 on Campus, or $23,200 on School.

Second campus: bill every enrolled student once. Bill a kit for each physical carline. Do not invent a "multi-campus platform fee."

Modules are not sold à la carte inside a tier. À la carte pricing looks flexible and produces a product nobody can explain. The one add-on expected later, reunification, is a priced extra ($4 / student / year) because not every school wants the operational drill. It is not in the current build.

## Hardware

| Item | List | Role |
| --- | --- | --- |
| **Carline kit** | **$1,800** per lane | 2 PoE gateways, 4 beacons, a starter pack of 10 visor fobs, window cards, install guide |
| Extra gateway | $350 | Long driveways, aftercare door |
| Extra beacon | $80 | Spare or added zone |
| Fob 10-pack | $120 | Two fobs per regular carline household, plus replacements |
| Extra install visit | $900 / day plus travel | After the included remote install |

Target hardware gross margin is 55–65% after shipping, once the bill of materials is quoted. If the first real BOM blows through that, raise the kit price before the first paid school. Do not quietly remove gateways to protect the margin. The gateways are the product.

Beacon replacement during an active subscription is included. Gateways are warranted for three years. Fobs lost by families are a paid 10-pack, not a support argument.

## Implementation

| Tier | One-time fee | Included |
| --- | --- | --- |
| Curb | $2,000 | Remote site survey, CSV import review, curb-lead training, first three dismissal days on call |
| Campus | $5,000 | Curb work plus lunch menu import, payment setup, admin training |
| School | $12,000 | Campus work plus gradebook configuration and a statement parallel-run plan |

Design partners: subscription waived for twelve months, implementation included, and hardware included at pilot scale — the gateways and beacons for one lane, plus two fobs for every carline household, not the ten-fob starter alone. The obligation is operational participation and references, written in the agreement. See [MVP and roadmap](03-mvp-and-roadmap.md).

Travel for an on-site first week is out of scope and priced only when a school demands it. The product should install from a guide and a video. If it cannot, fix the guide before hiring installers.

## Portico Pay

Stripe Connect. The school is a connected account and the merchant of record. Tuition and lunch funds settle to the school's bank. Portico never holds the balance. See [D16](decisions.md).

### What families see

- **Pay tuition in full by ACH:** no Portico fee.
- **Monthly tuition plan:** $50 per student per year, disclosed before enrollment in the plan. This matches the shape of fees families already pay for school payment plans, and it is Portico revenue. The school receives the tuition amount.
- **Card:** 3.4% + $0.30 convenience fee, paid by the family, only where network rules and state law allow. If a state or a card network forbids it for a given charge type, the school chooses to absorb the card cost or to disable cards for that charge. Portico does not hide the fee inside the tuition principal.
- **Lunch:** parents load a balance. ACH load is the default and should be free to the family up to a published monthly load count. Spending the balance at the cafeteria has no per-meal card fee.

### What Portico keeps

- The entire $50 plan fee, unless a diocese or a large group negotiates a rebate. The lever, if needed, is **20% of plan fees rebated above a committed school count**, not a cut of tuition.
- The spread between the published card convenience fee and Stripe's cost. Model that spread conservatively in the plan; do not treat it as the company's main engine.
- ACH pay-in-full is a retention feature. It is allowed to be low margin or zero margin.

### Worked example: 400 students, School tier

Assumptions, labeled as assumptions: average tuition $22,000; 70% of students on a monthly plan; 30% pay in full by ACH; lunch participation 50% at about $7, four days a week, 36 weeks, prefunded by ACH; incidentals $150 per student per year, half on cards.

| Stream | Math | Annual amount |
| --- | --- | --- |
| Subscription | 400 × $58 | $23,200 |
| Plan fees | 400 × 70% × $50 | $14,000 |
| Card convenience spread | Not the headline. 400 × $150 × 50% on cards × ~1% planning spread | about $300 |
| Lunch loads | Internal ledger. ACH loads near zero family fee. Little net revenue by design | — |
| Kit and implementation | Year 1 only | $1,800 + $12,000 |

Year-2 recurring for this school is about **$37,000** before any card spread, on an $8.8 million tuition book. The school is not paying "a percent of tuition." The family on a plan is paying a fee they can see.

If that school stays on FACTS for tuition and only buys Campus, recurring is $12,800 plus incidental convenience fees. Still worth having. Do not discount Campus to win a logo that will never move lunch or incidentals. The minimums are there so discounting has a floor.

### Portfolio sketch (planning model, not a forecast)

100 schools, average 350 students, mix 40% Curb / 40% Campus / 20% School, after the product has all three tiers. Weighted subscription is $30.40 per student.

- Subscription: 35,000 × $30.40 = **about $1.06 million**
- Plan fees, if half of School-tier students and none of the others are on Portico tuition plans: 100 × 20% × 350 × 50% × $50 = **about $175,000**
- Hardware is front-loaded and excluded from this recurring sketch
- This is a small company with real gross margin, not a venture-scale assumption. Growth past it comes from more logos and from moving Curb schools to Campus, not from raising the take rate on tuition

Gross margin targets once hosting, SMS, and Stripe fees are counted: SaaS above 80%, hardware 55–65%, blended above 70% when subscription is the majority of revenue. If SMS or support payroll breaks the SaaS margin, cut SMS before raising the quiet take rate.

## Contract terms that protect revenue

- Annual term, invoiced on signature, auto-renew
- Renewal notice 60 days before term end. Schools decide in the spring; the notice has to land while they are still in session
- Price increase capped at the greater of 5% or CPI, with 60 days' notice, so the first renewal is not a fight
- Withdrawal of a student mid-year does not produce a refund; new students above the billed count are trued up at renewal, or quarterly if a school is growing fast. Pick quarterly true-up only for schools that add a summer cohort
- Hardware is sold, not rented, in v1. Rental adds a finance workflow the pilot does not need
- Schools may pass the subscription through an existing family technology fee. Portico does not set that fee and does not appear as a surprise line on tuition without the school's copy

## What we will not monetize

- Selling or licensing student data
- Advertising to parents or students
- A per-message fee on class rooms
- A per-pickup fee
- A basis-point skim of tuition principal
- Paid placement of lunch items or vendors inside the menu
- Charging teachers for access

## Packaging narrative for the sales call

Lead with Curb and the kit. Show the audit and the no-signal case. Quote Campus as the first renewal, not as the thing that must be bought before the first dismissal day. Mention School tier as the destination for schools that want one parent app and are willing to leave a portal, and name the incumbents respectfully. If the buyer wants a discount, remove implementation or include a spare fob pack. Do not cut the per-student price below the tier. The minimum is the discount floor.
