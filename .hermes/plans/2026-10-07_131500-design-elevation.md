# UniqueLo Design Elevation Plan

**Goal:** Move the storefront from "correct tokens, uniform template rhythm" to "art-directed editorial brand" (Bode / SSENSE / Bottega benchmark from STAR_GOAL.md) — through composition and typography, not new colors or components.

**Context:** Design system foundation is solid (`tokens.css`, anti-generic rules §12, real fonts now self-hosted). The uniformity problem is structural: every section uses the same `[11px accent eyebrow] → [serif h2] → [muted small p]` header pattern, ✦ appears 6+ times as decoration, accent appears in every section header (violating the one-accent-moment budget in spirit), and layouts inside sections are consistently boxy grids even where editorial asymmetry is the brand direction.

**Constraint:** No new palette, no new fonts, no shadow additions. Tokens stay untouched. All §12 anti-generic rules are the review bar.

**Tech Stack:** Existing — React 19, Tailwind v4 token utilities, GSAP ScrollTrigger, Motion v12. Nothing new to install.

---

## Current-state findings (from code audit, 2026-10-07)

| # | Finding | Where | Severity |
|---|---------|-------|----------|
| 1 | No product detail page — `/product/:slug` route absent | `src/app/routes.tsx` | **Structural gap** |
| 2 | Identical section-header pattern on all 5 home sections | Hero/CategoryStrip/Featured/Editorial/Newsletter | High — template feel |
| 3 | Hero is centered + symmetric (§12.3 wants type-led asymmetry) | `Hero.tsx` | High |
| 4 | CategoryStrip = 5 equal cards in a row (the exact anti-pattern §12.3 names) | `CategoryStrip.tsx` | High |
| 5 | ✦ used 6+ places: eyebrows, empty states, badges, newsletter confirmation | multiple | Medium — decorative tic |
| 6 | Accent in every eyebrow + tab underline + CTAs = accent everywhere | multiple | Medium |
| 7 | Newsletter is a small centered box; page lacks a closing statement | `Newsletter.tsx` | Medium |
| 8 | Lookbook is a state-based carousel; featured pin is the page's one signature interaction (correct) — carousel lacks editorial framing | `Lookbook.tsx` | Low |
| 9 | All imagery = tonal placeholders (tracked in docs/06) — composition plan must look intentional with placeholders | site-wide | Context |

---

## Phase A — Typographic rhythm system (foundation, no visual risk)

### Task A1 — Section header archetypes
Replace the single header pattern with 3 editorial archetypes (build one `SectionHeader` primitive with variants in `src/components/ui/SectionHeader.tsx`):
- **variant="index"** — oversized numeral `01` (Melodrama, ~7rem, ink-muted) + small caps title + hairline. Used by CategoryStrip, FeaturedProducts.
- **variant="statement"** — no eyebrow; oversized Melodrama statement as the header itself (clamp 3–5.5rem). Used by EditorialSplit, Newsletter.
- **variant="rule"** — left small-caps title + right-aligned secondary text on a hairline (quiet, for shop toolbar).

**Files:** Create `src/components/ui/SectionHeader.tsx`; modify all five home components to consume it.
**Verify:** `npm run build`; visual check — no two adjacent sections share a variant.

### Task A2 — Accent budget per page
Define and enforce: Home page accent = hero primary CTA + active category underline **only**. Section eyebrows become `text-ink-muted`. Shop accent = active tab underline + Clear-filters link.
**Files:** `Hero.tsx`, `CategoryStrip.tsx`, `FeaturedProducts.tsx`, `EditorialSplit.tsx`, `Newsletter.tsx` (eyebrow color swaps only).

### Task A3 — Retire the ✦ tic
✦ remains only in: cart empty state + newsletter success (two "quiet moment" contexts). Remove from eyebrows and the Featured badge row.
**Files:** `FeaturedProducts.tsx`, `EditorialSplit.tsx`, `CategoryStrip.tsx` headers.

---

## Phase B — Home page recomposition

### Task B1 — Hero: asymmetric type-led composition
- Left-align: oversized Melodrama headline (clamp ~5.5–8rem) overlapping the full-bleed image edge, offset above the fold line. Move eyebrow text above headline as plain small caps (ink-cream, no accent).
- Dual CTA row stays, but primary CTA becomes ink-on-cream (accent stays reserved); secondary remains ghost.
- Micro-credential grid: rotate to a vertical hairline rail pinned to the right edge (desktop only, stacks on mobile).
- Keep: GSAP intro timeline, `prefers-reduced-motion` guard, brightness overlay.
**Files:** `src/components/home/Hero.tsx`.
**Verify:** build; screenshot desktop + 390px mobile; contrast check on cream-over-image text.

### Task B2 — CategoryStrip → editorial index (the Bode move)
Replace 5 equal cards with a **numbered index list**: each category = full-width row (hairline-divided): `01 — Outerwear` (Melodrama, large) + description + count of pieces. On hover, reveal a floating category image that follows the cursor (desktop only; mobile keeps current horizontal image strip as a fallback view).
- Data: existing `getCategories()` through `useCategories()` (already migrated).
- Piece counts: derive client-side from `useProducts()`.
**Files:** Rewrite `src/components/home/CategoryStrip.tsx`; cursor-follow image uses existing `Image` primitive + Motion spring.
**Verify:** build; hover interaction manual test; `prefers-reduced-motion` → static rows.

