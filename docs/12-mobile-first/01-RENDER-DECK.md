# 01 — Render Deck

> Eleven mobile screens at 390×844, generated with the Magpie image MCP
> (`codex/gpt-image-2`) as **design direction, not production assets**.
>
> Files: `web refs/mobile-renders/`
>
> **Provenance — read this before trusting the deck.** These were generated
> from a written spec, not from your reference screenshots. Your `web refs/`
> set is desktop (Bonkers mega-menu, 1920px hero captures); the mobile filter
> refs are a different brand's full-screen sheet. So the deck is my
> interpretation of your system applied to a mobile-first structure. It is a
> starting point to react to, not a spec to implement literally.

---

## Verification

Every render's text was read back with macOS Vision OCR
(`VNRecognizeTextRequest`, `usesLanguageCorrection = false`) rather than trusted
from the generator. Two defects were caught and regenerated:

| File | Defect found | Resolution |
|---|---|---|
| `04-plp-grid` (first pass) | garbled product name rendered as `pHdadeE` | re-prompted with "no overlay icons, no badges"; clean on pass 2 → `04-plp-grid-2.png` |
| `09-search` (first pass) | ruble sign `₽` instead of rupee `₹` | re-prompted with explicit "Indian rupee symbol throughout, never any other currency" → `09-search-2.png` |

Remaining OCR artefacts are glyph-level and benign: `·1,299` for `₹1,299`
(the rupee glyph reads as a middot at this resolution) and `3699` for `₹699`.

---

## The deck

| # | Screen | What it establishes |
|---|---|---|
| 01 | **Home, first viewport** | Image-first: 4:5 hero, one product line, one CTA, garment rail, 5-tab bar. No headline over the photo |
| 02 | **Menu drawer** | Five big destinations with counts, plus a terse utility block. No nested accordions |
| 03 | **Category sheet** | Two-pane browser: section rail left, garment grid right. This is how "category side menu" works on a 390px screen |
| 04 | **PLP** | 2-col grid, **one name + one price line per card**, sticky filter/sort, active filter chips |
| 05 | **Filter sheet** | Full-screen two-pane, checkbox lists with counts, live "SHOW 29 PIECES" |
| 06 | **PDP** | Full-bleed image, price row, **one** grey spec line, size pills, three collapsed accordions, single sticky Add-to-Bag |
| 07 | **Home, worlds section** | Full-bleed world bands, one sentence each, 5-tile mood rail |
| 08 | **Cart drawer** | Free-shipping bar, terse line items, single checkout CTA |
| 09 | **Search** | Recent / trending / results |
| 10 | **Checkout** | Three-step progress, UPI default, terse summary |

---

## What the deck decides, concretely

Where the deck and the Bonkers spec disagree, the deck follows the brief
("too much text", 90% mobile) and the spec follows its reference site.

| Decision | Deck | Bonkers spec |
|---|---|---|
| Hero | 4:5 plate, no text overlay, no dots | `calc(100dvh - 96px)`, text + scrim + dots |
| First product visible | inside screen 1 | 2.8 screens down |
| Product card text | name + price = 2 lines | 8 elements incl. badge, strike MRP, rating |
| Promo banners before products | none; a 5-tile garment rail | 3 × 4:5 blocks (1.7 screens) |
| Header | one 52px row | two rows + 64px app banner (192px) |
| Announcement | one static line | infinite marquee |
| Tab bar | 5 tabs | not specified |
| Corners | square throughout | pill buttons, rounded cards |
| Ground | cream `#F4EFE4` | white `#FFFFFF` |
| Price colour | madder `#A4322A` (5.97:1) | red `#D32F2F` (4.34:1 on cream) |

---

## Text-density budget the deck works to

| Screen | Words | Basis |
|---|---:|---|
| Home, first viewport | ~14 | one product name, one meta line, five category labels |
| PLP | ~10 per card | name + price + type |
| PDP above the fold | ~35 | name, price row, one spec line |
| PDP total | ~120 | three accordions collapsed |
| Cart drawer | ~25 per line item | name, size, price |

Compare with measurement: the current build's four product rails carry **844
words for 48 cards = ~18 words per card**, plus 1,439px of banners carrying 26
words. The deck's card is 2 lines.

---

## Honest limitations

1. **Not your references.** If you send mobile captures, these should be
   re-rendered to match rather than defended.
2. **AI renders are not specs.** Spacing is indicative; the numbers that govern
   the build are in `scripts/check-mobile.mjs` (budgets) and `tokens.css`
   (type scale, spacing scale).
3. **Photography is invented.** The models and garments are generated. Real
   products come from `products/` — `ivory-hoodie`, `white-tee` — and the
   catalogue in `src/data/mock-products.json`.
4. **The tab bar is a proposal**, not an existing pattern in this codebase. It
   was added because the KMP app in `mobile/` ships one; if you want the web to
   stay hamburger-only, that reverses a structural recommendation.
