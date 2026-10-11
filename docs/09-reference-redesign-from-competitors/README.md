# 09 — Reference Redesign from Competitors

> **Competitor-inspired redesign dock.**
> Purpose: study what mass-market leaders do well (conversion, trust, retention),
> then adapt — never copy — into UniqueLo's quiet-luxury embroidery flagship.
> First reference: **The Souled Store (thesouledstore.com)** — India's largest
> pop-culture apparel brand. Men's / women's tops & bottoms, hoodies, t-shirts,
> shirts, sweatshirts, pullovers, tops, skirts, bottoms.

## Why this dock exists

UniqueLo is positioned opposite to The Souled Store:

| Dimension | The Souled Store | UniqueLo (our lane) |
|---|---|---|
| Promise | Fun, fandom, affordable self-expression | Haute-craft embroidery, heirloom garments |
| IP | Official licensed merch (Marvel, Disney, HP…) | **Original inspired-by only — no unlicensed IP** |
| Visual energy | Loud, dense, discount-stickered | Refined Editorial Minimal, one accent per viewport |
| Price logic | ₹499–₹1,699, constant %OFF | Atelier pricing, honest compare-at, certificate included |

We study them for **mechanics** (PDP anatomy, trust, loyalty, sizing, retention),
not for **aesthetic**. Every adoption below is re-voiced into atelier language
and gated by `PRODUCT.md` principles + `02-design-system` restraint rules.

## Contents

| File | What it covers |
|---|---|
| [01 — Souled Store teardown](./01-thesouledstore-teardown.md) | Design philosophy, IA, homepage/PLP/PDP, commerce & retention engine |
| [02 — Article presentation analysis](./02-article-presentation-pdp-plp.md) | How they present a single article (garment), block by block, with screenshots-as-text |
| [03 — Pick-and-place for UniqueLo](./03-pick-and-place-for-uniquelo.md) | What's worth borrowing, what to deliberately reject, luxury-adapted patterns |
| [04 — Implementation roadmap](./04-implementation-roadmap.md) | Phased plan: quick wins → loyalty/membership → UGC/social proof, with acceptance gates |

## How to use this dock

1. Read 01 → 02 for evidence.
2. 03 is the decision log — `Adopt / Adapt / Reject` per pattern.
3. 04 turns Adopt/Adapt items into build tasks. Nothing builds until it passes
   the quality checklist in `docs/README.md §4` (tokens, `data.ts`, a11y, build green).
4. New competitors get `05-<name>-teardown.md` + rows in 03/04 — same format.

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
