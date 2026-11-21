# Metrics, risks, and open questions

## How to tell if the wedge works

The north star is operational: **median time from ticket mint to release**, on fair-weather days, for vehicles that were not held. Pair it with a safety counter that must stay at zero: **unauthorized releases**.

A faster line that the staff do not trust is a failure. Trust shows up as a low correction rate and a high share of students released inside the product rather than around it.

### Pilot scorecard

| Metric | Target | Notes |
| --- | --- | --- |
| Consecutive dismissal days completed | 20 per design partner | Excluding weather closures |
| Share of carline students released in Portico on a normal day | ≥ 80% | "Around the product" means a paper release with no event |
| Staff corrections per 100 tickets | < 5 | Exclude pure walk-ups that had no fob and no phone event |
| Staff preference vs previous method | ≥ 4 / 5 | One-question pulse at day 10 and day 20, carline leads and front office |
| Parent crash-free sessions during the window | ≥ 99.5% | |
| Severity-1 safety incidents | 0 | Unauthorized release or lost child attributable to wrong status |
| p95 ticket mint and call fanout | < 2 s | From [NFRs](11-non-functional-requirements.md) |
| Households with at least one fob or one successful app session by day 10 | ≥ 70% of carline households | Measures rollout, not just software |

Missing the safety line stops the pilot. Missing the adoption line means the install and the orientation failed even if the software worked. Do not "fix" a 40% adoption rate by minting tickets from GPS.

### Product metrics after the pilot

| Metric | Why it exists |
| --- | --- |
| Weekly active guardians on school days / guardians with a carline child | Habit. Target above 70% by week four at a new school |
| Percent of tickets minted by gateway vs phone vs staff | If staff manual share stays high, the hardware placement is wrong |
| Same-day changes submitted before cutoff vs after | Tells you if the cutoff is real or if the office is the product |
| Median cars-ahead at call time | A proxy for whether staff are calling too early |
| Override count per 100 releases | High means policy confusion or a missing authorization feature. Read the reasons before "fixing" it |
| Gateway heartbeat gaps during windows | Leading indicator of a bad afternoon |
| Support contacts per school per week in month one | Onboarding quality. Spike at 2:40 p.m. is a pager problem |

### Business metrics

| Metric | Planning use |
| --- | --- |
| Schools live, and schools that finished a term | Logos that count |
| Annual contract value and the tier mix | Curb-only forever means the expansion thesis failed |
| Net revenue retention | Campus upgrades should carry this above 100% after year one |
| Logo churn, measured at summer renewal | Under 8% annually is the hope; May–July is when it happens |
| Days from signature to first live dismissal | Target under 21 calendar days for Curb after the kit is on site |
| Payment volume and plan-fee revenue | Only once Campus and School exist |
| Gross margin by stream | SaaS, hardware, plan fees. See [Pricing](06-monetization-and-pricing.md) |
| Share of schools importing via CSV vs SIS sync | CSV is fine. Sync is not a vanity metric |

Do not pay sales or celebrate a launch on "app downloads." Downloads without a ticket minted are orientation leftovers.

## Risks

### Product and safety

| Risk | Why it is real | Response |
| --- | --- | --- |
| iOS location permission denied in a large share of families | The permission is honestly scary | Fob and "I'm on my way" are the contract. Measure denial and do not panic if the fob path holds |
| iOS background behavior changes | Apple revises region monitoring | Gateway plus fob does not depend on it for the ticket. Keep a device lab of current and previous iOS |
| Wrong person, right car | Social pressure at the curb | Two-person override, block UI, training. Contractual clarity that the human decides |
| Two households in conflict | The product becomes the argument | Notify, do not arbitrate. Office owns the block. No in-app argument thread |
| No-smartphone and low-end Android BLE quirks | Private school does not mean every grandparent has a new phone | Family code and fob. Test a cheap Android as a listener. Do not require the listener path |
| Staff reject the iPad | It feels like surveillance of staff or extra work | Named benefit: fewer radio calls. Do not add teacher tasks. Let them keep the radio as backup |
| Paper backup rots in a drawer | Term-one requirement becomes folklore | Morning download is part of the front-office checklist inside the product, with a visible "printed today" mark |
| Early dismissal chaos | The window moves and plans are stale | Pause control, manual add, no GPS tickets |

