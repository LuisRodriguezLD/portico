# Problem and market

## The problem

A private day school sells judgment, safety, and attention. The dismissal line is where that promise is most visible and least supported.

On a normal afternoon a lower-school team stands outside with a radio, a printed roster, and windshield signs. Parents text the front office at 1:55 to say a grandparent is coming. A teacher holds a class because nobody knows whether the Chen car is three back or still on the parkway. Two households share custody and the roster is a spreadsheet from August. The line spills into the street. Someone releases a student to the right car and the wrong day.

The operational version of the same problem: schools do not know, in order, who is in the queue. They know who was supposed to come. Those are different facts. Without arrival order, staff either stage every student in a gym for forty minutes or call children down late and keep the line moving at the speed of the intercom.

Carline is the sharp edge. It is not the whole pain.

Parents at a well-run private school still keep four logins: the SIS portal, a tuition site, a lunch balance that might be a separate vendor, and email or a group text that acts as the class channel. Teachers are asked to post grades in one place and answer the same absence question in another. The business office reconciles a lunch spreadsheet against a tuition platform that parents resent and a card terminal at the front desk for everything else. None of these systems know that Maya was released to her grandmother at 3:02.

## Who feels it

| Person | What hurts | What they buy instead |
| --- | --- | --- |
| Head of school | Parent complaints, near-miss pickup stories, a board that asks "what are we doing about dismissal?" | A dismissal app, a new traffic pattern, more staff on the curb |
| Director of operations | Radios, weather days, early close, substitute coverage | Clipboards and institutional memory |
| Teacher | Holding the room until the list makes sense; texts from parents | Paper dismissal changes |
| Business officer | Tuition platform lock-in, lunch cash, incidental checks | FACTS or Blackbaud, plus a cafeteria vendor, plus paper |
| Parent | Uncertainty in line, a surprise when the plan changes, yet another password | The carpool text thread |
| Front office | "Can this person take my child?" with a thin file | A binder |

Public districts feel a version of dismissal pain. They are not the first market. Procurement, pricing, and the definition of a "household" are different, and a public-school tool will always be priced and designed for that difference.

## The market

Figures below are planning ranges, not a fundraising appendix. Refresh them from the latest NCES Private School Universe Survey and from NAIS before using them externally.

- On the order of **30,000** private elementary and secondary schools in the United States, and on the order of **5 million** private-school students.
- **NAIS-member independent schools** are a smaller set, historically under two thousand, with higher tuition and more administrative staff. They buy Veracross, Blackbaud, or both.
- **Catholic and other religious schools** are the larger count. Many already run tuition through FACTS (Nelnet). Parish schools are price-sensitive; diocesan groups are slow to buy and valuable once they do.
- A reasonable first beachhead is **one-campus day schools, PK–8, 150–800 students**, independent first, parochial second. That is a few thousand schools, not thirty thousand. A few hundred logos, at the prices in [Monetization and pricing](06-monetization-and-pricing.md), is a real company. Thirty thousand is a fantasy that pulls the product toward districts.

Tuition context matters more than school count. A 400-student day school at $20,000 tuition is an $8 million institution. A $6,000 to $23,000 operations subscription is a rounding error next to one retained family, and it is still large enough to fund support if the contract has a minimum. Schools that charge a $75–$150 annual technology fee already collect more than Portico costs.

The school calendar gates revenue. Fall implementation is sold the previous winter and spring. A product that misses May does not get another dismissal rehearsal until August. See [MVP and roadmap](03-mvp-and-roadmap.md) for how that calendar should drive sequencing.

## What schools buy today

### Dismissal

**PikMyKid** is the product a serious buyer will name. It already does parent arrival, delegated pickup, and a staff dismissal view, and it is used by elementary schools including private ones. Other tools cover pieces of visitor management and dismissal (Raptor is the name schools know for visitor and safety screening, not for a tuition ledger).

