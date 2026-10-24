# 00 — Product Data Audit: what is bloat, what is required

> **Measured 2026-10-24** against `src/data/mock-products.json` (13 products),
> `src/lib/data.ts` (209–280), and `backend/schema.sql`.
> Every claim below has the query that produced it in
> `docs/11-data-model/00-audit-queries.md`.
>
> **Verdict: the catalogue carries 2–3× the fields it needs, and the trust fields
> it actually needs are entirely absent.** The bloat is not random — it is the
> residue of the luxury framing now retired in `STAR_GOAL.md`.

## 1. The shape of the problem

| | Count |
|---|---|
| Product content columns in DB | **29** (31 incl. `slug`, `created_at`) |
| Frontend `Product` interface fields | **~34** |
| Fields a storefront card or PDP actually needs | **~18** |
| Fields duplicated across other fields | **5** |
| Trust fields required at ₹699–3,999 | **0 of 6 present** |

The catalogue is over-modelled where it should be thin (craft narrative) and
unmodelled where it must be thick (trust).

---

## 2. Redundancy — five fields that restate another field

### 2.1 `expressionSlug` is a rename of `expressionScore` — drop the slug

Measured across all 13 products, the mapping is **exactly 1:1**:

| `expressionScore` | `expressionSlug` |
|---|---|
| 1 | minimal |
| 2 | understated |
| 3 | cult |
| 4 | expressive |
| 5 | maximalist |

Five strings, five integers, one axis. `expressionSlug` adds zero information.
**Keep `expressionScore`; delete `expressionSlug`.** The labels live in
`src/data/expression.json` (registry), which is where display copy belongs.

### 2.2 `intensity` is a lossy 3-stop projection of the same axis — keep, but document it

`getExpressionScore()` (`data.ts:396`) derives score from intensity as
`quiet→1, balanced→3, loud→4`. Measured, that fallback is **wrong for 5 of 13
products**:

| Product | intensity | true score | fallback would give |
|---|---|---|---|
| sakura-ronin-hoodie | loud | 5 | 4 |
| royal-procession-jacket | loud | 5 | 4 |
| red-sun-motif-tote | balanced | 2 | 3 |
| ascendant-hoodie | quiet | 2 | 1 |
| arch-jaal-scarf | quiet | 2 | 1 |

So `intensity` is **not** derivable from score and score is **not** derivable
from intensity. They are two real, independent classifications of one concept:
- `expressionScore` (1–5) = fine-grained, used for sorting/curation
- `intensity` (quiet/balanced/loud) = coarse, used for the **shopper-facing
  filter** (`FilterStore.setIntensity`)

**Verdict: keep both, but make `intensity` the stored truth and derive the 5-stop
score from it — or store score and derive intensity with the documented
boundaries.** Today BOTH are hand-maintained and they disagree on 38% of the
catalogue. That is the real bug, not the field count.

Note this also bites the price ladder: `loud` must exist at ₹1,399
(`STAR_GOAL.md` §1), and intensity is the filter customers will use to find it.

### 2.3 `artStyleSlug` overlaps the universe system and the expression system

Values: `atelier-tonal`, `comic-noir`, `crest-emblem`, `mughal-miniature`,
`ukiyo-line`. Measured, it is **not** a function of `expressionSlug` (cult maps to
2 art styles, understated to 3), so it is a genuinely separate axis — the
*visual idiom*. That is legitimate.

But it duplicates work the **universe** already does (`animeverse` → ukiyo-line,
`heroverse` → crest-emblem, `itihaas` → mughal-miniature), and it duplicates the
**motif** (`motifId` already names the artwork). Measured: 5 art styles across 3
universes across 8 motifs.

**Verdict: demote.** Art style belongs on the **motif/artwork**, not on the
product — one artwork has one idiom, and products sharing a motif currently cannot
disagree about it. Move it to `motifs.art_style_slug`.

### 2.4 `motifId` and `characterIds` are the same field, twice

Measured: **8 of 8** products that have both have `characterIds === [motifId]`.
Not one product uses the multi-character capability the array exists for.

**Verdict: keep `motifId` only.** If a product ever needs two motifs, add the
array back then. Today it is 100% redundant and it doubles the surface the mobile
app must parse.

### 2.5 `collectionSlug` vs `universeSlug` vs `edits`

Three grouping systems coexist:

| Field | Card. | Nature |
|---|---|---|
| `universeSlug` | 13/13 | The capsule (Animeverse / Heroverse / Itihaas / Atelier) — **the primary navigation axis** |
| `collectionSlug` | 13/13 | A "drop" (midnight-atelier, royal-heritage, spring-sakura) — 3 values, overlaps universes 1:1 |
| `edits` | 13/13 | Curated intent collections (Everyday, Statement, Festive…) — 1–3 per product |

