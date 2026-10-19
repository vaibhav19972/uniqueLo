---
title: Universe Theming
type: mechanism
updated: 2026-10-12
sources: [src/app/Layout.tsx, src/styles/universes.css, src/pages/Universe.tsx, docs/08-universe-build/04-universe-theming-system.md]
links: ["[[mood-vibe-taxonomy]]", "[[route-map]]", "[[catalog-spine]]"]
---

# Universe Theming

Whole-site theming passes universe identity down through CSS custom properties, not
per-component conditionals:

- `Layout.tsx` sets `data-universe="<slug>"` on `<html>` (from the route's universe
  slug) and cleans it up on unmount — verified in source lines 37–39.
- `src/styles/universes.css` scopes token remaps (surface, accent, on-gold, glow) to
  `[data-universe="…"]` selectors; components just read tokens and never branch on
  universe inside JSX.
- Checkout/account areas stay neutral **by construction** — an opt-in `data-u-zone`
  attribute (used by `Universe.tsx`, `BundleBand.tsx`, `universes.css`) scopes themed
  treatment where wanted, rather than theming leaking into commerce zones.

## Palette reality check (2026-10-12)

- Shell gold = champagne `#c2a878`, shell coal = `#111116`,
  `--brand-gold-deep: #7a6234`, `--on-gold: #141414` — matches audit.md's
  de-browning record.
- `text-on-gold` consumers: `Cta.tsx` (1 hit) + universe scoping; light-surface gold
  text should use `--color-gold-deep` instead — the contrast-sweep pass covered 14
  components. **Automated re-run of the §08 ≥4.5:1 gate is still pending** — that's
  the open item in [[audit-trail]].

## Mirror parity

`src/data/universes.json` ↔ `universes.css` are meant to stay in sync (colors on both
sides). The audit pass claimed parity was maintained; a re-check after every palette
edit is cheap and should be part of the T1.1 integrity test when written
(docs/10-testing).

## Changelog
- 2026-10-12 — created; verified `data-universe` wiring + gold token values in source.