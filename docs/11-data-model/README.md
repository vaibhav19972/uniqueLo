# 11 — Data Model

> **Read before changing any product field.** This section is the measured truth
> about what the catalogue holds, what it duplicates, and what it invents.

## The finding in one line

The product contract has **29 content columns** and needs about **18**. Five of
them restate another field. Four describe manufacturing in prose that was never
measured. And the nine fields a ₹699–3,999 India-first storefront actually needs —
COD, delivery date, return window, country of origin among them — **do not exist
at all**.

## Why this section exists

The catalogue was modelled to justify a luxury price point that has since been
retired (`STAR_GOAL.md` §1). A ₹5,499 jacket needs an artisan story to earn its
price; a ₹699 tee does not. When the story fields stayed and the price ceiling
dropped, they became filler — and filler that is *typed into a form* gets
invented.

This is not a code-quality problem. The code is fine. It is a *data-honesty*
problem, and one of the invented values is already rendering in the shipped mobile
app.

## Contents

| File | What it covers |
|---|---|
| [00 — Product data audit](./00-product-data-audit.md) | The full audit: 5 redundant fields, 4 invented provenance fields, the 22-column universes table, target model, and why the bloat happened |
| [00 — Audit queries](./00-audit-queries.md) | Every command that produced a number in the audit. Re-run before trusting it on a later date |

## The five redundancy findings

| # | Finding | Action |
|---|---|---|
| 1 | `expressionSlug` is an exact rename of `expressionScore` (1:1 across all 13) | Delete the slug |
| 2 | `intensity` and `expressionScore` are independent, and the code's fallback between them is **wrong for 5 of 13** | Pick one as stored truth; derive the other |
| 3 | `artStyleSlug` duplicates the universe and the motif | Move to `motifs` |
| 4 | `characterIds === [motifId]` on 8 of 8 products that have both | Delete the array |
| 5 | `collectionSlug` has 3 values for 13 products and overlaps universes 1:1 | Fold into the universe drop model |

## The four honesty findings

| # | Field | Problem |
|---|---|---|
| 1 | `craftCluster` | Named artisan collectives ("Old City Needlework Collective") that read as real suppliers. Either they are supplier records — then they belong in a supplier table with GSTIN and audit status — or they are fabricated provenance. Rendered on 8 mobile screens. |
| 2 | `craftRegion` | Printed as the "made in" line (`ProductCard.tsx:175`), but it describes *craft tradition*, not *manufacturing origin*. Cannot satisfy country-of-origin disclosure. Values mix granularities: `Rajasthan` (state) beside `Kutch & Okayama Collaboration` (two countries). |
| 3 | `soldCount` | `1.2K+` as a hand-typed string on 13/13 products, self-labelled "mock-phase social proof". At a trust-first price band, invented sales counts are the most damaging possible field. |
| 4 | `batchNumber`/`batchTotal` | "BATCH 03/25" is a limited-edition claim, present on 2 of 13 products inconsistently. Either every SKU has a real run or the field goes. |

The mechanism is in `Admin.tsx:334` — the create form pre-fills
`craftCluster: 'Valley Aari Needlecraft Guild'`, so every product inherits one
supplier name unless the operator overrides it.

## What is missing

Nine fields, all P0/P1, none present:

`cod_available` · `delivery_days_min/max` · `return_window_days` ·
`country_of_origin` · `manufacturer` · `weight_grams` · `hsn_code` ·
`size_chart`

Plus `care` — wired in schema, interface and mapper, but never seeded.

## Order of work

1. Delete the fabrications (they are live claims).
2. Split craft provenance from manufacturing origin.
3. Collapse the duplicated axes.
4. Add the trust fields — **this is the actual product work**.
5. Reprice the catalogue to the ₹699–3,999 ladder last, so new SKUs are created
   against the corrected schema.

Step 5 before step 1 means building 13 SKUs on a schema you are about to change.
