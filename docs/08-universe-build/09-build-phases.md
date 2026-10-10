# 09 — Build Phases

> Phase-gated per `docs/05-phases` convention. Do not start phase N+1 with phase N red. Each phase ends with `tsc --noEmit` + `npm run build` green.

## P0 — Foundations & schema deltas
- [ ] Migrate/extend Supabase per §03-§B (universes, motifs, drops, garment_type, payment columns, indexes).
- [ ] Backfill 13 products → universes; every product gets `motif_id` with `ip_cleared = true`.
- [ ] Seed parity check: JSON ↔ SQL row counts, no hex/placeholder regressions.
- Accept: schema applies clean; RLS policies cover new tables (public read catalog, insert-only storefront writes).

## P1 — Theming engine
- [ ] `universes.css` token contract (§04) + `[data-universe][data-vibe]` scoping; first-paint theme from route.
- [ ] Vibe toggle (URL-synced, session-persisted); neutral checkout/account immunity.
- Accept: all 3 universes × 4 vibes render; contrast audit passes per §08; no theme flash on deep links.

## P2 — Navigation & shells
- [ ] Routes per §02; header/nav/footer; universe switcher + exit chip; breadcrumbs; search.
- Accept: every route resolves; 404 + empty-filter states designed; mobile nav complete.

## P3 — Homepage + universe landings
- [ ] All §05.1 + §05.2 sections; lore strips from `motifs`; live drop countdown from `drops`.
- Accept: skeleton shared across universes (verified by diff, not eyeball); Lighthouse ≥ 90.

## P4 — PDP + commerce
- [ ] PDP per §05.3 (gallery slots, motif story, JSON-LD); bag/checkout/confirmation per §05.5 + §06.
- Accept: stock clamps, OOS guards, visible validation errors, order snapshots, totals recomputed.

## P5 — Content & catalog fill
- [ ] Image pipeline (§07) for launch SKUs; lore entries for all motifs; reviews seed; journal launch posts.
- Accept: every product has 6 reviewed images; every motif `ip_cleared`; no placeholder art on launch surfaces.

## P6 — Gates & launch
- [ ] Full §08 audit (SEO/a11y/perf) per template; cross-browser + keyboard-only checkout pass; parity + RLS re-verify.
- Accept: all budgets green; `audit.md` updated; launch checklist signed.

## Decisions locked

1. Schema before UI (P0 first, no exceptions).
2. Shared skeletons proven by code (one grid, one PDP), not by visual similarity.
3. Content/IP clearance (P5) blocks launch, not just code.