`collectionSlug` has 3 values for 13 products and maps onto universes almost
exactly. **Verdict: fold `collectionSlug` into the universe drop model, or delete
it.** `edits` is genuinely different (cross-cutting buyer intent) and stays.

---

## 3. Fiction masquerading as manufacturing data

This is the specific bloat you flagged, and it is worse than redundant — it is
**untrue**, which is a direct breach of `STAR_GOAL.md` §6 ("stock, reviews and
craft specs are truthful or absent").

**The mechanism is visible in the code, not just the data.** `Admin.tsx:334-337`
pre-fills the create form with:

```ts
const [craftRegion, setCraftRegion] = useState('Srinagar, Jammu & Kashmir');
const [craftCluster, setCraftCluster] = useState('Valley Aari Needlecraft Guild');
const [fabricGsm, setFabricGsm] = useState('280 GSM Ringspun Combed Cotton');
const [batchNumber, setBatchNumber] = useState(1);
```

So every product created through the Studio inherits one specific supplier name
and one specific region **unless the operator thinks to change them**. That is how
9 "different" clusters and 10 "different" regions exist while the data is
plausible enough to look real. A free-text field with a prose default is a
fiction generator.


### 3.1 `craftRegion` is invented, and is being shown as origin

Measured values (10 unique across 13 products):

```
Anantnag & Srinagar, Kashmir      Jaipur Atelier
Kutch & Okayama Collaboration     Lucknow, Uttar Pradesh
Murshidabad, West Bengal          Rajasthan
Srinagar, Kashmir                 Uttar Pradesh
```

Problems, in order of severity:

1. **"Kutch & Okayama Collaboration"** — Kutch is Gujarat, India; Okayama is
   Japan. That is not a region, it is a marketing sentence. Two countries in a
   one-value field.
2. **"Jaipur Atelier"** — "Atelier" is not a place. A region field holding a
   business-unit name.
3. **Grain mismatch** — `Rajasthan` and `Uttar Pradesh` (states) sit beside
   `Anantnag & Srinagar, Kashmir` (two cities, plus a union territory) and
   `Lucknow, Uttar Pradesh` (city + state). Four different granularities in one
   column.
4. **It is rendered as country of origin.** `ProductCard.tsx:175` and
   `ProductDetail.tsx:452` both print `craftRegion` as the "made in" line with
   the fallback `'Made in India'` — but `craftRegion` means *where the craft
   tradition comes from*, not *where this garment was manufactured*. Source
   questions cannot be answered from it, and Legal Metrology / e-commerce
   country-of-origin disclosure cannot be satisfied by it.

### 3.2 `craftCluster` is invented organisation names

```
Craft Textile Atelier          Ghat Artisan Weavers
Ghat Zari Weavers Collective   Jaipur zardozi houses
Lucknow zardozi cluster        Old City Needlework Collective
Pink City Monogram Atelier     Shantiniketan Silk Guild
```

"Old City Needlework Collective" and "Ghat Artisan Weavers" read as specific named
suppliers. **If these are real, they are supplier records and belong in a supplier
table with contact details, audit status and GSTIN — not a text column on the
product.** If they are invented, they are a fabrication claim about provenance and
must be deleted before launch.

**This is the highest-risk finding in the audit.** A named artisan collective on a
product page is a sourcing claim. It is also the field the mobile app reads most
(8 usages) — the invented data has already propagated into the app.

### 3.3 `batchNumber` / `batchTotal` — scarcity theatre

Present on **2 of 13** products (`batchNumber: 3`, `batchTotal: 25`). A "BATCH
03/25" badge is a limited-edition claim. It exists on 15% of the catalogue
inconsistently, which means it is decoration rather than a real production fact.
Either every SKU has a real batch run or the field goes.

### 3.4 `soldCount` — mock social proof, and it is a string

13/13 present, values like `1.2K+`, `120+`, `300+`. Typed as a display string, so
it cannot be summed, sorted or validated. `data.ts:264` labels it
*"Mock-phase social proof. Replaced by real review aggregates at launch."*

At ₹699–3,999 with a trust-first priority order, **invented sold counts are the
most damaging possible field** — they are exactly the "false review metrics"
`PRODUCT.md` forbids. Must be real or absent before launch.

---

## 4. Universe theming: 12 presentation columns jammed into a taxonomy table

`public.universes` has **22 columns**. Twelve of them are hero/portal styling:

```
hero_headline, hero_headline_accent, hero_lead_color, hero_accent_color,
hero_headline_case, hero_kicker, hero_ornament, hero_note, hero_vertical_text,
portal_title_color, lore_heading, theme_tokens
```

Two problems:

1. **This is presentation, not domain.** It belongs in a theme config (JSON), not
   in twelve typed columns, and it already half-exists as `theme_tokens jsonb`.
   Verify: `universes.json` carries only 15 keys; **7 DB columns have no seed
   source** (`order_num`, `hero_headline`, `hero_headline_accent`,
   `hero_lead_color`, `hero_accent_color`, `hero_ornament`, `hero_note`) and are
   populated only by `production-seed.sql`.
2. **Two sources of truth.** `Universe.tsx:100` reads `hero_headline` from the
   **DB row** via `data.ts`, while the same content also exists in
   `src/data/universes.json`. Change one, the other silently disagrees.

**Verdict: collapse the 12 presentation columns into `theme_tokens jsonb`** (or a
single `hero jsonb`). A universe is a taxonomy row with `slug, name, tagline,
lore, hero_image, emblem_src, order_num, is_active` — eight columns, not 22.

---

## 5. What is actually missing

Measured: **none** of these exist as a field on the product, anywhere.

| Needed | Why it is required at ₹699–3,999 | Priority |
|---|---|---|
| `cod_available` | #1 first-order blocker in tier-2/3 | P0 |
| `delivery_days_min/max` or a promised date | "5–7 days" reads as a non-answer | P0 |
| `return_window_days` + `returnable` | Decides completion for a first-time buyer | P0 |
| `country_of_origin` | Legally required disclosure; `craftRegion` cannot substitute | P0 |
| `manufacturer` / `packed_by` | Legal Metrology declarations | P1 |
| `weight_grams` | Shipping cost + courier selection | P1 |
| `hsn_code` | GST invoicing | P1 |
| `care_instructions` | On the `Product` interface as `care?: string[]` (`data.ts:273`) and mapped from the DB (`data.ts:525`), but **absent from `mock-products.json`** — so it renders empty on every product today | P1 |
| `size_chart` | Size uncertainty is the top apparel return cause | P1 |

Note `care` **is** a column in `schema.sql`, **is** on the `Product` interface and
**is** mapped from the DB — but the JSON seed omits it, so the field is
structurally ready and empty in practice. That is the mildest form of drift and
the cheapest to fix: fill the data, not the schema.

---

## 6. Recommended target model

Cut from 29 content columns to **18**, and add **4** that matter:

| Keep | Move to motif | Move to supplier | Delete |
|---|---|---|---|
| slug, name, subtitle, description, category_slug, universe_slug, garment_type, gender, motif_id, expression_score, intensity, craft_techniques, edits, material, fit, fabric_gsm, handcrafted, customizable | art_style_slug, motif_story, macro_image | craft_cluster (as a real supplier FK) | foreign_tagline, expression_slug, character_ids, collection_slug, batch_number, batch_total, craft_region (replaced by country_of_origin), sold_count (until real), rating/review_count (derive from reviews table) |

Add: `cod_available`, `return_window_days`, `country_of_origin`,
`delivery_days_min/max`.

`rating` / `review_count` are denormalised caches of the `reviews` table. Keep them
as caches only if they are maintained from real rows — never authored by hand.

---

## 7. Why the bloat happened

Not carelessness. Four compounding causes, each of which will recur if not named:

1. **The luxury frame demanded proof.** A ₹5,499 jacket needs an artisan story to
   justify the price. At ₹699 a tee does not, and the story fields became filler
   that had to be invented to be filled. Retiring the frame (done in
   `STAR_GOAL.md`) removes the pressure.
2. **Every field was modelled as free text.** `craftRegion`, `craftCluster`,
   `fit`, `fabricGsm`, `material` are all `text`. Free text invites prose, and
   prose gets invented. Typed fields with registries resist this.
3. **No single owner of the contract.** `schema.sql` (29 cols), `data.ts` (~34
   fields) and `mock-products.json` (36 keys) have each drifted; `care` exists in
   one and not the others.
4. **Discovery axes accreted.** Expression, intensity, art style, universe,
   collection and edits are six attempts to answer "what kind of thing is this",
   built by different passes over time. Five is too many for 13 products.

## 8. Sequencing (do not do these in the wrong order)

1. **Delete the fabrications first.** `craftCluster` names, `soldCount`,
   `batchNumber`. They are live claims on a shipping storefront.
2. **Split craft provenance from manufacturing origin** — add real
   `country_of_origin`, stop printing `craftRegion` as "made in".
3. **Collapse the duplicated axes** (`expressionSlug`, `characterIds`,
   `collectionSlug`, `artStyleSlug`).
4. **Add the trust fields.** This is the actual product work; everything above is
   subtraction.
5. **Only then** touch the price ladder, because new SKUs should be created
   against the corrected schema, not the bloated one.

Doing (5) first means creating 13 SKUs against a schema you are about to change.