Portico does not win by claiming the category is empty. It wins if the queue order is more reliable when GPS is wrong and the phone has no signal, if custody and households match how private schools actually release children, and if the same parent account becomes lunch, payment, and grades. A dismissal-only company can copy a fob. It has a harder time becoming the business office and the gradebook without starting over.

### Student information and money

| Incumbent | Where they are strong | Where Portico should not attack first |
| --- | --- | --- |
| **Veracross** | Independent-school SIS, broad and deep | "Rip out Veracross to fix carline" |
| **Blackbaud** | SIS plus advancement and tuition management | Fundraising and alumni |
| **FACTS** | Tuition and payment plans for Catholic and Christian schools | Becoming the ledger of record on day one |
| **PowerSchool, Alma, smaller SIS products** | Rosters, grades, portals of varying age | District-shaped workflows |
| **MySchoolBucks, LINQ, and cafeteria vendors** | Meal balances and POS | A full nutrition-services suite |

Parents experience these products as portals. Administrators experience them as systems of record they are afraid to leave. Both descriptions are accurate. Portico sits in front as the daily layer, imports the roster, and only later offers to own grades or tuition for schools that want one vendor.

### The gap

No incumbent is excellent at all of the following at once:

- Ordered arrival that still works when the parent's phone has no signal
- Two households, a custody flag, and an authorized grandparent who is not a payer
- A carline staff screen readable in full sun
- A parent task list that includes pickup, lunch, and a field-trip fee without four passwords
- A business model that does not depend on selling student data

That combination is the position.

## Positioning

**For** private PK–8 day schools whose carline is the most public twenty minutes of the day, **Portico** is the school operations platform that makes pickup safe and calm, **unlike** a traditional SIS portal or a standalone dismissal app, **because** arrival order is established at the curb by hardware the school controls, and the same account is designed to grow into lunch, payments, grades, and class communication without a rip-and-replace on day one.

Category language to use with buyers: "dismissal and school operations." Category language to avoid: "AI-powered education cloud," "Uber for pickup," "social learning."

One-sentence proof the pilot must earn: *staff trust the order of the line, and a child is never stranded because a phone was in a dead zone.*

## Why schools will pay

- **Risk.** An unauthorized release is an existential event for a head of school. Audit and custody flags are worth more than a nicer roster.
- **Parent sentiment.** Carline complaints show up in enrollment conversations. Retention of a single family covers years of subscription.
- **Staff time.** A chaotic curb consumes administrators every afternoon. The product has to give that time back to carline staff without moving the work onto teachers.
- **Consolidation later.** Every extra parent login a school can retire is budget and goodwill. That is the expansion revenue, and it is why Curb pricing is allowed to be the cheap tier rather than the whole company.

## Why they will hesitate

- "We already have PikMyKid." Answer with queue reliability, households, and the path to one parent app. Do not answer with a feature checklist.
- "We already have FACTS and Veracross." Agree. Import the roster. Do not lead with replacement.
- "Our parents will not turn on location." Correct, some will not. The fob and the "I'm on my way" button are the contract. Location is an accelerator. See [Carpool and dismissal](04-carpool-and-dismissal.md).
- "We cannot be the school that tracks parents." Publish the data rule in the sales process: no path traces, no map, pickup window only. See [Security, privacy, and compliance](10-security-privacy-compliance.md).
- "IT is one person." CSV import, Google and Microsoft staff login, and a kit with a site-survey checklist. No professional services novel.

## Competitive stance by phase

| Phase | Compete on | Refuse to compete on |
| --- | --- | --- |
| Curb | Queue accuracy, release audit, custody, outdoor UX, no-smartphone path | District RFP breadth, bus routing optimization |
| Campus | Parent daily habit: attendance, calendar, lunch that knows allergies | Full nutrition-services bidding, commodity SIS portals |
| School | Gradebook and tuition experience for schools ready to switch | Advancement, admissions CRM, facilities, HR |

Bus routing, admissions, and fundraising are neighboring budgets. They are also neighboring products with specialized buyers. Stay out until the daily loop is loved. That restraint is a pricing decision as much as a product decision: every unbuilt module is a sales conversation that does not discount the subscription.
