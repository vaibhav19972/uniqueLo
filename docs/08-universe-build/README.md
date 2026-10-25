# 08 — Universe Build Orchestration

> **Pre-build planning bible for the themed-universe UniqueLo storefront.**
> Nothing in this section is code. Every file here must be agreed before implementation begins. When a file's decisions change, update the file first, code second.

## How to use this section

1. Read files in order (`01` → `09`). Each file ends with **Decisions locked** — the non-negotiable outcomes.
2. `03-data-model.md` is the only file allowed to propose schema deltas against `supabase/schema.sql`. All other files reference it, never duplicate it.
3. `09-build-phases.md` is the execution checklist. A phase is done only when its acceptance criteria pass **and** the relevant spec file still describes what was built.
4. Existing docs still govern their domains: `02-design-system` (base tokens), `03-data-contracts` (`src/lib/data.ts` rules), `05-phases` (phase-gate process). This section adds the universe layer on top; conflicts resolve in favor of the older doc unless recorded here with a reason.

## File map
| File | Question it answers |
| :--- | :--- |
| [01 — Vision & Scope](./01-vision-and-scope.md) | What are we building, for whom, and what is explicitly out of scope? |
| [02 — Navigation & IA](./02-navigation-and-IA.md) | Every route, nav element, and how the universe switcher behaves. |
| [03 — Data Model](./03-data-model.md) | Tables, fields, relations, universe/vibe/lore additions. Mirrors `supabase/schema.sql`. |
| [04 — Universe Theming](./04-universe-theming-system.md) | The 3 universe bibles, 7 vibe modifiers (extensible registry), CSS token architecture. |
| [05 — Page Specs](./05-page-specs.md) | Section-by-section build spec for every page template. |
| [06 — Commerce Flow](./06-commerce-flow.md) | Cart, pricing, coupons, UPI/COD checkout, order states. |
| [07 — Image Pipeline](./07-image-pipeline.md) | 6-slot catalog shoots via `tools/catalog-image-harness` + Gem/GPT workflow. |
| [08 — SEO, A11y, Performance](./08-seo-a11y-performance.md) | Budgets and gates every page must pass. |
| [09 — Build Phases](./09-build-phases.md) | Ordered phase cards with acceptance criteria. |
| [10 — Launch Content](./10-launch-content-checklist.md) | P5 checklist: every mock/sample must be replaced or waived before launch. |

## Visual references

ChatGPT image-2 target renders live in `sketches/design-renders/chatgpt-v2/` (**local-only, gitignored** — ask the owner for the files; they are not in the repo). Full file→spec index is in that folder's `README.md`. All 9 render prompts are covered: homepage hero, vibe gateway, universe portals, craft strip, bestsellers, UGC wall, newsletter/footer, 3× universe landings, PDP.

## Governing facts (do not contradict without an ADR)

- Stack: Vite 6 + React 19 + TS + Tailwind v4 + Supabase + zustand + react-query.
- Currency: INR, prices stored as integer paise (`price_cents`).
- **Outlets, not data:** components render whatever the catalog holds. Render images, names, prices, and counts are mock variables — never hardcoded. New universes, categories, genders, and products must work with zero component changes.
- Active catalog: Supabase `products` (29 rows, measured 2026-10-25) seeded from
  `backend/production-seed.sql`, itself generated from `web/src/data/*.json`.
  `src/data/mock-products.json` holds 3 fallback products used **only** when Supabase
  is unconfigured or a read errors — it is not a second catalogue and has no
  `isMock` flag (retired 2026-10-25). The old 13-product `products.json` was deleted
  as stale; its DB-side record survives only in the local/dev `backend/seed.sql`.
- Taxonomy: universe (extensible, 3 at launch) · vibe (extensible registry, 7 at launch: 4 featured + noir/pearl/gilded — presentation-only; relaxed from fixed-4 Oct 2026, see `01-vision-and-scope.md`) · gender (`men | women | unisex`; unisex appears under both Men and Women).
- Commerce constants: free shipping ≥ ₹29,050 · gift ≥ ₹49,800 · standard shipping ₹1,999 · NEEDLECRAFT coupon ₹3,320.
- All UI data flows through `src/lib/data.ts`. No direct JSON imports in components.
- IP rule: original-inspired motifs only. No trademarked characters, names, or artwork on garments or site.
