# Lunch

**Phase:** Campus

Lunch is the first daily money habit and the first health-sensitive workflow. It should feel like a prepaid account and a menu, not like a second tuition system and not like a medical device.

## Purpose

Let families preorder from a menu the school published, block items that conflict with a recorded allergen, and spend a prepaid balance at the cafeteria without a card swipe per meal.

## Users

Business office (prices, aid flags, reconciliation), kitchen or front office (menu, serve, POS), nurse (verify allergy profile), guardians with financial access (load and order), students if the school allows them to order, carline and teachers (no balances).

## Rules

- Default account is **per student**. Sibling pooling is a later school setting if a partner proves the need. See [open questions](../12-metrics-risks-and-open-questions.md).
- Loads go through Portico Pay. Meals and preorders debit the ledger. They do not create a card charge.
- ACH is the default load method. Card is available with the published convenience fee where permitted.
- A `no_charge` account never declines a meal. The kitchen UI shows that the meal is covered, not why. Teachers and carline never see the flag.
- Negative balance policy is school-wide: block, or allow down to a configured limit (default block at zero for new schools, because surprise debt is a parent complaint).
- Allergens are a controlled list (milk, egg, peanut, tree nut, wheat, soy, fish, shellfish, sesame, plus school-added tags). Free-text notes are visible to the kitchen and are not safety logic.
- If an item's allergen tags intersect the student's profile, the order is refused. A nurse or admin can record an override for a specific item and date, with a reason.
- Parent-declared allergies display as unverified until the nurse verifies them. The block still applies before verification. Verification is a workflow, not a delay in safety.
- Cutoff time is school-local. After cutoff, preorder closes. The cafeteria can still ring a same-day item on the POS if the school allows walk-up.
- Prices are set by the school. Portico does not take a per-item placement fee.
- Refunds of a load are a business-office action to the original payment method, audited. Adjustments of a meal debit are a separate audited ledger entry.

## Out of scope

- USDA meal-claim reporting and free/reduced federal paperwork. Private-school internal aid is the `no_charge` flag and a ledger credit, not a federal module
- Nutrition analysis, recipes, or inventory purchasing
- Facial recognition at the point of sale
- Suggesting menu items from a model

## User stories and acceptance criteria

### Story: publish a menu

**As a** kitchen manager, **I want** to enter next week's items with prices and allergen tags, **so that** families can order before the cutoff.

**Acceptance criteria**

- Given items for a date, when they are published, then guardians with financial access see them and guardians without it do not.
- Given an item has no price, when publish is attempted, then it is refused.
- Given an item is unpublished after orders exist, when the save happens, then existing orders are cancelled, balances are not debited, and the guardian is notified in the app.

### Story: order around an allergy

**As a** guardian, **I want** peanut items to be impossible to order for my child, **so that** a rush at 7:40 a.m. cannot override the profile.

**Acceptance criteria**

- Given the profile contains peanut and an item is tagged peanut, when the guardian views the menu, then the item is visible, disabled, and labeled with the conflicting allergen.
- Given they attempt to submit it anyway through the API, when the server handles it, then the order is rejected and no debit is posted.
- Given the nurse records an override for that item and date, when the guardian refreshes, then that item becomes orderable and the order stores the override id.

### Story: unverified still blocks

**As a** nurse, **I want** a parent-entered allergy to block food before I have verified it, **so that** verification is not a hole.

**Acceptance criteria**

- Given a new allergen is saved by a guardian, when the menu renders before verification, then conflicts are blocked and the kitchen sees "unverified."
- Given the nurse verifies, when the profile saves, then the block remains and the unverified label is gone.
- Given the guardian removes an allergen, when it was previously verified, then the removal notifies the nurse and does not silently weaken yesterday's audit.

### Story: load a balance

**As a** guardian with financial access, **I want** to add funds by ACH, **so that** my child can order without me handing them a card.

**Acceptance criteria**

- Given an ACH load succeeds via webhook, when the ledger posts, then the balance increases by the load amount and any family-facing fee is a separate line.
- Given the webhook is delivered twice, when the second arrives, then the balance changes once.
- Given a guardian without financial access, when they open lunch, then they can see today's order status if the school allows, and they cannot see or change the balance. Default: non-financial guardians see order status only.

### Story: serve at the cafeteria

**As a** cashier, **I want** to find a student and mark the preorder served or ring a walk-up, **so that** the line keeps moving.

**Acceptance criteria**

- Given a preorder, when the cashier marks served, then the debit posts once and the order status is served.
- Given no preorder and walk-up is allowed, when the cashier selects an item, then the same allergen block applies and the debit posts if the balance policy allows.
- Given the account is `no_charge`, when an item is served, then the student is not declined and the screen does not say "aid" or show a dollar balance to bystanders. Use a neutral "served."
- Given the policy is block at zero and the balance is insufficient, when the cashier tries to serve a priced item, then the action is refused with a calm message and no negative balance is created.

### Story: low balance

**As a** guardian, **I want** a warning before the balance runs out, **so that** my child is not refused at the counter.

**Acceptance criteria**

- Given the balance crosses the school's warning threshold after a debit or a failed expected order, when the job runs, then the financial guardian gets one notice per day at most.
- Given the lock screen, when that notice arrives, then it does not include the amount. The amount is inside the app.

## Dependencies

Portico Pay in [Billing and payments](billing-and-payments.md) for loads. Identity for students and financial access. Nurse role from [Personas and roles](../02-personas-and-roles.md).

## Module acceptance

A week of menus can be published, a peanut item cannot be bought for a child with that tag, a double webhook does not double the balance, and a teacher account cannot open the ledger.
