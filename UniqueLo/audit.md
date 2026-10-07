# UniqueLo — Project Audit

**Date:** 2026-10-07 · **Scope:** Full storefront (post Phase 6–8 work)
**Verified by:** `tsc -b` (0 errors) · `vite build` (passes) · `oxlint` (0 warnings, 0 errors, 47 files) · all 8 routes return 200 on dev server · data integrity scripts

---

## ✅ What's healthy

| Check | Result |
|---|---|
| TypeScript + production build | Pass, 0 errors |
| Lint | 0 warnings, 0 errors (47 files, 116 rules) |
| Routes (`/`, `/shop`, `/atelier`, `/atelier/:slug`, `/product/:slug`, `*` → NotFound) | All 200, NotFound exists and is wired |
| Product data integrity | 12 products, no duplicate SKUs, no variant price mismatches, no out-of-stock-without-quantity conflicts |
| Image assets | Every path referenced in `products.json` resolves on disk — zero broken images |
| Supabase seam | `supabase.ts` client, schema + RLS (incl. `newsletter_subscribers` with public-insert policy), seed SQL consistent with JSON values |
| Self-hosted fonts | Satoshi + Melodrama woff2 served locally, no Google Fonts requests |
| `bg-parchment` token | Exists in tokens + compiles (verified in dist CSS) |
| Size guide | Inches/cm toggle, India-first `S/38` dual labeling — matches plan |
| Pincode prefix map | Metro prefixes (110→Delhi, 400→Mumbai, 560→Bengaluru…) are accurate |

---

## 🐛 Bugs (ranked)

### BUG-1 · HIGH · Sashiko denim is mislabeled as Kantha
- **Where:** `src/data/products.json` (selvedge-sashiko-embroidered-denim → `embroidery.technique: "kantha-quilt"`) and the same row in `supabase/seed.sql`.
- **Effect:** The Japanese sashiko denim appears on the **Kantha (West Bengal)** Atelier page as a matching product — brand-incoherent. Meanwhile `/atelier/sashiko-selvedge` renders with **zero** linked products (the denim only matches via its `sashiko` *tag*, not the `sashiko-selvedge` technique slug).
- **Fix:** Change denim's `technique` to `"sashiko-selvedge"` (and its techniqueLabel already says "Japanese Traditional Sashiko Reinforcement") in **both** JSON and seed.sql.

### BUG-2 · HIGH · Newsletter forms silently discard emails
- **Where:** `src/components/home/Newsletter.tsx` and `src/components/layout/Footer.tsx` (and possibly others) — both `handleSubmit` handlers just `setSubscribed(true)` and clear the field. **Neither ever calls `subscribeNewsletter()`**, even though that function exists in `data.ts` with a working Supabase insert + RLS policy.
- **Effect:** Every visitor who subscribes through the home page or footer gets a "confirmed" message while their email is thrown away. Only `WelcomePopup.tsx` actually persists.
- **Fix:** Wire both forms to `subscribeNewsletter(email)` with loading/error states; keep local success state only after a successful call. Fallback path (no Supabase) already returns success — fine for dev.

