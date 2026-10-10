# chatgpt-v2 — Render ↔ Code Parity Audit

> Working ledger for the serif-forward rework on `anti-gravity-design-rework`.
> Source of truth: `sketches/design-renders/chatgpt-v2/` (gitignored, local-only —
> the actual PNG filenames below supersede the README's older index names).
> Acceptance: visually indistinguishable at a glance at ~1440×900 desktop;
> mobile is a responsive interpretation. AI-render pseudo-text is matched as
> styling treatment, not reproduced verbatim.

| Render | Actual filename | Component(s) | Type pass | Layout pass | Status |
|---|---|---|---|---|---|
| 1 | `1. UniqueLo_ Wear the Universe.png` | `UniverseHero`, `Header`, `AnnouncementBar`, `TrustStrip` | serif everywhere, bold two-tone headline, tracked gold eyebrow, serif nav/CTAs | split hero, slash tabs, search pill, 3-up trust | **type+layout done** (hero emblem asset blank until P5 shoots) |
| 2 | `2. Explore by Mood_ Fashion Collections.png` | `VibeGateway` | serif panels + italic taglines, sans CTAs | hover-expanded card w/ gold ring + filled CTA | pending |
| 3 | `3. Worlds to Wear_ Three Embroidered Universes.png` | `UniversePortals` | — | 3 themed portal cards | pending |
| 4 | `4. Stories Stitched by Hand.png` | `CraftStory` | — | 4 steps, trust badges | pending |
| 5 | `5. Embroidered Community Favourites.png` | `Bestsellers` | — | quick-view hover, ₹ + compare-at, ribbons | pending |
| 6 | `6. Worn Across Universes_ Stories in Stitching.png` | `UGCWall` | — | masonry, quotes, verified badges | pending |
| 7 | `7. UniqueLo Atelier Newsletter & Footer.png` | `Newsletter`, `Footer` | — | newsletter panel, 4-col footer, payment icons | pending |
| 8.1 | `8.1 Animeverse_ Stitched Stories Collection.png` | `Universe.tsx` + `universes.css` | — | full-bleed theme | pending |
| 8.2 | `8.2 heroverse_ Stitched Stories Collection.png` | same skeleton | — | — | pending |
| 8.3 | `8.3 Itihaasverse_ Stitched Stories Collection.png` | same skeleton | — | arch frames, miniature borders | pending |
| 9 | `9. Sakura Ronin Hoodie Product Page.png` | `ProductDetail.tsx` | serif buy box, serif CTA | gallery + zoom, motif story, trust row, accordions | pending |

## Deviation log

| Date | Render | Deviation | Reason |
|---|---|---|---|
| 2026-10-11 | 1 | Bottom universe card carousel w/ "01" pagination deferred — content covered by render 3 (`UniversePortals`) | Avoid duplicating the portals section inside the hero |
| 2026-10-11 | all | Families swapped: Playfair Display (primary serif, functional + display), Satoshi (eyebrows/micro-labels only), Melodrama demoted to fallback | Renders are serif-forward; docs/02 §3 + §12.1 updated to match |
| 2026-10-11 | 1 | Announcement bar re-set as serif sentence-case 3-zone bar | Previous build was sans caps 2-zone |