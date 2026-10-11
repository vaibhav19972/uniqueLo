# 03 — Pick-and-Place for UniqueLo

> Decision log: **Adopt** (take as-is) · **Adapt** (re-voice to atelier luxury) ·
> **Reject** (deliberately not us) · Already-have (no work).
> All UI must obey `docs/02-design-system` (one accent/viewport, no emoji,
> 44px targets, tokens only) and `PRODUCT.md` (honest stock/reviews, no fake scarcity,
> no unlicensed IP).

## A. Adopt / adapt — worth inspiring, in priority order

### P0 — Conversion hygiene (small, high-trust)

1. **`Notify Me When Available` (back-in-stock capture)** — ADAPT
   - Theirs: text link under sizes → lead form.
   - Ours: on sold-out size pill, replace disabled state with `Join the dispatch`
     button → email/PIN capture → Supabase `restock_requests` → toast + "Edition
     restock" email. Honest copy: "Small batch — join the list, no spam."
   - Files: `ProductDetail.tsx` size picker, `QuickViewModal.tsx`, new `lib/restock.ts`.

2. **Inline return summary above accordions** — ADAPT
   - Theirs: "30-day, no questions asked" visible pre-ATC.
   - Ours: one quiet line under trust row: "14-day in-home inspection · archival
     gift box · doorstep exchange". (Keep our 14-day promise; don't inflate to 30.)
   - Files: `ProductDetail.tsx` trust block.

3. **Share affordance** — ADOPT (luxury-voiced)
   - Theirs: `Share` link. Ours: icon button → native `navigator.share` fallback
     copy-link + WhatsApp. No emoji, line-icon only.
   - Files: `ProductDetail.tsx` buy box, `ProductCard.tsx` (hover share? no — keep PDP-only).

4. **`Shop by Variant / Complete the Look` carousel** — ADAPT
   - Theirs: variant/look strip pre-size. Ours: extend existing `Frequently Stitched
     Together` + color-dot row into a "Worn as a set" strip (same-universe, 3 pieces,
     one-tap add-set). Universe-aware, not discount-led.
   - Files: `ProductDetail.tsx` recs section, `lib/data.ts` (set relation).

5. **Dual-unit size chart verification** — ADOPT
   - Verify `SizeGuideModal.tsx` shows India (38/40/42/44) + International (XS–XXXL)
     + inches/cm + garment-measured (not body-measured) note. Their chart does;
     ours must at least match.

### P1 — Trust & social proof (editorial-safe)

6. **Artisan attribution block ("Artist's Details" → "Hands Behind This Piece")** — ADAPT
   - Theirs: per-PDP artist credit. Ours: craft cluster + technique + artisan hours
     already exist — surface as a signed strip ("Embroidered in Lucknow · Aari ·
     14h · Cluster K-07") with link to `/atelier/technique/<slug>`. No fake names.
   - Files: `ProductDetail.tsx` motif band, `AtelierTechnique.tsx`.

7. **Empty/404 recovery rail** — ADOPT
   - Theirs: "You may also like" on NotFound/empty. Ours: `NotFound.tsx` + `Shop.tsx`
     empty state get 4-piece `ProductGrid` recovery ("Archival editions you may like").
   - Files: `NotFound.tsx`, `Shop.tsx`.

8. **Sticky buy bar on scroll** — ALREADY HAVE (verify)
   - `showStickyBar` exists in `ProductDetail.tsx`. Verify it carries price + size +
     Add CTA on mobile; theirs lacks this — our lead, keep it.

### P2 — Retention (membership/loyalty, luxury-safe)

9. **Collector Circle (their Membership, de-discounted)** — ADAPT, post-launch
   - Theirs: ₹149/3mo, ₹199/12mo → member prices + early access + free/priority shipping.
   - Ours must NOT do mass discount (kills luxury). Instead: **atelier membership** =
     early universe-drop access + free archival boxing + priority bespoke slots +
     atelier letters. Price-gated, invitation-feel. Requires backend (Supabase tier).
   - Do NOT build in P0. Dock as Phase proposal in file 04.

10. **Atelier tiers (their Soldier/Captain/General, de-gamified)** — ADAPT, post-launch
    - Theirs: 10/15/20% wallet-back + referral (friend 10% off, referrer 5%).
    - Ours: quiet ledger — "Patron / Connoisseur / Custodian" by lifetime embroidery
      hours collected, rewarded with monogram credits + restock priority, never %OFF
      stickers. Honest points (1 pt = ₹1 logic reusable), capped redemption.
    - Requires wallet tables; Phase proposal only.

11. **App-cashback banner → concierge nudge** — REJECT the banner, ADAPT the intent
    - No sticky "Download app 10% cashback" (violates one-accent + quiet luxury).
    - Instead: footer-level "Atelier concierge on WhatsApp" + post-purchase care note.
      Only if ops can staff it.

## B. Deliberately reject

| Their pattern | Why not us |
|---|---|
| Licensed fandom merch (Marvel/Disney/HP) | Legal constraint: original inspired-by only (`PRODUCT.md`) |
| Constant %OFF stickers, strike-through theatre | Luxury pricing = honest compare-at only; no fabricated urgency |
| Dense discount rails, pop-up app banners | Violates one-accent/viewport + motion restraint |
| Pun-heavy goofy microcopy site-wide | Our voice: short, declarative, brand-poetic ("Cut for movement") |
| 10-size run (XXS–XXXL) for every article | Our batches are small; honest per-variant stock + edition numbering instead |
| Generic "6M customers" counter | We earn trust per-piece: certificate, hours, cluster, verified reviews |

## C. Already-have — no action (regression guard)

Breadcrumbs · price+compare+tax+EMI · color/size pickers · stock-clamped qty ·
wishlist · pincode ETA · 5 accordions · detail strip · motif-story band ·
community strip · reviews + JSON-LD · related grid · trust row · quick view/add/bespoke.
Any redesign must not regress these.