### BUG-3 · HIGH · Fabricated scarcity/provenance fallbacks in UI
- **Where:**
  - `ProductCard.tsx:150` — `Ed. {batchNumber || 8}/{batchTotal || 50}`
  - `ProductDetail.tsx:310,875` — `Edition {batchNumber || 12} of {batchTotal || 50}` (inconsistent with the card's `8`)
  - `ProductDetail.tsx:349` — `{artisanHours || 14} Hours by Guild`
  - `ProductDetail.tsx:302-303` — hardcoded `4.9 ★` and `{reviews?.length || 24} collector reviews` — **a fake review count next to real reviews**; a product with 3 real reviews displays "(24 collector reviews)".
- **Effect:** The brand's core promise is *verifiable provenance*. Rendering invented edition numbers, hours, and review counts is worse than rendering nothing — and a PDP/card contradiction (8 vs 12) is visible on the same product.
- **Fix:** Render all four conditionally: no `batchNumber` → no edition line; no `artisanHours` → omit the cell; rating → compute from actual reviews or hide; review count → `reviews?.length ?? 0`, and if 0, hide the stars entirely.

### BUG-4 · MEDIUM · Cart ignores stock limits
- **Where:** `src/stores/cart.ts` — `updateQuantity` clamps only at 0 (≤0 removes), no max against variant `quantity`. `ProductDetail.handleAddToCart` doesn't check `currentVariant.status/quantity`, and out-of-stock variants are not visibly disabled in the size selector.
- **Effect:** A user can add 10× of a variant that has `quantity: 2`, or add an out-of-stock variant directly from the PDP. Checkout (when it arrives) would need clamping anyway; the UI should enforce it now.
- **Fix:** Pass variant max into cart actions or clamp in PDP/QV handlers; disable out-of-stock size chips with a "sold out" style; guard `handleAddToCart` with a toast.

### BUG-5 · MEDIUM · Four products carry placeholder provenance
- **Where:** `atelier-monogram-poplin-shirt`, `pleated-silk-zari-wool-trousers`, `heritage-flora-embroidered-silk-scarf`, `nocturne-velvet-crewel-vest` — all have `craftRegion: "India"`, `craftCluster: "Artisanal Needlework Guild"`, `fabricGsm: "280 GSM Premium Natural Textile"` (the last is copy-paste wrong on an 18mm silk twill scarf).
- **Effect:** Generic "India" next to "Lucknow, Uttar Pradesh" weakens the provenance system; wrong GSM on the scarf is factually incorrect.
- **Fix:** Either fill real values or remove the fields (UI must render conditionally per BUG-3 so absence is safe).

### BUG-6 · LOW · Title/meta still use the retired brand line
- **Where:** `index.html:9-12` — `title` = "UniqueLo — Haute Needlecraft & Digital Embroidery Atelier" and the old meta description. The site-wide voice update moved to "Hand-Embroidered Essentials. Made in India. Built to last." everywhere *except* the first thing Google and link previews show.
- **Also:** `<meta name="theme-color" content="#f6f4ef">` vs actual `--color-cream: #f7f5f0` in tokens — minor mismatch.
- **Fix:** Update title/description to the new positioning; sync theme-color.

### BUG-7 · LOW · Pincode widget promises COD/UPI for every pincode
- **Where:** `ProductDetail.tsx` `checkPincode` — any valid 6-digit PIN gets "Serviceable … Cash on Delivery / UPI Available".
- **Effect:** Acceptable as a UI stub (plan open question), but must not reach production without real serviceability data — promising COD and failing at checkout is a trust killer.
- **Fix:** Track as a launch blocker; gate the COD wording behind a data flag.

### BUG-8 · LOW · Accessibility gaps in interactive controls
- **Where:** `FilterBar.tsx` — 11 `<button>` elements, 0 `aria-label`s (icon-only color swatches, size chips). Similar icon-only buttons elsewhere (cart close, zoom loupe) have partial coverage.
- **Fix:** Add `aria-label` to every icon-only/swatch button; add `aria-pressed` to filter chips.

---

## 🔧 Improvements (not bugs)

1. **Technique filter in Shop** — the plan's Stream 3/4 task: filter products by craft technique in `FilterBar` (data already supports it via `embroidery.technique`). Atelier pages exist; the shop can't filter by craft yet.
2. **Techniques missing from taxonomy** — `hand-zardozi`, `metallic-zari`, `monogram-bespoke`, `french-knot` have no `CRAFT_TECHNIQUES` entry; the Zardozi atelier page only catches the coat via its *tag*. Either add taxonomy entries (renaming `hand-zardozi`→`zardozi` for consistency) or accept tag-based matching — but decide explicitly.
3. **`orders` table unused** — schema defines it, no code writes it. Expected (checkout is Phase 9+), but the `subscribeNewsletter` precedent (BUG-2) shows the pattern to avoid: schema without caller.
4. **Reviews schema markup** — PDP renders reviews; add `Review` JSON-LD for search engines (deferred item from the plan, keep tracked).
5. **Trailing newlines** missing in `data.ts`, `useCatalog.ts` (cosmetic; some toolchains complain).
6. **Mobile pass** — verify price + size + Add-to-Bag above the 390px fold on the PDP, and ≥44px touch targets in the size selector (plan's S5.4 bar; not yet verified).
7. **Lighthouse run** — hasn't been re-run since the PDP/Atelier additions; the plan's ≥98 perf target should be re-measured before calling Phase 6-8 done.

---

## 📋 Suggested fix order

1. BUG-1 (one-line data fix, brand coherence) 
2. BUG-2 (revenue-adjacent: losing real subscribers) 
3. BUG-3 + BUG-5 (render conditionally; fill/remove placeholder provenance) 
4. BUG-4 (stock clamps + disabled states) 
5. BUG-6, BUG-7, BUG-8 (copy/a11y hygiene) 
6. Improvements 1–2 (technique filter + taxonomy consistency) 
7. Improvements 6–7 (mobile + Lighthouse verification)

---

*All bugs above were reproduced or verified by direct inspection of code/data this session — not inferred. Build/lint/route checks all executed on the current working tree.*