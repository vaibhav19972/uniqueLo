# 00 — Mobile-First Audit & Verdict on the Bonkers Spec

> Measured 2026-11-03 at 390×844 against the live dev server (`:5177`) using
> `scripts/check-mobile.mjs` — a real headless Chrome, `getBoundingClientRect()`
> and `innerText`. No mock, no estimate.
>
> **Read §1 before anything else: there are three states of this codebase in
> play, and two of them were measured.** Mixing them up produces the wrong
> conclusion.

---

## 1. Three states, two measured

| # | State | Where | Length @390 | Words | Verdict |
|---|---|---|---:|---:|---|
| **A** | Editorial home (the old build) | branch `main` / commit `95bd16e` | **9,737px (11.5 screens)** | **1,784** | the problem the brief described |
| **B** | Bonkers 1:1 build (**current working tree**) | branch `bonkers` + uncommitted edits | **6,797px (8.05 screens)** | **1,213** | shipped, measured, **still 2× over target** |
| **C** | Target | this doc | **≤3,400px (≤4 screens)** | **≤350** | not yet built |

State B landed in commit `51e5486` ("mobile-first D2C architecture modeled 1:1
on Bonkers Corner") during this session. **The brief was written against state
A.** By the time the Bonkers spec arrived, an implementation of that spec was
already on disk.

This matters because B did genuinely help:

| | A (editorial) | B (Bonkers) | Δ |
|---|---:|---:|---:|
| Home length | 11.5 screens | **8.05 screens** | **−30%** |
| Home words | 1,784 | **1,213** | **−32%** |
| Tap targets <44px (home) | 117 | 117 | 0% |
| `/shop` words | 1,180 | 1,183 | +0.3% |
| `/styles` length | — | **12.7 screens** | worst route in the app |

So B is a real improvement on A and should be kept as a base. It is **not** a
solution: 8 screens of scroll and 1,213 words is still 2× the target on both
axes, and it introduced a new worst-offender (`/styles` at 12.7 screens).

---

## 2. State B measured, section by section

Home, 6,797px total, 1,213 words:

| top | height | screens | words | imgs | section |
|---:|---:|---:|---:|---:|---|
| 205 | 758 | 0.9 | 16 | 3 | HeroBannerCarousel |
| 963 | **1,439** | **1.7** | 26 | 3 | **CategorySplitBanners** (3 × 4:5) |
| 2,402 | 412 | 0.5 | 215 | 12 | New In rail |
| 2,814 | 396 | 0.5 | 211 | 12 | Best Seller rail |
| 3,210 | 396 | 0.5 | 212 | 12 | Shop Women rail |
| 3,606 | 396 | 0.5 | 206 | 12 | Shop Men rail |
| 4,002 | 791 | 0.9 | 55 | 1 | Our Story |
| 4,793 | 542 | 0.6 | 106 | 3 | Latest News |
| 5,336 | 349 | 0.4 | 106 | 0 | Testimonials |
| 5,685 | 326 | 0.4 | 59 | 0 | Trust badges |

**Four findings, in order of severity:**

1. **`CategorySplitBanners` is 1,439px — 1.7 screens — for 26 words.** It is the
   second-largest block on the page and does nothing but say `SHOP MENS /
   SHOP WOMENS / EXPLORE NEW IN`. This was flagged in the spec review (§3) as
   the single worst structural item, and it is now the worst block in the build.
2. **The four product rails carry 844 words between them — 70% of the page.**
   Not from prose: from four near-identical rails each shipping 12 cards with a
   large text payload per card. Four rails of the same catalogue is also a
   merchandising problem, not just a copy one.
3. **Zero products are visible until 2,402px — 2.8 screens of scroll.** A
   shopper who came to buy scrolls past a full-height hero and 1.7 screens of
   promo banners first.
4. **117 tap targets on home are still under 44×44.** State B did not address
   touch at all, despite the spec mandating it in §Global-4. Because the spec's
   own reference site (bonkerscorner.com) sits at **146/360 = 41% violations**,
   the rule was aspirational in the source too.

### `/styles` is now the worst route in the product

12.73 screens / 768 words against a 3.5-screen budget. It did not appear in the
original brief, and nothing in the Bonkers spec covers it, so it was never
touched — but it is where a user browses by intent, which makes it worse than
home being long.

---

## 3. Verdict on the Bonkers spec as a *blueprint*

The spec is a faithful description of bonkerscorner.com — its component names,
colour values and taxonomy match the live site. That is the problem: it
describes the thing that **measures 9,228px / 1,246 words / 10.9 screens** on
the same viewport. A faithful 1:1 port lands you at 8 screens, which is what
happened.

### Measured problems with adopting it as-is

**(a) Its layout arithmetic cannot meet the brief.**

| Block | Height | Spec basis |
|---|---:|---|
| Chrome (marquee 32 + app banner 64 + header 52+44) | 192px | §2.1–2.3 |
| Hero | 748px | `calc(100dvh - 96px)` §3.1 |
| 3 × category split banners | 1,464px | 3 × `aspect-[4/5]` §3.2 |
| **Before the first product card** | **2,404px = 2.8 screens** | |
| Built result, measured | 2,402px | matches prediction within 2px |

The prediction and the build agree. The spec's own structure puts 2.8 screens of
chrome and promotion in front of the first sellable thing — and that is with a
catalogue of only 29 pieces, where scrolling to browse has no upside.

**(b) Three of its colour tokens fail WCAG AA.**

| Spec token | Value | On `#FFF` | On our cream `#F4EFE4` |
|---|---|---:|---:|
| `--price-sale` | `#D32F2F` | 4.98 pass | **4.34 FAIL** |
| `--text-muted` | `#888888` | **3.54 FAIL** | **3.09 FAIL** |
| strikethrough MRP | `#999999` | **2.85 FAIL** | **2.47 FAIL** |

`#888` and `#999` fail on pure white. Our existing muted (`#5F5747`, 6.23:1) and
accent (`#A4322A`, 5.97:1) already pass. **Keep our palette.**

**(c) Its own reference fails its own rule.** 44×44 is mandated in
§Global-4; live bonkerscorner.com violates it on 41% of interactive elements.
We enforce it with `scripts/check-mobile.mjs`, not with a promise.

**(d) Wrong taxonomy.** Gender-first (WOMEN/MEN/ACCESSORIES) contradicts
`PRODUCT.md`, which defines **universe × presence (Quiet/Balanced/Loud)** as the
primary axes.

**(e) Licence risk.** The spec hard-codes Marvel, Disney, Harry Potter,
SpongeBob, Naruto, Looney Tunes rows. `PRODUCT.md` §Capabilities: **original
inspired-by artwork only, no unlicensed IP.** Not portable.

### What survives, and is being kept from state B

| Item | Why |
|---|---|
| Mobile-first authoring order | Correct, and it landed |
| `scroll-snap-type: x mandatory` + hidden scrollbars | Native rails, no JS |
| `overflow-x: hidden` | No horizontal overflow measured on any route |
| Sticky PDP bottom bar | Highest-value item in the spec |
| Sticky PLP filter/sort bar | Standard, expected |
| Quick-view `SelectOptionsModal` sheet | Good conversion pattern |
| Cart drawer with coupon + slip progress | Keep |
| Footer accordions on mobile | Reduces footer height |
| `useUIStore` | Correct consolidation |

---

## 4. The correction: length is the target, not style

We are not trying to look like Bonkers. We are trying to get a 90%-mobile
audience to a product in as few thumb-swipes as possible.

| Metric | A (editorial) | B (bonkers, now) | **C (target)** |
|---|---:|---:|---:|
| Home screens | 11.5 | 8.05 | **≤4.0** |
| Home words | 1,784 | 1,213 | **≤350** |
| Hero + chrome before first product | ~1 screen | **2.8 screens** | **≤1.0 screen** |
| Announcement | clipped marquee | marquee | **1 static line** |
| Header | 105px | 2 rows + app banner | **≤56px** |
| Products on home | 25 | 48 (4×12) | **≤8** |
| Tap targets <44px (home) | 117 | 117 | **0** |
| Bottom nav | none | **5 tabs ✓** | keep |
| `/styles` screens | — | 12.73 | **≤3.5** |

The three moves that get from B to C, in order of payoff:

1. **Delete `CategorySplitBanners`** (−1,439px, −1.7 screens, −26 words). It is
   promotion instead of navigation, and garment tiles do the same job in 120px.
2. **Collapse four product rails into one "New In" rail of 8** (−1,400px,
   −700 words). `/shop` already carries the full catalogue and is one tap away.
3. **Cut the hero to a 4:5 plate with no full-height claim** (−250px), so the
   first product sits inside screen one.

Together: 6,797 − 3,089 ≈ **3,700px (4.4 screens)**, and words fall to roughly
**480**. The remaining gap to 350 is card copy trimming and the Our Story block.

---

## 5. Enforcement

Design intent that is not measured drifts — state B proves it: a spec that
mandates 44px targets shipped with 117 violations on home.

Two gates, both already built and both failing today:

1. **`scripts/check-mobile.mjs`** — headless Chrome over CDP, zero dependencies
   (uses Node's built-in `WebSocket`). Fails on page length, word count,
   horizontal overflow, and sub-44px targets. Budgets in one reviewable table at
   the top of the file. Verified: exits 1 against the current build.
2. **`scripts/mobile-breakdown.mjs`** — the same harness, reporting per-section
   height/word/img counts, so a regression can be attributed to a component
   rather than to "the page got longer".

Both are pointed at the real server. `scripts/mobile-baseline.json` holds the
state-B numbers as the "before" record.

> Honest limitation: the word counter reads `main.innerText`, so it counts
> screen-reader duplicates and off-screen carousel slides. That is why the same
> four rails read 844 words. It over-counts slightly against what a human reads,
> which is the safe direction for a budget gate — it fails early rather than late.
