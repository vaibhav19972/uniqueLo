---
title: Mood & Vibe Taxonomy
type: data
updated: 2026-10-12
sources: [src/data/vibes.json, src/data/moods.json, src/lib/data.ts (VIBES/Vibe), src/components/home/MoodGateway.tsx, src/components/home/VibeGateway.tsx, docs/08-universe-build/01-vision-and-scope.md]
links: ["[[catalog-spine]]", "[[universe-theming]]", "[[route-map]]"]
---

# Mood & Vibe Taxonomy

Two-axis discovery, landed 2026-10-11 (`a5d7e6e`, `a42ccd4`):

- **Vibes** = aesthetic axis. Registry in `vibes.json`, 7 at launch:
  `aesthetic, clean, minimal, expressive, noir, pearl, gilded` (verified 2026-10-12).
  Extensible by design — fixed-4 was overturned by the 2026-10-11 audit pass.
- **Moods** = buyer-intent axis. Registry in `moods.json`, 6 families:
  `everyday, statement, heritage, festive-gifting, comfort, collector` (verified
  2026-10-12).
- Backfill: all 14 mock SKUs carry 1–3 moods each (verified 2026-10-12, 14/14).
- Gateways: `VibeGateway.tsx` ("Explore by Style", featured 4 + "More styles" drawer),
  `MoodGateway.tsx` ("Explore by Mood", counts computed from products).
- Faceting: `stores/filters.ts` + `filterProducts()` handle both axes; vibe imagery
  per-slug (`vibe/` section under `assets/`).

## Cross-links

- Renders inside the universe shell — see [[universe-theming]].
- Faceted data comes from the single [[catalog-spine]].

## Open items

- Gateway imagery: vibe covers were added (`a42ccd4`); mood imagery still reuses
  category placeholders until the P5 campaign shoot.

## Changelog
- 2026-10-12 — created from source + audit; registry contents re-verified from JSON.