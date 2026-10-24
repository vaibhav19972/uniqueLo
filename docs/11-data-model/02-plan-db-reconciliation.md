# Plan — Reconcile the data model end-to-end, then reset the database

> Written 2026-10-24. **No code or data changed in this repo while producing
> this document.** The tree is left exactly as found. Every number below is
> measured; the command is shown next to it.

---

## 0. Corrections to the brief

Three premises in the request do not match the repository. Stating them first,
because two change the plan.

| Premise | Measured reality |
|---|---|
| "There are staged changes in web and backend" | **Nothing is staged in either repo.** `git diff --cached --stat` is empty in both. Web `data-model-trust-fields`: 1 unstaged file (`src/lib/data.ts`) + 1 untracked doc. Backend `main`: 1 modified (`production-seed.sql`) + 1 untracked migration. |
| "Here is the origin for backend that I have created" | Correct, and `git ls-remote` returns nothing — the GitHub repo is **empty**. A first push is clean. |
| "Web already points to a git repo" | True, but the branch is **not local-only**: `origin/data-model-trust-fields` exists at exactly my local HEAD `6f6acd9`. Separately, local `main` is **58 commits ahead** of `origin/main` (`1aadd8c`), which has not received a push in some time. |

**The working tree is broken right now.** `npx tsc -b` → **24 errors across 5
files**, from a half-finished edit I made to `data.ts` (interface + query changed,
consumers not yet updated). Do not build, deploy, or cut a branch from this state.

Why it went unnoticed: `npx tsc --noEmit` reports success because this project
uses `references`, so that invocation type-checks **zero files**. `tsc -b` is the
only real gate. An earlier "baseline clean" claim of mine was therefore
meaningless — recorded here so it is not trusted again.

---

## 1. Root cause — the data the site shows was never in the database

`kb/catalog-spine.md` and `docs/07` describe `seed.sql` as "the development
dataset (13 atelier products)". Measured:

| Artifact | Products | Variants | Runs against `schema.sql`? |
|---|---|---|---|
| `src/data/mock-products.json` — what the storefront renders | **13** | **121** | n/a (bundled JSON) |
| `backend/production-seed.sql` | **2** | **8** | yes |
| `backend/seed.sql` | **0** — fails | 0 | **no** |

`seed.sql` fails on a schema-only database with no migration applied:

```
ERROR: column "is_mock" of relation "products" does not exist
ERROR: insert ... violates foreign key constraint "product_images_product_slug_fkey"
→ 0 products seeded
```

It references three columns `schema.sql` has never defined — `is_mock` (27 refs),
`vibes` (26), `moods` (26).

**This is the root cause of the field bloat.** The 13 real products live only in a
bundled JSON file. Nothing ever forced them through a schema, so every product
could carry whatever prose an author felt like adding — `craftRegion:
"Kutch & Okayama Collaboration"`, `craftCluster: "Old City Needlework
Collective"`, `soldCount: "1.2K+"` — and no constraint ever contradicted it. A
database would have rejected half of it on day one.

It also means the answer to *"what do we need to update for our database"* is
uncomfortable: **the database needs the entire catalog added**, not adjusted.

---

## 2. Doc/code consistency audit

### 2.1 Docs that assert the six columns being dropped

Ten files. Split into record vs. living contract:

| Doc | Refs | Action |
|---|---|---|
| `docs/11-data-model/` (4 files) | 32 | **Keep.** They are the audit record and must describe before *and* after |
| `docs/07-backend/README.md` | 1 | **Edit** — self-declared "source of truth", will state a wrong column list |
| `docs/03-data-contracts/README.md` | 7 | **Edit** — field contract |
| `docs/DATABASE_MIGRATION_GUIDE.md` | 8 | **Edit** — must document this migration |
| `docs/09/06-capture-to-schema-workflow.md` | 3 | **Edit** — prescribes fields as capture target |
| `docs/08-universe-build/03-data-model.md` | 1 | **Edit** |
| `docs/08-universe-build/10-launch-content-checklist.md` | 1 | **Edit** |

### 2.2 Docs already wrong, independent of this change

These are pre-existing defects, not caused by the migration:

