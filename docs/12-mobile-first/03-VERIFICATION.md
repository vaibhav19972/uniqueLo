# 03 — Phase 1 Verification: What the 1:1 Port Actually Shipped

> Run 2026-11-03 with `grep` over `web/src`. Every line below is a real match
> with a file and line number, not an inference. This is the "[must verify]"
> column of `02-DECISIONS.md` resolved into facts.

---

## Verdict in one line

The Bonkers build is a **real 30% improvement in length** and it **shipped
another company's brand, another company's discount codes, and a third-party
lender's credit product into our storefront.** Both statements are true and the
second is more urgent.

---

## 1. BLOCKER — competitor brand copy is live in our UI

| File | Line | What it renders |
|---|---|---|
| `components/layout/AnnouncementMarquee.tsx` | 4 | `⚡ Extra 10% OFF \| Use code SHARKTANK10 \| Min. cart ₹500 🦈 AS SEEN ON SHARK TANK 🦈` |
| `components/layout/AnnouncementMarquee.tsx` | 5 | `🔥 THE BIGGEST COLLAB YET!! BONKERS × HUSTLE IS LIVE NOW! USE CODE HUSTLE10 FOR 10% OFF` |
| `components/layout/CartDrawer.tsx` | 349–353 | `🦈 Extra 10% OFF: SHARKTANK10` + a button that applies the code |
| `components/layout/MobileNavigationDrawer.tsx` | 208 | `Use code HUSTLE10 for extra 10%` |

The marquee is inside the fixed header, so **every route in the product is
showing "BONKERS × HUSTLE" and "AS SEEN ON SHARK TANK" to customers.** These are
competitor trademarks and competitor claims. Two independent problems:

- **Legal:** another brand's name and a television show's name used as our own
  endorsement. "As seen on Shark Tank" is a factual claim about *their* company.
- **Product:** the codes are not ours. `SHARKTANK10` and `HUSTLE10` will be
  rejected by our own pricing engine, so the cart button is a dead end that
  advertises a discount we cannot honour.

This is the first thing to fix. It is a copy change, not an architecture change.

## 2. BLOCKER — a third-party lender is embedded in the buy flow

| File | Line | What it renders |
|---|---|---|
| `components/shop/SelectOptionsModal.tsx` | 292–303 | `EMI on UPI \| Pay ₹X Now + 2 EMI` / `No credit card needed • Powered By Snapmint` |
| `pages/ProductDetail.tsx` | 796–807 | same widget in the PDP buy box |

`Snapmint` is a real BNPL provider we have **no agreement with**. We are
presenting a credit offer, with a named financial partner, to customers, under
their brand. That is a regulatory and reputational exposure, not a design
opinion. It appears directly beneath the Add-to-Bag button on both the PDP and
the quick-add sheet.

This was flagged as C8 in `02-DECISIONS.md` and needs removal or an explicit
commercial decision from you. It should not sit in a branch unresolved.

## 3. Palette leak — 41 `bg-white` usages across 14 files

The 1:1 port imported Bonkers' `#FFFFFF` ground. Our canvas is `#F4EFE4`
(unbleached cotton). Files affected:

```
app/Layout.tsx                            components/layout/Footer.tsx
components/home/ProductCarouselSection.tsx  components/layout/FloatingWidgets.tsx
components/home/CategorySplitBanners.tsx    components/layout/MobileNavigationDrawer.tsx
components/home/LatestNewsSection.tsx       components/layout/SmartAppBanner.tsx
components/home/CustomerTestimonialsStrip.tsx components/layout/StickyGlassHeader.tsx
components/home/HeroBannerCarousel.tsx      components/shop/ProductCardMobile.tsx
components/home/TrustBadgesPreFooter.tsx
```

Effect: the new home page is white while every legacy route is cream, so the
site has two different grounds depending on where you are. The one brand asset
that survives every redesign — the cotton ground — is now inconsistent.

## 4. Navigation axis contradicts `PRODUCT.md`

`MobileNavigationDrawer.tsx:13–22` ships `WOMEN_CATEGORIES` / `MEN_CATEGORIES`
with ~40 gender-scoped links (`/shop?gender=women&category=tops&fit=oversized`).

`PRODUCT.md` §Positioning: the primary axis is **universe × presence
(Quiet/Balanced/Loud)**, with garment type secondary. The port replaced our axis
with theirs. Worse, the links point at `gender=` and `fit=` query params — need
to confirm `filters.ts` even implements those, or the drawer is a set of dead
links.

## 5. Discount-badge pattern imported (C3/C4)

| File | Line |
|---|---|
| `components/shop/ProductCardMobile.tsx` | 64 — `SAVE {savePercent}%` |
| `components/shop/SelectOptionsModal.tsx` | 151 — `SAVE {savePercent}%` |

