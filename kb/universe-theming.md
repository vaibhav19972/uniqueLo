---
title: Universe Theming & Unified Design System
type: mechanism
updated: 2026-10-19
sources: [src/app/Layout.tsx, src/config/theme.ts, src/styles/tokens.css, src/pages/Universe.tsx, docs/08-universe-build/04-universe-theming-system.md]
links: ["[[mood-vibe-taxonomy]]", "[[route-map]]", "[[catalog-spine]]"]
---

# Universe Theming & Unified Design System

## Theme Unification (The Atelier & Design System v2)

Per user directive, the website design system has been unified across the entire site including all universes. Disparate saturated dark backgrounds per universe have been superseded by a cohesive aesthetic:

- **v1 (The Atelier):** Quiet-luxury editorial house canvas (`#f7f5f0`), white paper surfaces (`#ffffff`), Playfair Display serif headings, hairline stone rules (`#e5e1d8`), and obsidian action buttons (`bg-ink text-cream`).
- **v2 (Modern D2C Streetwear & Gokwik Cart Bag):** Cool slate ground (`#f0f2f5`), pure white surfaces (`#ffffff`), neo-grotesque sans-serif typography (Satoshi/Inter), emerald savings green accents (`#059669`), and an interactive Gokwik-style Cart Bag drawer.

Global theme selection is controlled by `USE_THEME_V2` in `src/config/theme.ts`. `Layout.tsx` calls `useIsThemeV2()` which synchronizes `data-theme="v2" | "v1"` and `.theme-v2 | .theme-v1` onto `<html>`.

## Corner Radius Scope Rule
- **Cart Bag Only:** Rounded corners (`rounded-2xl`, `rounded-xl`, `rounded-full`) are strictly confined to the Cart Bag drawer (`CartDrawer.tsx` & `CartLineItem.tsx`).
- **Rest of Website:** Product cards, bestseller cards, hero banners, PDP, newsletter, and universe pages strictly preserve clean architectural square rectangles (`--radius-sm: 0.125rem`, `--radius-md: 0.25rem`).

## Universe Content Preservation

While chrome, layout framing, and surface styling are unified, universe identity remains preserved through:
- Curated editorial lore, kicking eyebrows, and custom headlines in `Universe.tsx`.
- Universe-specific embroidery motifs, character filters, and technique chips.
- Universe catalog capsules (Animeverse, Heroverse, Itihaas) curated in `src/data/mock-products.json`.

## Changelog
- 2026-10-19 — documented site-wide theme unification under The Atelier / v2 Modern D2C Streetwear (`USE_THEME_V2`), updated Layout wiring, and noted the Corner Radius Scope Rule.
- 2026-10-12 — created; initial check of earlier per-universe `[data-universe]` scoping.