| Claim | Where | Truth |
|---|---|---|
| `supabase/schema.sql` (5 mentions) | `docs/07` | Moved to `backend/`. The path fix landed in code (`6f6acd9`) but `docs/07` prose was never updated |
| "`seed.sql` seeds the development dataset (13 atelier products)" | `docs/07` §3 | **Seeds 0 — fails to run.** No 13-product SQL seed exists anywhere |
| "14 SKUs / 73 variants, verified 2026-10-12" | `kb/catalog-spine.md` | **13 / 121** |
| "`mock-products.json` carries `moods[]` on all 14 SKUs (14/14)" | `kb/catalog-spine.md` | **0 of 13** carry `moods` or `vibes`. Documents a field that does not exist |
| "Auth gating of `/admin` is planned for Phase 9; the route is open" | `docs/07` §4 | **Shipped** — `AdminAuthGate`, `Admin.tsx:3175`, uses `supabase.auth.getSession()` |
| "Craft Provenance … stores guild clusters, regions" | `docs/07` §1 | Those are precisely the columns being removed |
| "no `is_mock` filter yet — see §3" | `docs/07` §1, `audit.md` | `is_mock` **is not in `schema.sql`**. The open bug in `audit.md` cannot reproduce as written |

### 2.3 A code defect the migration creates

`Admin.tsx:688-704` generates **positional** SQL:

```
${handcrafted}, ${selectedExpressionScore}, '${selectedExpressionSlug}',
${rating}, ${reviewCount}, ${soldCount ...},
...
${batchNumber}, ${batchTotal}, '${craftRegion}', '${craftCluster}', '${fabricGsm}'
) ON CONFLICT (slug) DO UPDATE SET
```

Dropping six columns breaks this twice over — the `INSERT` fails on unknown
columns, and because it is positional with no column list, any column that later
gets reordered silently writes values into the wrong fields. The generator must be
rewritten against the new contract, not patched.

---

## 3. Database strategy — three routes

You said *"we can clean up the database and start with the new schema"*. Right
instinct; there are three ways and they differ in risk.

### Route A — migrate in place
`alter table`: drop 6, add 11, create 2 tables.
- **Pro:** preserves whatever the live DB currently contains.
- **Con:** we do not know what it contains. Dropping the fabricated columns leaves
  the rest, so the storefront would show 2 products (or whatever exists) instead
  of 13, with blanks where the new fields have no data.
- **Verdict:** not recommended as the primary path.

### Route B — drop, recreate from `schema.sql`, seed all 13 ← **recommended**
Nothing to preserve, because the live data is not the real catalog.
- **Pro:** schema provably matches code; constraints in place from row one; the
  new trust fields get real values as part of seeding.
- **Con:** needs the 13-product seed written first (§4); any real orders in the
  live DB would be destroyed.
- **Verdict:** recommended **conditional on the orders check**.

### Route C — squash the migration into `schema.sql`
Fold the trust fields into the base schema so a fresh DB is one file.
- **Verdict:** do this **after** B is verified. Keep the migration file as the
  record of how an existing DB gets there; `schema.sql` becomes the fresh-install
  truth.

### The single blocker for Route B

**Are there real orders in the live database?** I cannot check — no Supabase
credentials in the repo, and I will not drive your production DB through a browser
session. Run one of these:

```sql
select count(*) as orders, min(created_at) as first, max(created_at) as last
  from public.orders;
select count(*) as subscribers from public.newsletter_subscribers;
select count(*) as reviews     from public.reviews;
```

- **orders = 0** → Route B, clean rebuild.
- **orders > 0** → Route A plus a data backfill, which I will write; the migration
  is already verified for that path.

---

## 4. The seed has to be rebuilt, not patched

`production-seed.sql` covers 2 of 13 products and 8 of 121 variants. Hand-writing
11 more INSERT blocks invites exactly the drift this audit is about.

Proposed: `backend/scripts/gen-seed.mjs`
- reads `web/src/data/mock-products.json` (the only artifact with all 13 / 121)
- emits taxonomy, then products, variants, images, `embroidery_details`
- **refuses to emit** any product missing `country_of_origin`, `cod_available`,
  `return_window_days` — the trust fields cannot be silently defaulted