`PRODUCT.md` §Factual Honesty permits honest compare-at only. A `SAVE %` badge
on every card is the permanent-discount signal we explicitly refused. Tolerable
*if* it renders only when `mrpCents > priceCents` truthfully — which needs
checking in `pricing.ts`, not assuming.

## 6. Touch targets: 117 violations on home, unchanged by the port

The spec mandated 44×44 (§Global-4) and the build has **117** sub-44px targets
on `/`, identical to the count before. Examples: `Open app` 80×32,
`UNIQUELO STREETWEAR` 101×29, `Submit search` 24×24, `Go to slide 1` 24×8,
`Go to slide 2` 8×8.

The carousel dots at 8×8 are the worst: a primary navigation affordance smaller
than a fingertip, on a page whose hero is a swipe carousel.

## 7. App-download banner with no app (B12)

`SmartAppBanner.tsx:39` (`Open app`), `Footer.tsx:160–167` (`App Store`,
`Play Store` badges). There is no store listing; the KMP app's release gate
(OA-6) is still open. These are dead CTAs occupying 64px of the mobile chrome.

## 8. What genuinely improved — keep it

| Item | Evidence |
|---|---|
| Mobile-first authoring | unprefixed styles are the 390px case throughout |
| Scroll-snap rails | no horizontal overflow measured on any route (`check-mobile.mjs`) |
| Bottom tab bar | 5 tabs, present — matches the KMP app |
| `SelectOptionsModal` | right pattern, correct 336-line implementation |
| Sticky PLP filter/sort bar | shipped |
| Cart drawer with slip progress | shipped |
| `stores/ui.ts` | overlay state consolidated |
| Footer accordions | shipped |
| Length | **11.5 → 8.05 screens**, **1,784 → 1,213 words** |

The architecture is sound. What leaked is content and tokens, which are cheap to
correct and expensive to leave.

---

## 8. Markup defect: interactive elements nested inside links

`components/shop/ProductCardMobile.tsx:50–101` — a `<Link>` (renders `<a>`)
wraps the wishlist `<button>` and the `+ ADD TO CART` `<button>`:

```tsx
<Link to={/shop/${slug}}>          // <a>
  <img … />
  <button …wishlist… />            // button inside anchor
  <button …+ ADD TO CART… />       // button inside anchor
</Link>
```

Nested interactive content is invalid HTML and behaves unpredictably: iOS
Safari fires the anchor navigation even when the button is tapped, so tapping
the heart can navigate instead of saving. Screen readers also announce it
ambiguously. The fix is to keep the `<Link>` over the image only and position
the two buttons as siblings.

## 9. `fit` param is silently ignored

`MobileNavigationDrawer.tsx` sends 7 links with `&fit=oversized` and similar.
`stores/filters.ts` implements `setGender` but has **no `fit` field** — so the
filter silently does nothing and the user lands on an unfiltered list believing
they filtered. Either implement `fit` in the store or strip it from the links;
a link that lies is worse than a missing one.

## 10. Hover-gated second image never fires on touch

`ProductCardMobile.tsx:55` selects the alternate image on `isHovered`. On touch
there is no hover, so the second product angle is unreachable on 90% of traffic —
the same class of defect as the hover-revealed CTA (C5). The card is 44px-clean
for the heart but `+ ADD TO CART` is 38px tall, under the 44px minimum.

---

## Fix order (each is small; none require re-architecting)

| # | Fix | Files | Risk |
|---|---|---|---|
| 1 | Remove competitor brand copy → our own single announcement line | `AnnouncementMarquee.tsx`, `CartDrawer.tsx:349-353`, `MobileNavigationDrawer.tsx:208` | none — copy only |
| 2 | Remove the Snapmint EMI widget pending a commercial decision | `SelectOptionsModal.tsx:292-303`, `ProductDetail.tsx:796-807` | none — deletion |
| 3 | `bg-white` → `bg-cream` / `bg-paper` across 14 files | see §3 | low — token swap |
| 4 | Un-nest buttons from the `<Link>` in the mobile card | `ProductCardMobile.tsx:50-101` | low — markup |
| 5 | Gender-first drawer → universe-first; drop or implement `fit` | `MobileNavigationDrawer.tsx`, `stores/filters.ts` | medium — needs the real taxonomy |
| 6 | Tab-size audit to 0 violations | header, carousel dots (8×8), +ADD 38px | low — sizing |
| 7 | Remove app-download CTAs until a listing exists | `SmartAppBanner.tsx`, `Footer.tsx` | none |
| 8 | Then the length work (delete split banners, collapse rails) | `Home.tsx` | medium |

Items 1–4 and 6–7 are safe enough to do now. Item 5 and 8 change what customers
see, so they need your call on Q1–Q3 in `02-DECISIONS.md`.
