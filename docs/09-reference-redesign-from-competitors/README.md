# 09 — Reference Redesign from Competitors

> **Competitor-inspired redesign dock.**
> Purpose: study what other apparel businesses do well (conversion, trust,
> retention, discovery), then adapt — never copy — into UniqueLo's India-first
> mass-premium embroidered catalogue.
> First reference: **The Souled Store (thesouledstore.com)** — India's largest
> pop-culture apparel brand. Men's / women's tops & bottoms, hoodies, t-shirts,
> shirts, sweatshirts, pullovers, tops, skirts, bottoms.

## Why this dock exists

UniqueLo sits **in the same price conversation** as The Souled Store, not apart
from it. That is the correction this dock now reflects (see `00`).

| Dimension | The Souled Store | UniqueLo (our lane) |
|---|---|---|
| Promise | Fun, fandom, affordable self-expression | Original embroidery craft + fandom storytelling |
| IP | Official licensed merch (Marvel, Disney, HP…) | **Original inspired-by only — no unlicensed IP** |
| Visual energy | Loud, dense, discount-stickered | Craft-forward, denser than luxury, no fake discount pressure |
| Price logic | ₹499–₹1,699, constant %OFF | **₹699–₹3,999, median ₹1,200–1,400**, honest compare-at only |

We study them for **mechanics** (PDP anatomy, trust, loyalty, sizing, retention,
filter model), not for **aesthetic**. Every adoption below is re-voiced into
UniqueLo's own language and gated by `PRODUCT.md` + `02-design-system`.

The distinction that still holds: we reject their **discount-sticker density and
licensed IP**, not their price band.

## Contents

| File | What it covers |
|---|---|
| [00 — Positioning reframe](./00-positioning-reframe.md) | **Read first.** Measured ₹1,799–5,499 catalog vs stated ₹500–3,000 target; real buyer tiers; what competitor study is now for |
| [01 — Souled Store teardown](./01-thesouledstore-teardown.md) | Design philosophy, IA, homepage/PLP/PDP, commerce & retention engine |
| [02 — Article presentation analysis](./02-article-presentation-pdp-plp.md) | How they present a single article (garment), block by block, with screenshots-as-text |
| [03 — Pick-and-place for UniqueLo](./03-pick-and-place-for-uniquelo.md) | What's worth borrowing, what to deliberately reject, luxury-adapted patterns |
| [04 — Implementation roadmap](./04-implementation-roadmap.md) | Phased plan: quick wins → loyalty/membership → UGC/social proof, with acceptance gates |
| [05 — Myntra teardown](./05-myntra-teardown.md) | PLP density, filter model, size guidance, trust surfaces — **skeleton, awaiting screenshots** |
| [06 — Capture → schema workflow](./06-capture-to-schema-workflow.md) | How to turn screenshots into block order + data fields (the template to use for 05 and beyond) |

## How to use this dock

1. **Read 00 first.** It records the pivot away from quiet-luxury and the
   confirmed band (**₹600–700 entry, ₹1,200–1,400 median, ₹3,000–4,000
   ceiling**). `STAR_GOAL.md` and `docs/02` have already been amended to match,
   so any conclusion in 01–04 that assumed atelier luxury must be re-checked
   against the new band before it is built.
2. Read 01 → 02 for evidence.
3. 03 is the decision log — `Adopt / Adapt / Reject` per pattern.
4. 04 turns Adopt/Adapt items into build tasks. Nothing builds until it passes
   the quality checklist in `docs/README.md §4` (tokens, `data.ts`, a11y, build green).
5. New competitors get `05-<name>-teardown.md` + rows in 03/04 — same format.
6. **Pick the instrument deliberately** (00 §6): screenshots for structure and
   schema, decompilation only for logic that screenshots cannot reveal. Never
   decompile for visual design.

## Sources (Oct 2026)

- https://www.thesouledstore.com/ (homepage, nav, trust strip)
- https://www.thesouledstore.com/product/supima-cotton-nude-pink-drop-cut-tshirt (PDP anatomy)
- https://www.thesouledstore.com/product/supima-wine-red-men-supima-t-shirts (variant/size coverage)
- https://www.thesouledstore.com/membership (₹149/3-mo, ₹199/12-mo member pricing)
- https://www.thesouledstore.com/about-us (philosophy: "follow your soul", neighbourhood vibe)
- prod-img.thesouledstore.com/reward-points (Soldier/Captain/General + referral program)

> Site is JS-heavy; web-fetch returns shell only. PDP/PLP structure verified via
> search-index excerpts + membership/rewards pages (full text captured Oct 2026).
> Re-verify live before pixel-level build.
