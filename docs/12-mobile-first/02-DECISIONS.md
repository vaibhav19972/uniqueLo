# 02 — Decisions: Adopt / Adapt / Refuse

> Verdict on the Bonkers-derived mobile spec. Each row is a decision, not a
> summary. Evidence and measurements live in `00-AUDIT-AND-VERDICT.md`.
>
> **Status note (2026-11-03):** commit `51e5486` on branch `bonkers` already
> implemented much of this spec 1:1 — see `00` §1 state B. It took home from
> 11.5 screens / 1,784 words to **8.05 screens / 1,213 words**. That is a real
> gain and the base to build on. The rows below marked **[SHIPPED]** are done;
> **[REGRESSION]** marks what that build brought in that must now come out.
>
> Rule inherited from `docs/09`: study competitors for **mechanics**, never for
> **aesthetic**. Every adoption below is re-voiced into UniqueLo's own register.

---

## A. ADOPT AS-IS (mechanically correct, no brand cost)

| # | Pattern | Spec ref | Status | Why |
|---|---|---|---|---|
| A1 | Mobile-first authoring: unprefixed styles are the 390px case | Global 2 | **[SHIPPED]** | Correct and cheap |
| A2 | `overflow-x: hidden`; rails use `scroll-snap-type: x mandatory` + `no-scrollbar` | Global 3 | **[SHIPPED]** | No horizontal overflow measured on any route — verified |
| A3 | 44×44 minimum hit area, enforced by script | Global 4 | **NOT DONE** — 117 violations on home | Non-negotiable. The spec mandated it and the build did not deliver it |
| A4 | Persistent PDP bottom bar with Add-to-Bag | §5.2 | **[SHIPPED]** | Highest-value item in the spec |
| A5 | Sticky PLP filter/sort bar | §5.1 | **[SHIPPED]** | Standard mobile expectation |
| A6 | Quick-view `SelectOptionsModal` bottom sheet | §4.1 | **[SHIPPED]** | Right pattern |
| A7 | Cart footer: coupon chip + slip progress + single CTA | §5.3 | **[SHIPPED]** | Keep |
| A8 | Footer accordions on mobile | §6.2 | **[SHIPPED]** | Cuts footer height |
| A9 | `useUIStore` for overlay state | §1.3 | **[SHIPPED]** `stores/ui.ts` | Correct consolidation |
| A10 | Size chart modal with inches/cm | §5.2 | pending | `SizeGuideModal.tsx` exists — wire it in |

## B. ADAPT (right mechanic, our expression)

| # | Pattern | Spec says | We do | Status |
|---|---|---|---|---|
| B1 | Bottom navigation | (not in spec) | 5 tabs: Home / Shop / Save / Account / Bag | **[SHIPPED]** — matches the KMP app |
| B2 | Home vertical budget | ~10.9 screens | **≤4 screens, ≤350 words** | **8.05 — 2× over** |
| B3 | Product card | image + SAVE% badge + hover image + ADD TO CART overlay + uppercase title + strike MRP + red price + rating | image + name (1 line) + price (1 line) + garment type. 44px heart. No badge stack | partially — `ProductCardMobile.tsx` exists; 844 words across 4 rails says the payload is still heavy |
| B4 | Colour tokens | `#FFF` ground, `#D32F2F`, `#888`/`#999` muted | cream `#F4EFE4`, ink `#141A2E`, madder `#A4322A`, muted `#5F5747` | **must verify `bg-white` did not leak in** — the build's root is `bg-white` |
| B5 | Hero | `calc(100dvh - 96px)` | 4:5 plate, no text overlay, one line beneath | **[REGRESSION]** — 758px hero, first product at 2,402px |
| B6 | Category split banners | 3 × `aspect-[4/5]` before products | **Delete.** One 5-tile garment rail | **[REGRESSION]** — 1,439px for 26 words |
| B7 | Announcement | 32px infinite marquee, 3 promo codes | 1 static 26px line, dismissible | **[REGRESSION]** — marquee shipped |
| B8 | Header | Two rows (52+44) + 64px app banner | One 52px row; search on demand; hides on scroll | **[REGRESSION]** — 192px of chrome |
| B9 | Navigation axis | WOMEN / MEN / ACCESSORIES | Worlds / Garments / Edits / Presence / Craft | **[REGRESSION]** — gender-first shipped, contradicts `PRODUCT.md` |
| B10 | Filter sheet | Full-screen two-pane | Same structure, restyled square | **[SHIPPED]** |
| B11 | Trust strip | Paragraphs at footer | 4 terse items, hairline, near the buy decision | partially — 326px / 59 words, acceptable |
| B12 | App-download banner + QR | 64px banner + floating QR + desktop QR | **Defer** — no app store listing exists | **[REGRESSION]** — shipped anyway; advertises a dead end |

