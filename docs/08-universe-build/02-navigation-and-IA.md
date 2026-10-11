# 02 — Navigation & Information Architecture

> Visual targets: `sketches/design-renders/chatgpt-v2/` files `01` (header/announcement/hero) + `07` (footer) — local-only, gitignored.

## Route table (locked)

| Route | Template | Universe-themed? |
| :--- | :--- | :--- |
| `/` | Homepage (§05.1) | Neutral atelier shell; universe portals carry theme |
| `/men` | Gender landing (shared grid, gender preset) | Neutral; universe shown as facet + card tags |
| `/women` | Gender landing (shared grid, gender preset) | Neutral; universe shown as facet + card tags |
| `/universes/:universe` | Category landing (§05.2) | **Fully themed** — bg, dividers, cards, filters |
| `/shop` | All-products grid (filterable) | Neutral; universe shown as facet + card tags |
| `/product/:slug` | PDP (§05.3) | Themed accents (tags, lore block) on neutral base |
| `/atelier` | Craft story | Neutral atelier |
| `/journal` | Articles / drops log *(planned — P9.5, no route in code yet)* | Neutral; per-article universe tag |
| `/bag` | Cart drawer (overlay, no route change) | Inherits current page theme |
| `/checkout` | Checkout (modal or page) *(planned — no route in code yet)* | **Always neutral** — trust over theme |
| `/account/orders/:id` | Order confirmation *(planned — no route in code yet)* | Neutral |
| `/admin` | Admin (local-only, lazy) | Unthemed |

## Global nav (desktop + mobile)

1. **Announcement bar** (1 line, rotating): free-ship threshold → live drop countdown → inspection policy. Never more than one message visible.
2. **Header**: logo left · Universes dropdown (N universes + "All", rendered from data — never hardcoded) · **Men · Women** · New Arrivals (`/shop?sort=newest`) · Our Craft · search icon · wishlist · bag with count. Sticky, shrinks on scroll. Men/Women resolve to `/men`, `/women`: the shared grid with gender preset (`unisex` included in both).
3. **Universe switcher**: entering a universe sets `universe` in route + store. Theme tokens swap; layout skeleton identical. A persistent "Exit universe ✕" chip returns to neutral. Deep links (`/universes/heroverse`) must render themed on first paint (no flash of neutral).
4. **Breadcrumbs**: Atelier / [Universe] / [Garment facet] / Product name. Universe crumb present only inside a universe.
5. **Footer** (4 cols): Universes · Craft · Care (shipping/returns/size) · Company + newsletter + payment icons (UPI/Visa/MC/COD) + GI-craft note.

## Filtering model (shop + universe grids)

- Facets: vibe (4) · universe (3, hidden inside a universe page) · garment type · technique (9) · size · price bands · availability.
- Filters are URL-synced (`?vibe=minimal&technique=hand-zardozi`) so filtered views are shareable.
- Empty state: themed illustration + "No pieces in this thread — clear filters" + one-click reset. Never a blank grid.

## Search

- Searches name, motif story, technique label, universe lore. Results grouped by universe with themed group headers. Minimum 2 characters; debounced.

## Decisions locked

1. Checkout and order confirmation are always neutral.
2. Universe state lives in the route; theme applies on first paint.
3. One grid component serves `/shop` and `/universes/:universe`; only tokens + lore strips differ.
4. All filters URL-synced; designed empty states everywhere.
