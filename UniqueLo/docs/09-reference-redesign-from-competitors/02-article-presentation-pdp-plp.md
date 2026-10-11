# 02 — Article Presentation Analysis (PLP → PDP)

> "Article" = one garment (tee, hoodie, shirt, sweatshirt, pullover, top, skirt, bottom).
> Example PDPs: Supima Nude Pink Drop-Cut T-shirt; Supima Regal Wine Tee.

## PLP card (listing)

```
[model photo, clean background]
Looney Tunes: Heavenly Rebel — Oversized T-Shirts
₹1,299 · MRP incl. of all taxes
```

- One image, name + category, price + tax note. No hover zoom, no craft meta.
- Sorting + filter drawer with Apply/Clear; count implied by rails.
- **Gap vs UniqueLo:** our `ProductCard.tsx` already exceeds this —
  silhouette → macro-stitch hover swap, technique badge, wishlist heart,
  Quick View / Quick Add / Bespoke flyout, color dots, `Ed. n/N`, artisan hours.
  Keep ours; steal only their **tax-inclusive line** (we have it) and
  **404 recovery rail** ("You may also like" — we lack this on empty/error states).

## PDP anatomy (top → bottom)

| # | Block (theirs) | Notes | UniqueLo today (`ProductDetail.tsx`) |
|---|---|---|---|
| 1 | Breadcrumb: Home / Category / Brand / Name | SEO + orientation | ✅ Same, plus universe crumb |
| 2 | Title + category (`Supima: Nude Pink / Supima Drop Cut T-Shirts`) | Keyword-stuffed for SEO | ✅ Cleaner: name + serif subtitle + universe tag |
| 3 | Price row: `₹499 ~~₹999~~ ₹500 OFF` + "Price incl. of all taxes" | Discount is the hero | ✅ Price + compare-at + %OFF + tax line + EMI line |
| 4 | `Shop by Variant/Look ›` carousel | Cross-sell *before* size selection | ⚠️ Partial: color dots only; no look-carousel |
| 5 | Size selector (XS–XXXL pills) + `Size Chart` link | Chart modal: inches + cm | ✅ Same + India/international labels (38/S…) |
| 6 | `Size not available? Notify Me When Available` | Back-in-stock lead capture | ❌ **Missing — adopt** |
| 7 | Quantity stepper 01–10 | Stock-clamped? unclear | ✅ Stock-clamped + toast |
| 8 | `ADD TO CART` + `WISHLIST` + `Share` | Equal-weight CTAs | ✅ Add to Bag + heart + (share via JSON-LD only — no UI) |
| 9 | `Delivery Details [PIN] [CHECK]` | Serviceability pre-commit | ✅ Pincode ETA + city map |
| 10 | `Return Policy` summary inline | "30-day, no questions asked" | ✅ Accordion #5 but buried — consider inline summary |
| 11 | Accordions: Product Details / Material & Care / Mfg & Sold By / Description / Artist's Details | Legal + creator credit | ✅ Richer 5 accordions (Needlecraft, Textile, Fit, Care, Dispatch) |
| 12 | Size Chart modal (table) | Inches + cm toggle | ✅ `SizeGuideModal` exists — verify dual-unit |
| 13 | `You may also like` rail | 3–4 cards, price-led | ✅ `Frequently Stitched Together` (3 cards) |
| 14 | Reviews | Rating summary implied; review cards on some PDPs | ✅ Stronger: aggregate + verified + write-a-review modal + JSON-LD |
| 15 | Footer trust: 6M customers · COD · 30-day · secure · shippers | Repeated, logo-badged | ✅ Trust row + delivery block, quieter voice |

## Presentation style observations

- **Photography:** flat model + ghost-mannequin, consistent light background, variant
  thumbnails. No macro/craft detail — speed over tactility.
- **Copy:** short, SEO-titled, pun-heavy description; material = 2 lines
  ("100% Supima Cotton, Machine Wash, Country of Origin: India (and proud)").
- **Badges:** discount % is the only on-image badge. No provenance, no hours, no edition.
- **Social proof:** "6M Happy Customers" site-wide > per-product reviews. Membership
  testimonials carry the persuasion load.

## What this means for UniqueLo

We already **out-present** them on single-article craft storytelling (macro loupe,
hours pill, motif-story band, detail strip, community strip). Their edge is
**risk removal + retention plumbing** around the article: notify-me, share,
variant/look carousel, inline return summary, member-price teaser, artist wallet.
File 03 turns exactly those into luxury-safe adaptations.