- fails before Postgres sees it if a `universe_slug` / `motif_id` / `garment_type`
  has no matching taxonomy row (FK safety at generation time)
- asserts 13 products / 121 variants on the way out

### Where the trust values come from

| Field | Source | Status |
|---|---|---|
| `country_of_origin` | `IN` for all — you stated made-in-India | settled |
| `cod_available` | all SKUs, or by price tier | **needs your decision** |
| `delivery_days_min/max` | one policy, or per garment | **needs your decision** |
| `return_window_days` | 7 / 15 / 0-for-personalised | **needs your decision** |
| `weight_grams` | derive per garment (tee ≈180, hoodie ≈650, jacket ≈900) then weigh one of each | propose, confirm |
| `hsn_code` | 6109 knitted tees, 6201/6202 woven outerwear, 6214 scarves | engineering mapping, not legal advice — confirm with your CA |
| `size_chart` | does not exist anywhere in the repo | **missing input** |

The generator is therefore blocked on four business decisions, not on code.

---

## 5. Ordered work

Each phase gated on the previous. Nothing here touches the live database.

**Phase 1 — make the tree compile (no data involved)**
1. Finish the 24-error fix: `craftRegion` → `countryOfOrigin`; remove the
   "Edition N/M" badges (`batchNumber`/`batchTotal`); remove or re-source
   `craftCluster`; remove `soldCount`.
2. Gates: `npx tsc -b` clean, `npm run build` clean, `npm run lint` clean.
3. Commit to `data-model-trust-fields`.

**Phase 2 — four business policies** (§4 table). Blocks Phase 3.

**Phase 3 — generate the full seed**
4. Write `gen-seed.mjs`; emit `production-seed.sql` for 13 products / 121 variants.
5. Replay-verify on a throwaway Postgres 16 cluster: `schema.sql` → migration →
   seed, then assert 13 / 121 / zero nulls in trust columns. The harness from the
   previous session still works and is reused.
6. Rewrite the `Admin.tsx` SQL generator against the new column set (named
   columns, not positional).

**Phase 4 — fix the docs** (§2.1 + §2.2, ten files)
7. `docs/07`: column list, seed story, `supabase/`→`backend/`, admin-auth status.
8. `docs/03`, `docs/DATABASE_MIGRATION_GUIDE`, `docs/08/03`, `docs/08/10`,
   `docs/09/06`.
9. `kb/catalog-spine.md`: 13/121, delete the `moods` claim.
10. Append the real deployment outcome to `docs/11/01` once executed.

**Phase 5 — database**
11. Route B if orders = 0: backup, drop, recreate, seed, verify counts.
12. Squash trust fields into `schema.sql` for fresh installs.

**Phase 6 — push**
13. Backend: `git remote add origin https://github.com/vaibhav19972/UniqueBeckend.git`,
    push `main` (empty remote, clean first push).
14. Web: push `data-model-trust-fields`; decide separately what happens to
    `main`'s 58 unpushed commits.

---

## 6. Blocked on you

1. **Real orders / subscribers / reviews in the live Supabase DB?** Decides A vs
   B. *The only hard blocker.*
2. **COD** — every SKU, or tiered?
3. **Delivery window** — single promise or per garment?
4. **Return window** — 7 / 15 / 0, and which SKUs are personalised?
5. **Supplier names** — are `Old City Needlework Collective`,
   `Ghat Artisan Weavers`, `Valley Aari Needlecraft Guild` real vendors I should
   model in `suppliers`, or fabricated and to be discarded?
6. **`main` is 58 commits ahead of `origin/main`.** Push it, or is that a separate
   deployment line?
7. **Push the backend now?** First push to an empty remote is harmless, but it is
   still a push, and my rule is to ask.

---

## 7. Not doing without explicit instruction

- Applying any migration to the live Supabase database
- Dropping any database
- Pushing to either remote
- Deleting the fabricated values from `mock-products.json` — that removes
  `craftRegion`/`craftCluster`/`soldCount` from 13 live product pages
- Re-running `rea setup`, or touching the skills repos

---

## 8. Immediate next action

**Phase 1** — finish the compile fix. Pure code, no data, fully reversible, and it
takes the branch from broken to green. Then stop and report before Phase 2.
