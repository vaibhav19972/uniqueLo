---
title: Taxonomy (Intensity / Edits / Craft / Atelier)
type: data
updated: 2026-10-13
sources: [src/data/intensity.json, src/data/edits.json, src/data/craft-techniques.json, src/lib/data.ts (INTENSITY_LEVELS/EDITS/getIntensity), src/components/home/EditsGateway.tsx, audit.md 2026-10-13 entry]
links: ["[[catalog-spine]]", "[[universe-theming]]", "[[route-map]]"]
---

# Taxonomy (Intensity / Edits / Craft / Atelier)

Re-architecture landed 2026-10-13 (owner-approved 5-question contract; supersedes
the mood/vibe two-axis design below). Four facets, each with one job:

- **Universe** = front door / immersion. Portals on Home; **the Atelier is the
  neutral 4th door** (products with `universeSlug: null`).
- **Garment type** = utility filter (unchanged; categories.json untouched).
- **Intensity** = how loudly a piece wears its world. 3 stops in
  `intensity.json`: `quiet` / `balanced` / `loud`. Products without an explicit
  value read as `balanced` (`getIntensity()` in `lib/data.ts`). Filtered via
  `filters.intensity`; rendered on cards as a 3-segment meter + on PDP.
- **Craft technique** = provenance, NOT a browsing axis. `craftTechniques[]`
  (multi-select) on each product, registry in `craft-techniques.json` (9
  techniques, moved verbatim from the old `CRAFT_TECHNIQUES` literal). PDP
  chips link to the existing `/atelier/:technique` route.
- **Edits** = curated shoppable collections (buyer intent, formerly moods).
  Registry `edits.json`, 6 slugs — same strings as the old moods, so the
  Supabase `moods` column keeps working (presentation-only rename until the
  schema migration). EditsGateway on Home; footer links.

## What was removed

- `art-styles.json` conflated intensity (minimalist-line/bold-graphic) with
  technique (zardozi/crewel/kantha) — the root cause of the old IA feeling
  wrong. Never imported since 2026-10-11; delete at next cleanup.
- `vibes.json` duplicates the intensity axis; `[data-vibe]` CSS blocks retired.
  Vibe words survive only as free `tags`.
- `VibeGateway.tsx` / `MoodGateway.tsx` deleted; replaced by `EditsGateway.tsx`.

## Catalog facts (2026-10-13)

- `mock-products.json`: **13 SKUs / 121 variants** — animeverse 3, heroverse 3,
  itihaas 2, atelier 5; intensity 5 quiet / 4 balanced / 4 loud; every garment
  category covered; 15 low/out variants for state coverage.
- Category registry is `tops/knitwear/outerwear/bottoms/accessories` (the old
  `hoodies-sweats`/`tees`/`tees` slugs were orphan bugs, fixed in regeneration).
- Regeneration script pattern (validates registry slugs, image paths, SKU
  uniqueness, technique consistency before writing):
  `scripts/gen-mock-products.py` (in-repo, survives scratch pruning).

## Cross-links

- Facets flow through the single [[catalog-spine]].
- Universe theming unchanged (no more `[data-vibe]` scoping) — [[universe-theming]].
- `getProducts()` now guards `.eq('is_mock', true)` — the legacy-leak bug from
  [[is-mock-guard-gap]] is CLOSED (2026-10-13).

## Open items

- Supabase: add `intensity` / `craft_techniques` / `edits` columns + seed
  parity (feature-detect in the adapter already defaults `intensity` to
  `balanced` for pre-migration rows). docs/07 update pending.
- ~~Delete unreferenced vibes.json/moods.json~~ — **done 2026-10-13** ([data-vibe] CSS already retired).
- Visual verification round (chip contrast across universe themes, mobile)
  still pending.

## Changelog

- 2026-10-13 — rewritten: moods→edits promotion, intensity axis, craft
  externalization, Atelier door; is_mock guard closed.
- 2026-10-12 — created (mood/vibe version, now superseded).