### Business

| Risk | Response |
| --- | --- |
| PikMyKid or an SIS ships "good enough" carline to the same buyers | Win on no-signal order, custody, and the path to one parent app. Do not win on a blog post |
| Schools ask for SIS replacement in the first meeting | Say no, and show the import. Discounting into a custom SIS is how the company stalls |
| Summer-only implementation calendar | Pipeline has to exist in winter. A spring pilot is the rehearsal. Cash planning should assume a quiet summer of installs, not of new logos |
| Diocesan deals arrive before the product is ready | Take a pilot school inside the diocese, not a 40-school standardization contract |
| Discounting below the minimum | Refuse. Cut implementation or add fobs instead |
| Hardware margin collapses when the BOM is real | Reprice the kit before paid installs. Do not delete gateways |
| Payment regulation if funds are held | Do not hold funds. Stripe Connect. Re-read [D16](decisions.md) if someone proposes a wallet |
| Chat incident | Delay chat until School tier and ship the defaults in [Security](10-security-privacy-compliance.md). A chat scandal will erase a carline reputation |
| Trademark conflict on the name Portico | Search before the public marketing site and before a store listing. The specification can move to a new name without moving the decisions |

### Delivery

| Risk | Response |
| --- | --- |
| Scope creep from design partners | The MVP list is the contract. Write custom work down and decline it |
| Gateway install needs an electrician and dies in facilities | Site survey before the agreement's install week. Remote install is the default; if a school needs a pull, they schedule it |
| On-call cannot cover a bad 2:45 p.m. | US-only, freeze deploys in dismissal hours, status view of who is in a window |
| Double entry on grades later | Do not ship the module. [D11](decisions.md) |
| Audit log treated as a debug log and filled with junk | Separate tables. Release fails if the audit write fails |

## Open questions

These are unresolved on purpose. They are not permission to reopen the decisions log casually.

1. **Fob-only schools.** If a design partner refuses location permissions culturally, do we ship a build that hides the location primer entirely and still charge the same Curb price? Leaning yes.
2. **Two custodial guardians editing the pickup list.** Notification is decided. Whether some schools require both guardians to approve an *addition* is not. Default remains either may add, both are told. Revisit if a partner's counsel objects.
3. **SMS budget.** OTP is in. Proactive SMS ("you are next") is out of MVP. Whether Campus includes a per-school SMS cap or a pass-through needs a price from the SMS vendor and a look at actual parent demand after the pilot.
4. **Release-audit retention.** Seven years is the working number because safety records are not chat logs. Counsel may shorten non-safety audit classes.
5. **Insurance and liability caps.** The principle — school decides, product records — needs a real contract. Not an open product question, but it will come back as one if the contract is vague.
6. **Plan-fee rebate for groups.** The 20% lever in [Pricing](06-monetization-and-pricing.md) is a negotiation tool, not a published discount. Confirm it does not wreck plan-fee margin before the first diocese conversation.
7. **Pooled sibling meal accounts versus per student.** The schema allows either. Pick per student unless a business officer shows that families hate it. Per student is clearer for aid and allergies.
8. **Second lane demand.** If more than half of pilot schools physically run two lanes, pull the Campus lane feature forward. Do not build it speculatively before that evidence.
9. **Student login age.** Default "no student login below the grade the school sets, and not below grade 5 in our recommendation." Confirm with the first School-tier buyer, not during the carline pilot.
10. **Air-gapped or restrictive school networks.** Some schools intercept TLS. mTLS gateways may need a documented exception. Discover this in the first site survey rather than in week one of dismissal.
11. **Name and entity.** Trademark search, company name, and domain are outside this specification and block a public marketing site. They do not block writing the product down.

## What would change the recommendation

Change the wedge only if design partners cannot get a gateway on the network or will not manage fobs, *and* a phone-only pilot still beats their current clipboard on the scorecard. That is evidence. A competitor's feature announcement is not.

Change the tuition stance only if paying schools are asking to leave FACTS and the reconciliation job has already run cleanly on incidentals for a term. Until then, School-tier tuition is a sequenced plan, not a pilot.
