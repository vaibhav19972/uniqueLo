# 05 — Myntra Teardown (structure & trust, not aesthetic)

> **Instrument: screenshots + walkthrough. No decompilation.**
> Myntra is studied for **PLP density, filter model, size guidance and trust
> surfaces** — the mechanics that convert at ₹500–3,000 in tier-2/3 India.
> Its visual language is explicitly **not** adopted (see 00 §4).
>
> Status: **skeleton — awaiting screenshots.** Nothing below is marked
> evidenced until a capture is filed in `assets/myntra/` and referenced.

## Why Myntra is the primary structural reference

| Reason | Consequence for UniqueLo |
|---|---|
| Largest apparel PLP in India; the filter model is a de-facto standard users already know | Do not invent filter vocabulary. Match it, then subtract. |
| Solves size uncertainty without a measuring tape | Directly transferable; our `fit`/`fabricGsm` fields already exist |
| Trust surfaces tuned for tier-2/3 first orders (COD, returns, delivery date) | Missing entirely from our current build |
| Price display conventions (MRP, % off, "Best Price") users parse instantly | We currently have no compare-at discipline |

## 1. PLP — what to capture

Capture at 390×844 (iPhone) and 360×800 (common Android), scrolled to at least
3 viewports deep so lazy-load and sticky behaviour are visible.

| # | Element | What to record | Our target |
|---|---|---|---|
| 1.1 | Grid columns | 2-up or 2.5-up? gutter width? | 2-up at ≥₹1,499; decide for entry tier |
| 1.2 | Card anatomy | image ratio, brand line, name lines, price row, rating row, badge | must fit price + rating + fit in one glance |
| 1.3 | Card height | px for a full card at 390w | sets scroll density |
| 1.4 | Filter entry | chips inline / bottom sheet / full page | bottom sheet is the mobile default |
| 1.5 | Active-filter display | count badge, removable chips, clear-all | required — we have `filters.ts` but no persistent chip row |
| 1.6 | Sort options | exact list and default | default matters more than the list |
| 1.7 | Infinite scroll vs pagination | which, and where the sentinel fires | infinite for catalog, paginate for search |
| 1.8 | Sticky header | does it shrink? filter bar pinned? | pinned filter bar after 1 viewport |

## 2. Size guidance — the highest-value transfer

Our `ProductScreen.kt` (757 lines) and `ProductDetail.tsx` have no size help.
Myntra's answer to "I don't have a tape measure" is the thing to copy.

| # | Element | What to record |
|---|---|---|
| 2.1 | Size chart entry point | where it sits relative to size pills |
| 2.2 | Chart format | body measurements vs. garment measurements? both? |
| 2.3 | "Fit finder" / recommendation | does it ask height/weight, or past purchases? |
| 2.4 | Size-wise stock display | are sold-out sizes shown disabled or hidden? |
| 2.5 | Model fit line | "Model is 5'9\", wearing M" — present? |
| 2.6 | Return-driven guidance | "runs small — consider one size up" surfaced? |

## 3. Trust surfaces (missing from our build today)

| # | Surface | Where it appears | Why it matters at tier-2/3 |
|---|---|---|---|
| 3.1 | COD availability | PDP, bag, checkout | #1 first-order blocker |
| 3.2 | Delivery date | PDP above the fold | "5–7 days" reads as a non-answer |
| 3.3 | Return window | PDP + footer + checkout | stated in days and conditions |
| 3.4 | Review count + rating | card and PDP | we have the fields, not the presentation |
| 3.5 | Exchange vs return | differentiated? | exchange-only is common in apparel |
| 3.6 | Support channel | WhatsApp vs email vs chat | WhatsApp is the India default |

## 4. Price display discipline

| # | Convention | What to record | Our rule |
|---|---|---|---|
| 4.1 | MRP + selling price | strike-through styling, order | explicit, both numbers |
| 4.2 | % off | computed or rounded? | computed from compare-at, never fabricated |
| 4.3 | Coupon vs. price | shown on card or only in bag? | bag only — cards stay honest |
| 4.4 | EMI line | present at our band? | likely no; confirm threshold |

## 5. What to reject outright

- **Visual density as a style.** Myntra is dense because it is a marketplace of
  many brands. We are one brand; density should come from information, not ads.
- **Sponsored/boosted slots.** No paid placement in a single-brand catalog.
- **Fake urgency** (countdowns, "only 2 left" without stock truth). `PRODUCT.md`
  forbids it.
- **Marquee/banner carousels** at the top of PDP.

## 6. Capture log

| File | Screen | Date | Notes |
|---|---|---|---|
| _(none yet)_ | | | |

## 7. Findings → build tasks

Nothing here is a task yet. Once captured, each adopted pattern becomes a row in
`03-pick-and-place-for-uniquelo.md` (Adopt / Adapt / Reject) and then a task in
`04-implementation-roadmap.md`, gated by `docs/README.md §4`.
