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
| 2 | `2. Explore by Mood_ Fashion Collections.png` | `VibeGateway`, `MarketingHeader` (shared), `Cta` (TextLink) | display serif title (--text-display-lg), italic serif subtitle, serif caps card titles, serif counts + sans STYLES label, sans CTAs | borderless full-bleed cards, 16px radius, dual scrim, gold ring + lift + filled gold CTA on hover | **type+layout done** (mood photos blank until P5 shoots; counts live-computed) |
| 3 | `3. Worlds to Wear_ Three Embroidered Universes.png` | `UniversePortals` | serif title-case names in per-universe `portal_title_color` (crimson/gold/brown), caps sans taglines, serif lore body | editorial stack at top, count + gold `Enter →` CTA bottom-left, featured Heroverse (slug-keyed: ring, scale, tilt, lift), borderless side cards, cream section | **type+layout done** (artwork blank until P5 shoots; text polarity deferred with it) |
| 4 | `4. Stories Stitched by Hand.png` | `CraftStory`, `MarketingHeader` (subtitle measure) | gold serif step numerals + arrows, serif step titles/details, italic quote + tracked caps role, gold underlined link | macro photo full-bleed-left (square corners), 4-across step row, chrome-free quote strip, 3-up badge row w/ charcoal line-icons in beige circles | **type+layout done** (macro/step/artisan photos blank until P5 shoots) |
| 5 | `5. Embroidered Community Favourites.png` | `Bestsellers`, `BestsellerCard` | serif tabs w/ hairline dividers + gold active underline, serif info stack (name/meta/rating/price), % OFF chip | rounded cards w/ hairline ring → gold ring + lift on hover, dark rounded Bestseller ribbon, Quick-View purchase panel on hover, gold line-icon trust bar | **type+layout done** (product photos blank until P5 shoots) |
| 6 | `6. Worn Across Universes_ Stories in Stitching.png` | `UGCWall` | serif quotes on scrim, bold sans names + gold verified badge, gold outline stat icons | 4-col masonry (6 tiles, side tiles row-span-2), rounded borderless tiles, chrome-free rounded beige stats strip | **type+layout done** (customer photos blank + avatar omission logged; stats are SAMPLE until P5) |
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