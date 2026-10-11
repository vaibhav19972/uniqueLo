# 05 — Page Specs

> Each spec lists required sections + acceptance criteria. Copy/microcopy is illustrative; final copy locked during build, not here.
> Visual targets: `sketches/design-renders/chatgpt-v2/` (local-only, gitignored — see its README index; renders guide, specs decide).

## 05.1 Homepage `/` (neutral shell, themed portals)

1. Announcement bar (rotating, 1 visible): free-ship ₹29,050+ → live drop countdown → 14-day inspection.
2. Hero: split headline with rotating universe word, dual CTA (Shop the Universes / Our Craft), layered model + thread-sketch visual.
3. Vibe gateway: 4 panels (Aesthetic/Clean/Minimal/Expressive) with counts; sets `?vibe=` session-wide.
4. Universe portals: 3 full-theme cards (Animeverse/Heroverse/Itihaas) with emblem, lore line, Enter cue; hover lift.
5. Craft strip: macro photo + 4 numbered steps + artisan signature + trust badges.
6. Bestsellers: 4 cards (image, wishlist, technique tag, name, ₹ + compare-at, stars, universe ribbon; one hover quick-view state).
7. UGC wall: 6-photo masonry + quotes + verified badges; hashtag CTA.
8. Newsletter + footer (§02).
- Accept: all CTAs resolve; portals deep-link themed first-paint; Lighthouse ≥ 90.

## 05.2 Universe landing `/universes/:universe` (fully themed)

1. Universe hero: emblem, lore line (from `universes.lore`), CTA to grid, drop countdown if `drops.is_live`.
2. Lore strip: 3 motif cards (from `motifs` where `ip_cleared`) — symbol, meaning, "shop this motif" link.
3. Filterable grid: shared grid component; facets per §02; vibe toggle visible.
4. Bundle row: "Complete the look" (2–3 real in-stock products, real prices, one add-all).
5. UGC slice filtered to universe.
- Accept: skeleton identical across universes (only tokens/lore differ); empty-filter state themed; shareable filter URLs.

## 05.3 PDP `/product/:slug` (clean base, themed accents)

1. Gallery: slots 0–5 (§07); slot 3 (macro) with zoom; thumbnails labelled; alt text from DB.
2. Buy panel (always clean): universe tag, name, ₹ price (+compare-at, +EMI hint), artisan-hours line, size selector + guide, pincode checker, Add to Bag + wishlist, trust row (COD/UPI/14-day).
3. Accordions: craft & technique · fabric & provenance · fit · care · shipping.
4. Motif story block (aesthetic): renders `motifs.meaning` + symbol art; links to universe.
5. Reviews (verified) + related products (same universe, in-stock).
6. JSON-LD Product (INR, absolute image URLs, availability from variant status).
- Accept: OOS variants unselectable with waitlist note; qty clamped to stock; no fake strikethrough.

## 05.4 Shop `/shop`, Atelier `/atelier`, Journal `/journal`

- Shop: neutral grid + full facets + universe facet column.
- Atelier: craft narrative, artisan profiles, technique glossary (9 techniques, macro imagery).
- Journal: drop announcements, lore essays, care guides; per-article universe tag.

## 05.5 Overlays: bag, checkout, confirmation

- Bag drawer: free-ship progress bar (toward ₹29,050), gift progress (₹49,800), coupon input, upsells from real catalog (in-stock, not-in-bag, stock-capped).
- Checkout: neutral; name/email/address validation with visible errors; UPI/card/COD; order writes `orders` + `order_items` with snapshots.
- Confirmation: order id, ETA, payment state explanation (COD: pay on delivery).

## Decisions locked

1. One grid component for shop + universe; one PDP for all universes.
2. Macro slot + motif story are mandatory on PDP, not optional.
3. Upsells/bundles reference real catalog rows only.