## C. REFUSE

| # | Pattern | Status | Why |
|---|---|---|---|
| C1 | Licensed-IP taxonomy (Marvel, Disney, Harry Potter, SpongeBob…) | **must verify none leaked in** | `PRODUCT.md` §Capabilities: original inspired-by only. Legal constraint |
| C2 | Bonkers promo codes / "As seen on Shark Tank" | **must verify** | Not our offers, not our claims |
| C3 | Red sale price + strikethrough as default card state | **must verify** | `PRODUCT.md` §Factual Honesty: honest compare-at only |
| C4 | `SAVE 18%` badge on every card | **must verify** | A badge on everything is not a signal |
| C5 | Hover-revealed ADD TO CART on cards | **must verify** | No hover on touch — dead on 90% of traffic |
| C6 | `font-weight: 900` extended heavy wordmark | **must verify** | Wrong voice for a craft label |
| C7 | Glassmorphism header (`backdrop-filter`) | **must verify** | Per-frame blur cost on mid-range Android for no legibility gain |
| C8 | Bundled EMI / Snapmint BNPL widget | **must verify** | Puts a credit product in the buy flow — a commercial decision, needs your explicit call |
| C9 | Full-height hero + 3 promo banners before any product | **[CONFIRMED PRESENT]** 2.8 screens | The spec's core structural error, now measured in the build |
| C10 | Desktop mega-menu with 3 columns + collage | keep current desktop nav | Not the target device |

> The **[must verify]** rows exist because I refused them on paper while the
> code was being written by another agent. They need a grep + a visual pass
> before this doc can claim they are absent. Doing that check is Phase 1 work,
> not an assumption.

---

## D. Open questions — needed before Phase 2

| # | Question | Blocks | Default |
|---|---|---|---|
| Q1 | **Delete `CategorySplitBanners`?** (−1.7 screens) | The single biggest win available | Delete |
| Q2 | **Collapse 4 product rails → 1 New-In rail of 8?** (−700 words) | Second biggest win | Collapse |
| Q3 | **Gender-first nav → universe-first?** | Contradicts `PRODUCT.md`; reversing is cheap now, expensive later | Revert to universe-first |
| Q4 | **EMI / BNPL widget: in scope?** | Commercial + regulatory | Excluded |
| Q5 | **Marquee vs static?** | Top 26px of every screen | Static |
| Q6 | **Is `/styles` in scope?** It is 12.7 screens — the worst route | Nobody has looked at it | In scope |

---

## E. Sequence

| Phase | Work | Gate |
|---|---|---|
| 0 | This audit + render deck + decisions + budget harness | **done** — gate built, baseline recorded, current build fails |
| 1 | Verify the [must verify] refusals actually stayed out. Then: tab audit → 0 sub-44px targets | `check-mobile.mjs` clean on touch |
| 2 | Home: delete split banners, collapse rails, cut hero → ≤4 screens / ≤350 words | Budget met at 390px |
| 3 | `/styles` rebuild (12.7 → ≤3.5) | Third-worst route fixed |
| 4 | PLP card payload trim, filter sheet restyle | card = 2 text lines |
| 5 | PDP sticky bar verification, size guide, accordions | sticky CTA in all scroll positions |
| 6 | Desktop pass ≥1024px | no regression vs `main` |

Phase 1 is a verification pass before a rebuild, because state B was written
against a spec that was never checked for licence, palette or touch compliance.