### Task B3 — EditorialSplit: stagger + pull-quote
- Offset the two image frames further (top frame bleeds right, secondary frame overlaps bottom-left with 2-col offset) — frames keep hairlines, no shadows (already fixed).
- Insert an oversized Melodrama pull-quote ("*The needle creates a relief that printed ink can never simulate.*") between imagery and narrative copy — sourced from Lookbook quote convention; give it ~3rem scale.
**Files:** `src/components/home/EditorialSplit.tsx`.

### Task B4 — Lookbook: editorial framing (keep carousel)
Keep interaction model (one signature scroll interaction lives in FeaturedProducts). Add Volume numerals as oversized ghost numerals behind content, tighten quote typography (Melodrama italic is available via variable axis), add progress hairline as film-strip indicator.
**Files:** `src/components/home/Lookbook.tsx`.

### Task B5 — Newsletter → closing statement block
Full-bleed `bg-ink` section: oversized Melodrama statement ("Every thread, accounted for."), one-line invite, inline underline-style email input (transparent, cream text, accent focus ring) — no boxed input. This gives Home its dark closing chord and the one full-bleed color inversion per the section-rhythm alternation rule.
**Files:** `src/components/home/Newsletter.tsx`; footer link color adjustments inside this file only.

---

## Phase C — Product detail page (the missing surface — largest effort)

### Task C1 — Route + scaffold
`/product/:slug` in `src/app/routes.tsx`; new `src/pages/ProductPage.tsx` reading `getProduct(slug)` via TanStack Query hook (`useProduct` — add to `src/hooks/useCatalog.ts` with `catalogKeys.product(slug)`).

### Task C2 — PDP composition (two-column editorial, per STAR_GOAL Pillar 1)
- **Left (sticky):** image stack — silhouette + macro detail pair using existing hover-swap interaction; thumbnail rail.
- **Right:** small-caps category link (not accent) → Melodrama title → price (cents-safe via `formatPrice`) → variant selector (color swatch + size from `getSizesForColor`) → stock status derived from `quantity` (in/low/out styling per status colors already in tokens) → Add to Bag + Bespoke entry (`openCustomizer`) → embroidery provenance panel (technique label, artisan hours, thread composition, motif story) → material/care/fit accordion (hairline rows).
- Breadcrumb: Atelier / Collections / {Category}.
**Files:** `src/pages/ProductPage.tsx` + `src/components/product/*` (VariantSelector, ProvenancePanel, SpecAccordion, ImageStack).
**Verify:** build; deep-link to slug from ProductCard + FeaturedProducts cards (make cards link through — currently `Link to="/shop"` placeholder in FeaturedProducts line 144); empty-slug → redirect to shop.

### Task C3 — Card → PDP linkage
`ProductCard.tsx` and `FeaturedProducts.tsx` cards wrap image+title in `Link to={`/product/${slug}`}`; Quick-Add stays on the flyout button (no navigation).

---

## Phase D — Shop page + polish

### Task D1 — Shop grid rhythm
Every 8 cards, insert a full-width editorial interlude row (technique story band: hairline top, oversized numeral, one-line craft fact — data from embroidery fields, no new copy engine). Breaks the "infinite uniform grid" signal.
**Files:** `src/components/shop/ProductGrid.tsx`.

### Task D2 — Footer rebuild
Columnar editorial footer: oversized UNIQUELO wordmark (Melodrama, ~7rem, ink-muted), then columns (Shop / Atelier / Care / Legal) in small caps, hairline-topped. Contact + a single quiet ✦.
**Files:** `src/components/layout/Footer.tsx`.

### Task D3 — 404
Minimal: oversized Melodrama "Lost thread." + link home. Route `*` currently renders Home — replace.
**Files:** `src/pages/NotFound.tsx`, `src/app/routes.tsx`.

### Task D4 — Full verification pass
- `npm run build` + `npm run lint` after every task (commit per task).
- Screenshots (desktop 1440 / mobile 390) of Home, Shop, PDP before/after each phase; check against §12 rules as a checklist.
- `prefers-reduced-motion` audit on new B2 hover-follow + PDP interactions.
- Lighthouse run (target: keep ≥98 perf; A11y ≥95).

---

## Recommended execution order
A (foundation) → B1 → B2 (highest visible lift) → B3–B5 → C1–C3 (PDP) → D.

Phases A+B ≈ one working session (~10 tasks, low risk, all in existing components). Phase C is the big rock — PDP is ~8 files but is the most valuable commerce surface and unlocks the customizer UX. Phase D is polish.

## Risks / tradeoffs
- **B2 hover-follow image** is the most complex interaction on the site — mitigated by gating to desktop hover-capable devices and a static fallback.
- **PDP scope** could expand (reviews, related products, size guide) — deliberately deferred; C2 defines the v1 surface only.
- **Placeholders everywhere:** the recomposed editorial layouts (index rows, pull-quotes, oversized numerals) are chosen because they look intentional with tonal blocks — typography carries the design until photography arrives.
- Every task keeps the one-signature-scroll-interaction rule and accent budget intact — the plan adds *restraint discipline*, not more effects.

## Open questions (answer before/at execution start)
1. Include Phase C (PDP) in this design pass, or storefront-recompose only first?
2. Dark full-bleed closing section (B5) — does the ink inversion fit the brand mood, or keep everything cream?
3. ✦ retention policy — keep the two quiet-moment uses, or remove it from the UI entirely?